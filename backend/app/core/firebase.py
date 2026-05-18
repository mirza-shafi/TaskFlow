import os
import json
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from app.config import settings


_firebase_app = None


def get_firebase_app():
    """Initialize and return the Firebase Admin app (singleton).

    The service account JSON file path is read from config. This is called
    lazily on the first request so that startup doesn't fail if the file is
    temporarily missing during development.
    """
    global _firebase_app
    if _firebase_app is None:
        if settings.firebase_credentials_json:
            try:
                cert_dict = json.loads(settings.firebase_credentials_json)
                cred = credentials.Certificate(cert_dict)
            except json.JSONDecodeError:
                raise ValueError("FIREBASE_CREDENTIALS_JSON is not a valid JSON string.")
        else:
            cred_path = settings.firebase_service_account_path
            if not os.path.exists(cred_path):
                raise FileNotFoundError(
                    f"Firebase credentials not provided. Set FIREBASE_CREDENTIALS_JSON env variable "
                    f"or place service account JSON at: '{cred_path}'"
                )
            cred = credentials.Certificate(cred_path)
        
        _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app


async def verify_firebase_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return the decoded payload.

    Args:
        id_token: The Firebase ID token string sent from the frontend.

    Returns:
        A dict containing:
            - uid (str): Firebase UID
            - email (str): User's email address
            - name (str): Display name (may be empty)
            - picture (str): Profile photo URL (may be empty)
            - email_verified (bool): Whether Google has verified the email

    Raises:
        ValueError: If the token is invalid, expired, or the Firebase app
                    cannot be initialised.
    """
    get_firebase_app()  # Ensure the app is initialised before verifying
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return {
            "uid": decoded.get("uid"),
            "email": decoded.get("email"),
            "name": decoded.get("name", ""),
            "picture": decoded.get("picture", ""),
            "email_verified": decoded.get("email_verified", False),
        }
    except firebase_admin.exceptions.FirebaseError as e:
        raise ValueError(f"Invalid Firebase token: {str(e)}")
    except Exception as e:
        raise ValueError(f"Token verification failed: {str(e)}")
