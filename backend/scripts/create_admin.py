#!/usr/bin/env python
"""
Bootstrap an admin or moderator for SkilledLink.

Usage (run from the project root):

    python scripts/create_admin.py <email>
    python scripts/create_admin.py <email> --moderator

Examples:

    python scripts/create_admin.py you@example.com
    python scripts/create_admin.py mod@example.com --moderator

The user must already exist. This script does not create users.
It only flips `is_admin` or `is_moderator` on an existing row.
"""

import argparse
import os
import sys

# Allow running this file directly from the scripts/ folder.
# Without this, `from app...` would fail because sys.path[0] would be
# the scripts/ directory, not the project root.
sys.path.insert(
    0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

from sqlmodel import Session, select  # noqa: E402

from app.database.session import engine  # noqa: E402
from app.models.user import User  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Promote an existing user to admin or moderator.",
    )
    parser.add_argument(
        "email",
        help="Email of the user to promote.",
    )
    parser.add_argument(
        "--moderator",
        action="store_true",
        help="Promote to moderator instead of admin.",
    )
    args = parser.parse_args()

    email = args.email.strip().lower()
    role = "moderator" if args.moderator else "admin"
    flag_name = "is_moderator" if args.moderator else "is_admin"

    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.email == email)
        ).first()

        if user is None:
            print(f"❌ No user found with email: {email}")
            print("   Register the user first, then re-run this script.")
            return 1

        if getattr(user, flag_name):
            print(f"ℹ️  {email} is already a {role}. Nothing to do.")
            return 0

        setattr(user, flag_name, True)
        session.add(user)
        session.commit()

    print(f"✅ {email} is now a {role}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

# # Promote to admin
# python scripts/create_admin.py you@example.com

# # Promote to moderator
# python scripts/create_admin.py mod@example.com --moderator