import os

from dotenv import load_dotenv

load_dotenv()

VITE_BACKEND = os.environ["VITE_BACKEND"]
FRONTEND = os.environ["FRONTEND"]
MEMCACHE_SERVERS = os.environ["MEMCACHE_SERVERS"].split(",")
MEMCACHE_USERNAME = os.environ["MEMCACHE_USERNAME"]
MEMCACHE_PASSWORD = os.environ["MEMCACHE_PASSWORD"]
DB = os.environ["DB"]
SMTP_HOST = os.environ["SMTP_HOST"]
SMTP_PORT = int(os.environ["SMTP_PORT"])
SMTP_EMAIL = os.environ["SMTP_EMAIL"]
SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]
