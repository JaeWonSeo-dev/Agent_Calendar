class AuthService:
    def hash_password(self, plain_password: str) -> str:
        return f"hashed::{plain_password}"
