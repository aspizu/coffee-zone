from pathlib import Path

from reproca.app import App
from reproca.code_generation import CodeGenerator
from reproca.memcache import Memcache
from reproca.method import methods
from reproca.sessions import Sessions

from . import env
from .models import Session

memcache = Memcache(env.MEMCACHE)
sessions: Sessions[int, Session] = Sessions(memcache)

from . import hello, user

__all__ = ["hello", "user"]

with Path("src/frontend/api.ts").open("w") as file:
    code_generator = CodeGenerator(file)
    code_generator.write(
        'import {type MethodResult, App} from "reproca/app";\n',
        "const app = new App(import.meta.env.VITE_BACKEND);\n",
    )
    for method in methods.values():
        code_generator.method(method)
    code_generator.resolve()

app = App(sessions, memcache)
