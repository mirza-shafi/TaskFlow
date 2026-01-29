import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Force load from .env if needed, though settings should handle it
# Assuming running from backend-fastapi directory where .env might be or app/config handles it

async def debug_user(email):
    print(f"Connecting to MongoDB at {settings.mongo_uri}...")
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.database_name]
    users = db.users

    print(f"Searching for user with email: {email}")
    user = await users.find_one({"email": email})

    if user:
        print("--- User Found ---")
        print(f"ID: {user.get('_id')}")
        print(f"Name: {user.get('name')}")
        print(f"Email: {user.get('email')}")
        print(f"Is Email Verified: {user.get('isEmailVerified')}")
        print(f"Auth Provider: {user.get('oauthProvider')}")
        print(f"Password Hash: {user.get('password')[:20]}...") # Print start of hash
        print("------------------")
    else:
        print("--- User NOT Found ---")
        # List all users just in case of typo/case sensitivity
        print("Listing all users:")
        async for u in users.find({}, {"email": 1, "name": 1}):
            print(f"- {u.get('email')} ({u.get('name')})")

if __name__ == "__main__":
    import sys
    # Add current directory to path so app.config can be imported
    sys.path.append(os.getcwd())
    
    target_email = "mirzatamim20299@gmail.com"
    asyncio.run(debug_user(target_email))
