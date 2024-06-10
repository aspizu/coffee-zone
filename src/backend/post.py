import contextlib

from msgspec import Struct
from psycopg.errors import ForeignKeyViolation

from reproca.method import method

from .db import db
from .misc import seconds_since_1970
from .models import Comment, Post, Reply, Session, Vote

MIN_BOARD_LEN = 3
MAX_BOARD_LEN = 32


def is_board_ok(board: str) -> bool:
    return MIN_BOARD_LEN <= len(board) <= MAX_BOARD_LEN and board.isalpha()


MAX_CONTENT_LEN = 4096


@method
async def create_post(session: Session, board: str, content: str) -> int | None:
    if not is_board_ok(board) or len(content) > MAX_CONTENT_LEN:
        return None
    async with await db() as con, con.cursor() as cur:
        await cur.execute(
            "select id from board where name = %(name)s", dict(name=board)
        )
        row = await cur.fetchone()
        if row is None:
            return None
        board_id = row.id
        await cur.execute(
            """
            insert into post (
                author,
                board,
                content,
                created_at
            )
            values (
                %(author)s,
                %(board)s,
                %(content)s,
                %(created_at)s
            )
            returning id
            """,
            dict(
                author=session.id,
                board=board_id,
                content=content,
                created_at=seconds_since_1970(),
            ),
        )
        row = await cur.fetchone()
        assert row is not None
        return row.id


@method
async def upvote_post(session: Session, post_id: int) -> None:
    async with await db() as con, con.cursor() as cur:
        with contextlib.suppress(ForeignKeyViolation):
            await cur.execute(
                """
                insert into post_vote (voter, post, vote)
                values (%(voter)s, %(post)s, 1)
                on conflict (voter, post) do update set vote = 1
                """,
                dict(voter=session.id, post=post_id),
            )


@method
async def downvote_post(session: Session, post_id: int) -> None:
    async with await db() as con, con.cursor() as cur:
        with contextlib.suppress(ForeignKeyViolation):
            await cur.execute(
                """
                insert into post_vote (voter, post, vote)
                values (%(voter)s, %(post)s, -1)
                on conflict (voter, post) do update set vote = -1
                """,
                dict(voter=session.id, post=post_id),
            )


class GetPostValue(Struct):
    post: Post
    comments: list[Comment]


@method
async def get_post(session: Session | None, post_id: int) -> GetPostValue | None:
    async with await db() as con, con.cursor() as cur:
        await cur.execute(
            """
            select
                post.id,
                account.username as author_username,
                account.avatar as author_avatar,
                account.status as author_status,
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
                post.created_at
            from post
            join account on post.author = account.id
            join board on post.board = board.id
            where post.id = %(post_id)s
            """,
            dict(voter=session.id if session else None, post_id=post_id),
        )
        post = await cur.fetchone()
        if post is None:
            return None
        await cur.execute(
            """
            select
                comment.id,
                account.username as author_username,
                account.avatar as author_avatar,
                account.status as author_status,
                coalesce(
                    (select 'UPVOTE' from comment_vote
                    where comment = comment.id and voter = %(voter)s and vote = 1),
                    (select 'DOWNVOTE' from comment_vote
                    where comment = comment.id and voter = %(voter)s and vote = -1),
                    'NONE'
                ) as vote,
                coalesce(
                    (select sum(vote) from comment_vote where comment = comment.id),
                    0
                ) as score,
                comment.content,
                comment.created_at
            from comment
            join account on comment.author = account.id
            where comment.post = %(post_id)s
            order by score desc
            """,
            dict(
                voter=session.id if session else None,
                post_id=post_id,
            ),
        )
        comments = []
        for row in await cur.fetchall():
            await cur.execute(
                """
                select
                    reply.id,
                    account.username as author_username,
                    account.avatar as author_avatar,
                    account.status as author_status,
                    coalesce(
                        (select 'UPVOTE' from reply_vote
                        where reply = reply.id and voter = %(voter)s and vote = 1),
                        (select 'DOWNVOTE' from reply_vote
                        where reply = reply.id and voter = %(voter)s and vote = -1),
                        'NONE'
                    ) as vote,
                    coalesce(
                        (select sum(vote) from reply_vote where reply = reply.id),
                        0
                    ) as score,
                    reply.content,
                    reply.created_at
                from reply
                join account on reply.author = account.id
                where reply.comment = %(comment_id)s
                order by score desc
                """,
                dict(
                    voter=session.id if session else None,
                    comment_id=row.id,
                ),
            )
            replies = [
                Reply(
                    id=reply.id,
                    author_username=reply.author_username,
                    author_avatar=reply.author_avatar,
                    author_status=reply.author_status,
                    vote=Vote[reply.vote],
                    score=reply.score,
                    content=reply.content,
                    created_at=reply.created_at,
                )
                for reply in await cur.fetchall()
            ]
            comments.append(
                Comment(
                    id=row.id,
                    author_username=row.author_username,
                    author_avatar=row.author_avatar,
                    author_status=row.author_status,
                    vote=Vote[row.vote],
                    score=row.score,
                    content=row.content,
                    created_at=row.created_at,
                    reply_count=len(replies),
                    replies=replies,
                )
            )
    return GetPostValue(
        Post(
            id=post.id,
            author_username=post.author_username,
            author_avatar=post.author_avatar,
            author_status=post.author_status,
            vote=Vote[post.vote],
            score=post.score,
            board=post.board,
            content=post.content,
            created_at=post.created_at,
            comment_count=len(comments),
        ),
        comments,
    )
