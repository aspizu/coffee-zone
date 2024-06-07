from reproca.method import method
from datetime import datetime


@method
async def hello() -> str:
    return f"Hello, world! It is {datetime.now().isoformat()}."
