import psycopg
import psycopg.rows

from . import env


async def db():
    return await psycopg.AsyncConnection.connect(
        dbname=env.DBNAME, row_factory=psycopg.rows.namedtuple_row
    )
