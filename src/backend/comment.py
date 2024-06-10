import contextlib

from psycopg.errors import ForeignKeyViolation
from reproca.method import method

from backend.misc import seconds_since_1970
from backend.models import Session

from .db import db

MAX_CONTENT_LEN = 4096


@method
async def create_comment(session: Session, post_id: int, content: str) -> int | None:
    if len(content) > MAX_CONTENT_LEN:
        return None
    async with await db() as con, con.cursor() as cur:
        row = None
        with contextlib.suppress(ForeignKeyViolation):
            await cur.execute(
                """
                insert into comment (
                    author,
                    post,
                    content,
                    created_at
                )
                values (
                    %(author)s,
                    %(post_id)s,
                    %(content)s,
                    %(created_at)s
                )
                returning id
                """,
                dict(
                    author=session.id,
                    post_id=post_id,
                    content=content,
                    created_at=seconds_since_1970(),
                ),
            )
            row = await cur.fetchone()
        if row is None:
            return None
        return row.id


@method
async def upvote_comment(session: Session, comment_id: int) -> None:
    async with await db() as con, con.cursor() as cur:
        with contextlib.suppress(ForeignKeyViolation):
            await cur.execute(
                """
                insert into comment_vote (voter, comment, vote)
                values (%(voter)s, %(comment)s, 1)
                on conflict (voter, comment) do update set vote = 1
                """,
                dict(voter=session.id, comment=comment_id),
            )


@method
async def downvote_comment(session: Session, comment_id: int) -> None:
    async with await db() as con, con.cursor() as cur:
        with contextlib.suppress(ForeignKeyViolation):
            await cur.execute(
                """
                insert into comment_vote (voter, comment, vote)
                values (%(voter)s, %(comment)s, -1)
                on conflict (voter, comment) do update set vote = -1
                """,
                dict(voter=session.id, comment=comment_id),
            )
