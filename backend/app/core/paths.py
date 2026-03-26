from pathlib import Path
import shutil

BACKEND_DIR = Path(__file__).resolve().parents[2]
LEGACY_APP_DIR = BACKEND_DIR / "app"
UPLOADS_DIR = BACKEND_DIR / "uploads"
LEGACY_UPLOADS_DIR = LEGACY_APP_DIR / "uploads"
PROFILE_UPLOADS_DIR = UPLOADS_DIR / "profiles"


def ensure_upload_dirs() -> None:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    PROFILE_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def migrate_legacy_uploads() -> None:
    if not LEGACY_UPLOADS_DIR.exists():
        return

    ensure_upload_dirs()

    for source in LEGACY_UPLOADS_DIR.rglob("*"):
        if not source.is_file():
            continue
        relative_path = source.relative_to(LEGACY_UPLOADS_DIR)
        target = UPLOADS_DIR / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            shutil.copy2(source, target)
