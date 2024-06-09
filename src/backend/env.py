import os

from dotenv import load_dotenv

load_dotenv()

VITE_BACKEND = os.environ["VITE_BACKEND"]
FRONTEND = os.environ["FRONTEND"]
MEMCACHE = os.environ["MEMCACHE"]
DBNAME = os.environ["DBNAME"]
SMTP_HOST = os.environ["SMTP_HOST"]
SMTP_PORT = int(os.environ["SMTP_PORT"])
SMTP_EMAIL = os.environ["SMTP_EMAIL"]
SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]