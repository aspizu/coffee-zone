from enum import StrEnum, auto

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


class Vote(StrEnum):
    UPVOTE = auto()
    DOWNVOTE = auto()
    NONE = auto()


class Reply(Struct):
    id: int
    author_username: str
    author_avatar: str
    author_status: str
    vote: Vote
    score: int
    content: str
    created_at: int


class Comment(Struct):
    id: int
    author_username: str
    author_avatar: str
    author_status: str
    vote: Vote
    score: int
    content: str
    created_at: int
    reply_count: int
    replies: list[Reply]


class Post(Struct):
    id: int
    author_username: str
    author_avatar: str
    author_status: str
    vote: Vote
    score: int
    board: str
    content: str
    created_at: int
    comment_count: int
