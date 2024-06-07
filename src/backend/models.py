from secrets import token_urlsafe

from msgspec import Struct, field


class Session(Struct):
    username: str
