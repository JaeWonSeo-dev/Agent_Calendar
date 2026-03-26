from pathlib import Path

from app.models.user import User
from app.core.paths import PROFILE_UPLOADS_DIR


class ProfileImageService:
    @staticmethod
    def normalize_user_profile_image(user: User) -> User:
        image_url = user.profile_image_url
        if not image_url:
            return user

        filename = Path(image_url).name
        expected = PROFILE_UPLOADS_DIR / filename
        if expected.exists():
            return user

        stem = Path(filename).stem
        prefix = f"{user.id}_"

        candidates = []
        if stem:
            candidates.extend(sorted(PROFILE_UPLOADS_DIR.glob(f"{stem}.*"), key=lambda p: p.stat().st_mtime, reverse=True))
        candidates.extend(sorted(PROFILE_UPLOADS_DIR.glob(f"{prefix}*"), key=lambda p: p.stat().st_mtime, reverse=True))

        seen: set[str] = set()
        for candidate in candidates:
            if candidate.name in seen:
                continue
            seen.add(candidate.name)
            user.profile_image_url = f"/uploads/profiles/{candidate.name}"
            return user

        user.profile_image_url = None
        return user
