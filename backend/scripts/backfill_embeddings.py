#!/usr/bin/env python
"""
Backfill embeddings for all professionals missing them.
Usage: python -m scripts.backfill_embeddings
"""

import sys
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlmodel import Session, select
from app.database.session import engine
from app.models.professional import Professional
from app.services.indexing_service import IndexingService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def backfill_all():
    session = Session(engine)
    try:
        stmt = select(Professional).where(
            (Professional.embedding.is_(None)) | (Professional.embedding_stale == True)
        )
        professionals = session.exec(stmt).all()

        if not professionals:
            logger.info("✅ All professionals already have fresh embeddings.")
            return

        logger.info(f"Found {len(professionals)} professionals needing embedding.")
        success = 0
        failed = 0

        for i, prof in enumerate(professionals, 1):
            try:
                logger.info(f"[{i}/{len(professionals)}] Indexing {prof.profession} ({prof.user_id})")
                IndexingService(session).regenerate_vector(prof.user_id)
                success += 1
            except Exception as e:
                logger.error(f"❌ Failed for {prof.user_id}: {e}")
                failed += 1

        logger.info(f"\n{'='*50}\n✅ Success: {success}\n❌ Failed: {failed}\n{'='*50}")

    finally:
        session.close()


if __name__ == "__main__":
    backfill_all()