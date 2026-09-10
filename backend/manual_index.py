import asyncio
from uuid import UUID
from sqlmodel import Session
from app.database.session import engine
from app.services.indexing_service import IndexingService

async def main():
    user_id = UUID("28ac4428-3c36-462b-95c4-a834e99...")  # Use the actual UUID
    with Session(engine) as session:
        service = IndexingService(session)
        service.regenerate_vector(user_id)
        session.commit()
        print(f"Done indexing user {user_id}")

if __name__ == "__main__":
    asyncio.run(main())