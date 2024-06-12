import contextlib
import random
import secrets
from email.message import EmailMessage
from enum import StrEnum, auto

import aiosmtplib
import argon2
import emoji
from msgspec import UNSET, UnsetType
from psycopg.errors import UniqueViolation

from reproca.credentials import Credentials
from reproca.method import method, rate_limit
from reproca.result import Err, Ok, Result

from . import env, sessions
from .db import db
from .misc import seconds_since_1970
from .models import Post, Session, User, Vote

ph = argon2.PasswordHasher()

emojis = list(emoji.EMOJI_DATA.keys())

VERIFICATION_MAIL_TEMPLATE = """
Hello {username},

Please verify your account by clicking the following link:

{host}/verify/{verification_token}

If you did not register for an account, please ignore this email.
"""[1:-1]


async def send_verification_email(
    username: str, email: str, verification_token: str
) -> None:
    message = EmailMessage()
    message["From"] = env.SMTP_EMAIL
    message["To"] = email
    message["Subject"] = "Verify your coffeezone account"
    message.set_content(
        VERIFICATION_MAIL_TEMPLATE.format(
            username=username, host=env.FRONTEND, verification_token=verification_token
        )
    )
    await aiosmtplib.send(
        message,
        hostname=env.SMTP_HOST,
        port=env.SMTP_PORT,
        username=env.SMTP_EMAIL,
        password=env.SMTP_PASSWORD,
    )


@rate_limit(60)
@method
async def verify(verification_token: str) -> None:
    async with await db() as con, con.cursor() as cur:
        await cur.execute(
            """
            update account set verification = 'verified'
            where verification = %(verification_token)s
            """,
            dict(verification_token=verification_token),
        )


class RegisterError(StrEnum):
    INVALID_FORMAT = auto()
    USERNAME_TAKEN = auto()
    EMAIL_TAKEN = auto()


MIN_USERNAME_LENGTH = 3
MAX_USERNAME_LENGTH = 64
MIN_PASSWORD_LENGTH = 8
COMMON_PASSWORDS = {
    "passphrase",
    "password",
    "12345678",
    "password1",
    "password123",
    "password1234",
    "password12345",
}


def is_username_ok(username: str) -> bool:
    return (
        username.isalpha()
        and MIN_USERNAME_LENGTH <= len(username) <= MAX_USERNAME_LENGTH
    )


def is_password_ok(password: str) -> bool:
    return len(password) >= MIN_PASSWORD_LENGTH and password not in COMMON_PASSWORDS


def is_email_ok(email: str) -> bool:
    return "@" in email


@rate_limit(60)
@method
async def register(
    username: str, password: str, email: str
) -> Result[int, RegisterError]:
    username = username.strip().lower()
    password = password.strip()
    email = email.strip()
    if not (
        is_username_ok(username) and is_password_ok(password) and is_email_ok(email)
    ):
        return Err(RegisterError.INVALID_FORMAT)
    verification_token = secrets.token_urlsafe()
    async with await db() as con, con.cursor() as cur:
        try:
            await cur.execute(
                """
            insert into account (
                username,
                password_hash,
                email,
                avatar,
                status,
                created_at,
                last_login_at,
                role,
                verification
            )
            values (
                %(username)s,
                %(password_hash)s,
                %(email)s,
                %(avatar)s,
                %(status)s,
                %(created_at)s,
                %(last_login_at)s,
                %(role)s,
                %(verification)s
            )
            returning id
            """,
                dict(
                    username=username,
                    password_hash=ph.hash(password),
                    email=email,
                    avatar="emoji:" + random.choice(emojis),
                    status="",
                    created_at=seconds_since_1970(),
                    last_login_at=seconds_since_1970(),
                    role="U",
                    verification=verification_token,
                ),
            )
        except UniqueViolation as err:
            if not err.diag.message_primary:
                raise
            if "username" in err.diag.message_primary:
                return Err(RegisterError.USERNAME_TAKEN)
            if "email" in err.diag.message_primary:
                return Err(RegisterError.EMAIL_TAKEN)
            raise
        account = await cur.fetchone()
    assert account is not None
    await send_verification_email(username, email, verification_token)
    return Ok(account.id)


class LoginResult(StrEnum):
    OK = auto()
    INCORRECT_PASSWORD = auto()
    VERIFICATION_REQUIRED = auto()


@method
async def login(credentials: Credentials, username: str, password: str) -> LoginResult:
    username = username.strip().lower()
    password = password.strip()
    if not (is_username_ok(username) and is_password_ok(password)):
        return LoginResult.INCORRECT_PASSWORD
    async with await db() as con, con.cursor() as cur:
        await cur.execute(
            "select * from account where username = %(username)s",
            dict(username=username),
        )
        account = await cur.fetchone()
        if account is None:
            return LoginResult.INCORRECT_PASSWORD
        if account.verification != "verified":
            return LoginResult.VERIFICATION_REQUIRED
        await cur.execute(
            "update account set last_login_at = %(last_login_at)s where id = %(id)s",
            dict(last_login_at=seconds_since_1970(), id=account.id),
        )
        try:
            ph.verify(account.password_hash, password)
        except argon2.exceptions.VerifyMismatchError:
            return LoginResult.INCORRECT_PASSWORD
        if ph.check_needs_rehash(account.password_hash):
            await cur.execute(
                """
                update account set password_hash = %(password_hash)s where id = %(id)s
                """,
                dict(password_hash=ph.hash(password), id=account.id),
            )
    credentials.set_session(
        sessions.create(
            account.id,
            Session(
                id=account.id,
                avatar=account.avatar,
                created_at=account.created_at,
                email=account.email,
                last_login_at=account.last_login_at,
                status=account.status,
                username=account.username,
                role=account.role,
            ),
        )
    )
    return LoginResult.OK


@method
async def logout(credentials: Credentials) -> None:
    if sessionid := credentials.get_session():
        sessions.remove_by_sessionid(sessionid)
    credentials.set_session(None)


@rate_limit(60)
@method
async def update_email(
    credentials: Credentials, username: str, password: str, email: str
) -> bool:
    """
    Returns True if email was updated, False if either username or password was
    incorrect or account does not exist.
    """
    if not (
        is_username_ok(username) and is_password_ok(password) and is_email_ok(email)
    ):
        return False
    verification_token = secrets.token_urlsafe()
    async with await db() as con, con.cursor() as cur:
        await cur.execute(
            "select * from account where username = %(username)s",
            dict(username=username),
        )
        account = await cur.fetchone()
        if account is None:
            return False
        try:
            ph.verify(account.password_hash, password)
        except argon2.exceptions.VerifyMismatchError:
            return False
        await cur.execute(
            """
            update account set email = %(email)s, verification = %(verification)s
            where username = %(username)s
            """,
            dict(username=username, email=email, verification=verification_token),
        )
        if cur.rowcount == 0:
            return False
    await send_verification_email(username, email, verification_token)
    if sessionid := credentials.get_session():
        sessions.remove_by_sessionid(sessionid)
    credentials.set_session(None)
    return True


RESET_PASSWORD_MAIL_TEMPLATE = """
Hello {username},

Please reset your password by clicking the following link:

{host}/reset-password/{reset_token}

If you did not request this email, please ignore it.
"""[1:-1]


RESET_TOKEN_LENGTH = 32
RESET_TOKEN_EXPIRY = 3600


@rate_limit(60)
@method
async def reset_password(
    username: str | UnsetType = UNSET, email: str | UnsetType = UNSET
) -> None:
    account = None
    reset_token = f"{secrets.token_urlsafe(RESET_TOKEN_LENGTH)}:{seconds_since_1970()}"
    if username is not UNSET:
        username = username.strip().lower()
        if not is_username_ok(username):
            return
        async with await db() as con, con.cursor() as cur:
            await cur.execute(
                "select * from account where username = %(username)s",
                dict(username=username),
            )
            account = await cur.fetchone()
            if account is None:
                return
            await cur.execute(
                """
                update account set reset_token = %(reset_token)s where id = %(id)s
                """,
                dict(reset_token=reset_token, id=account.id),
            )
    elif email is not UNSET:
        email = email.strip()
        if not is_email_ok(email):
            return
        async with await db() as con, con.cursor() as cur:
            await cur.execute(
                "select * from account where email = %(email)s", dict(email=email)
            )
            account = await cur.fetchone()
            if account is None:
                return
            await cur.execute(
                """
                update account set reset_token = %(reset_token)s where id = %(id)s
                """,
                dict(reset_token=reset_token, id=account.id),
            )
    if account is None or account.verification != "verified":
        return
    message = EmailMessage()
    message["From"] = env.SMTP_EMAIL
    message["To"] = email
    message["Subject"] = "Reset your coffeezone account's password"
    message.set_content(
        RESET_PASSWORD_MAIL_TEMPLATE.format(
            username=username, host=env.FRONTEND, reset_token=reset_token
        )
    )
    await aiosmtplib.send(
        message,
        hostname=env.SMTP_HOST,
        port=env.SMTP_PORT,
        username=env.SMTP_EMAIL,
        password=env.SMTP_PASSWORD,
    )


@method
async def update_password(
    credentials: Credentials, reset_token: str, password: str
) -> None:
    if (
        ":" not in reset_token
        or len(reset_token) <= RESET_TOKEN_LENGTH
        or not is_password_ok(password)
    ):
        return
    reset_time = 0
    with contextlib.suppress(ValueError):
        reset_time = int(reset_token.split(":")[1])
    if seconds_since_1970() - reset_time > RESET_TOKEN_EXPIRY:
        return
    async with await db() as con, con.cursor() as cur:
        await cur.execute(
            """
            update account set password_hash = %(password_hash)s, reset_token = ''
            where reset_token = %(reset_token)s
            """,
            dict(password_hash=ph.hash(password), reset_token=reset_token),
        )
    if sessionid := credentials.get_session():
        sessions.remove_by_sessionid(sessionid)
    credentials.set_session(None)


MAX_URL_LENGTH = 1024


@method
async def update_avatar(
    credentials: Credentials, session: Session, avatar: str
) -> None:
    if len(avatar) > MAX_URL_LENGTH:
        return
    if avatar == "emoji:random":
        avatar = "emoji:" + random.choice(emojis)
    async with await db() as con, con.cursor() as cur:
        await cur.execute(
            "update account set avatar = %(avatar)s where id = %(id)s",
            dict(avatar=avatar, id=session.id),
        )
    sessionid = credentials.get_session()
    assert sessionid is not None
    session.avatar = avatar
    sessions.update_by_sessionid(sessionid, session)


MAX_STATUS_LENGTH = 128


@method
async def update_status(
    credentials: Credentials, session: Session, status: str
) -> None:
    if len(status) > MAX_STATUS_LENGTH:
        return
    async with await db() as con, con.cursor() as cur:
        await cur.execute(
            "update account set status = %(status)s where id = %(id)s",
            dict(status=status, id=session.id),
        )
    sessionid = credentials.get_session()
    assert sessionid is not None
    session.status = status
    sessions.update_by_sessionid(sessionid, session)


@method
async def get_session(session: Session | None) -> Session | None:
    return session


@method
async def get_user(session: Session | None, username: str) -> User | None:
    async with await db() as con, con.cursor() as cur:
        await cur.execute(
            """
            select
                id,
                avatar,
                status,
                created_at,
                last_login_at,
                coalesce(
                    (select sum(vote) from post_vote
                    join post on post.id = post_vote.post
                    where post.author = account.id),
                    0
                ) as karma
            from account
            where username = %(username)s
            """,
            dict(username=username),
        )
        account = await cur.fetchone()
        if account is None:
            return None
        await cur.execute(
            """
            select
                post.id,
                coalesce(
                    (select 'UPVOTE' from post_vote
                    where post = post.id and voter = %(voter)s and vote = 1),
                    (select 'DOWNVOTE' from post_vote
                    where post = post.id and voter = %(voter)s and vote = -1),
                    'NONE'
                ) as vote,
                coalesce(
                    (select sum(vote) from post_vote where post = post.id),
                    0
                ) as score,
                board.name as board,
                post.content,
                post.created_at,
                coalesce(
                    (select count(id) from comment where post = post.id),
                    0
                ) as comment_count
            from post
            join board on post.board = board.id
            where author = %(author)s
            order by score desc
            """,
            dict(
                voter=session.id if session else None,
                author=account.id,
            ),
        )
        posts = [
            Post(
                id=row.id,
                author_username=username,
                author_avatar=account.avatar,
                author_status=account.status,
                vote=Vote[row.vote],
                score=row.score,
                board=row.board,
                content=row.content,
                created_at=row.created_at,
                comment_count=row.comment_count,
            )
            for row in await cur.fetchall()
        ]
    return User(
        avatar=account.avatar,
        status=account.status,
        created_at=account.created_at,
        last_login_at=account.last_login_at,
        karma=account.karma,
        posts=posts,
    )
