# app/database/session.py

from urllib.parse import unquote

from sqlalchemy.engine import URL
from sqlalchemy.pool import NullPool
from sqlmodel import create_engine, Session

from app.core.config import settings

 
# ──────────────────────────────────────────────────────────────
# Robust URL parsing
#
# Supabase (and many other providers) hand out passwords that
# contain `@`, `:`, `$`, `#`, `/`, etc. If those characters are
# not URL-encoded, SQLAlchemy's parser can push the password into
# the port slot — producing:
#
#     ValueError: invalid literal for int() with base 10:
#         'H8t3e$AG79y.'
#
# We sidestep the whole class of bugs by extracting the pieces
# ourselves and rebuilding a canonical URL via URL.create(),
# which re-encodes the password correctly.
#
# Strategy:
#   • scheme://rest?query
#   • split rest on the LAST '@'  → auth vs host-part
#     (hostnames never contain '@', so this is safe even when the
#      password itself does)
#   • split auth on the FIRST ':' → user vs password
#     (usernames never contain ':')
#   • split host-part on the first '/' → host:port vs database
#   • strip port; fall back to no-port if the tail isn't numeric
# ──────────────────────────────────────────────────────────────

def _build_url(raw: str) -> URL:
    if not raw or not raw.strip():
        raise RuntimeError(
            "DATABASE_URL is empty. Set it in your environment "
            "(Render → Environment, or your local .env)."
        )

    raw = raw.strip()

    scheme, sep, rest = raw.partition("://")
    if not sep or not scheme or not rest:
        raise RuntimeError(f"DATABASE_URL is malformed: {raw!r}")

    # Split off the query string.
    rest, _, query = rest.partition("?")
    params: dict[str, str] = {}
    if query:
        for pair in query.split("&"):
            if not pair:
                continue
            k, _, v = pair.partition("=")
            if k:
                params[unquote(k)] = unquote(v)

    # auth@hostpart  (split on LAST '@' — hosts never contain '@')
    if "@" not in rest:
        raise RuntimeError(
            f"DATABASE_URL is missing credentials (no '@'): {raw!r}"
        )
    auth, _, hostpart = rest.rpartition("@")

    # user:password  (split on FIRST ':' — users never contain ':')
    user, sep, password = auth.partition(":")
    if not sep:
        user, password = auth, ""

    # host[:port][/database]
    hostport, _, database = hostpart.partition("/")

    # IPv6 hosts are wrapped in brackets: [::1]:5432
    if hostport.startswith("["):
        host, _, remainder = hostport.partition("]")
        host = host[1:]
        port = remainder.lstrip(":")
    else:
        host, _, port = hostport.rpartition(":")
        if not port.isdigit():
            # Not a real port — the ':' was part of something else.
            host, port = hostport, ""

    if not host:
        raise RuntimeError(f"DATABASE_URL is missing a host: {raw!r}")

    try:
        port_int = int(port) if port else None
    except ValueError as exc:
        raise RuntimeError(
            f"DATABASE_URL has an invalid port {port!r}. "
            f"This usually means the password is not URL-encoded. "
            f"Raw URL: {raw!r}"
        ) from exc

    # Normalise the driver name to psycopg 3 (what your app expects).
    drivername = scheme
    if drivername in ("postgres", "postgresql"):
        drivername = "postgresql+psycopg"
    elif drivername == "postgres+psycopg":
        drivername = "postgresql+psycopg"

    return URL.create(
        drivername=drivername,
        username=unquote(user) if user else None,
        password=unquote(password) if password else None,
        host=host,
        port=port_int,
        database=unquote(database) if database else None,
        query=params,
    )


# ──────────────────────────────────────────────────────────────
# Engine construction
#
#   • Transaction pooler (port 6543)
#       → pgbouncer handles pooling. Use NullPool so we don't
#         double-pool, and disable psycopg 3's client-side
#         prepared-statement cache via prepare_threshold=None.
#
#   • Session pooler OR direct (port 5432)
#       → We pool ourselves, conservatively.
# ──────────────────────────────────────────────────────────────

DATABASE_URL: URL = _build_url(settings.DATABASE_URL)

is_transaction_pooler = DATABASE_URL.port == 6543
is_development = settings.environment.lower() == "development"


if is_transaction_pooler:
    # ── Transaction pooler mode ────────────────────────────
    engine = create_engine(
        DATABASE_URL,
        echo=is_development,
        poolclass=NullPool,
        connect_args={
            # ✅ Correct for psycopg 3 + pgbouncer (transaction mode).
            # Disables the client-side prepared-statement cache so we
            # never send named statements like "_pg3_0" to pgbouncer.
            "prepare_threshold": None,
        },
    )
else:
    # ── Session pooler / direct mode ───────────────────────
    engine = create_engine(
        DATABASE_URL,
        echo=is_development,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=3,
        pool_timeout=10,
        pool_recycle=1800,
    )


def get_session():
    """FastAPI dependency — yields a scoped DB session."""
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()