import contextlib

from psycopg.errors import ForeignKeyViolation
from reproca.method import method

from .db import db
from .misc import seconds_since_1970
from .models import Session

MAX_CONTENT_LEN = 4096


@method
async def create_reply(session: Session, comment_id: int, content: str) -> int | None:
    if len(content) > MAX_CONTENT_LEN:
        return None
    async with await db() as con, con.cursor() as cur:
        row = None
        with contextlib.suppress(ForeignKeyViolation):
            await cur.execute(
                """
                insert into reply (
                    author,
                    comment,
                    content,
                    created_at
                )
                values (
                    %(author)s,
                    %(comment_id)s,
                    %(content)s,
                    %(created_at)s
                )
                returning id
                """,
                dict(
                    author=session.id,
                    comment_id=comment_id,
                    content=content,
                    created_at=seconds_since_1970(),
                ),
            )
            row = await cur.fetchone()
        if row is None:
            return None
        return row.id


@method
async def upvote_reply(session: Session, reply_id: int) -> None:
    async with await db() as con, con.cursor() as cur:
        with contextlib.suppress(ForeignKeyViolation):
            await cur.execute(
                """
                insert into reply_vote (voter, reply, vote)
                values (%(voter)s, %(reply)s, 1)
                on conflict (voter, reply) do update set vote = 1
                """,
                dict(voter=session.id, reply=reply_id),
            )


@method
async def downvote_reply(session: Session, reply_id: int) -> None:
    async with await db() as con, con.cursor() as cur:
        with contextlib.suppress(ForeignKeyViolation):
            await cur.execute(
                """
                insert into reply_vote (voter, reply, vote)
                values (%(voter)s, %(reply)s, -1)
                on conflict (voter, reply) do update set vote = -1
                """,
                dict(voter=session.id, reply=reply_id),
            )
