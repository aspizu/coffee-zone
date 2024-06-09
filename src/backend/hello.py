from reproca.method import method

from .db import db


@method
async def hello() -> str:
    async with await db() as con, con.cursor() as cur:
        await cur.execute("select * from account")
        return repr(await cur.fetchone())
