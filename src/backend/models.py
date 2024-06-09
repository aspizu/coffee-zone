from msgspec import Struct


class Session(Struct):
    id: int
    username: str
    email: str
    avatar: str
    status: str
    created_at: int
    last_login_at: int
    role: str
