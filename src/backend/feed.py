from reproca.method import method

from backend.models import Post, Session, Vote

from .db import db


@method
async def get_root_feed(session: Session | None) -> list[Post]:
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
                post.created_at,
                coalesce(
                    (select count(*) from comment where post = post.id),
                    0
                ) as comment_count
            from post
            join account on post.author = account.id
            join board on post.board = board.id
            order by score desc
            """,
            dict(voter=session.id if session else None),
        )
        rows = await cur.fetchall()
    return [
        Post(
            id=row.id,
            author_username=row.author_username,
            author_avatar=row.author_avatar,
            author_status=row.author_status,
            vote=Vote[row.vote],
            score=row.score,
            board=row.board,
            content=row.content,
            created_at=row.created_at,
            comment_count=row.comment_count,
        )
        for row in rows
    ]


@method
async def get_board_feed(session: Session | None, board: str) -> list[Post]:
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
                post.content,
                post.created_at,
                coalesce(
                    (select count(*) from comment where post = post.id),
                    0
                ) as comment_count
            from post
            join account on post.author = account.id
            where board = (select id from board where name = %(board)s)
            order by score desc
            """,
            dict(voter=session.id if session else None, board=board),
        )
        rows = await cur.fetchall()
    return [
        Post(
            id=row.id,
            author_username=row.author_username,
            author_avatar=row.author_avatar,
            author_status=row.author_status,
            vote=Vote[row.vote],
            score=row.score,
            board=board,
            content=row.content,
            created_at=row.created_at,
            comment_count=row.comment_count,
        )
        for row in rows
    ]
