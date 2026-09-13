def __init__(self, session: Session):
    self.session = session
    self.repo = FeedRepository(session)
    self.storage = StorageService()
    self.moderation_repo = ModerationRepository(session)