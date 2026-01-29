import asyncio
import os
import sys

# Add current directory to path so app.config can be imported
sys.path.append(os.getcwd())

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def debug_user(email):
    print(f"Connecting to MongoDB at {settings.mongo_uri}...")
    try:
        client = AsyncIOMotorClient(settings.mongo_uri)
        db = client[settings.database_name]
        users = db.users
        
        # Test connection
        await client.server_info()
        print("Connected to MongoDB successfully.")

        print(f"Searching for user with email: {email}")
        user = await users.find_one({"email": email})

        if user:
            print("--- User Found ---")
            print(f"ID: {user.get('_id')}")
            print(f"Name: {user.get('name')}")
            print(f"Email: {user.get('email')}")
            print(f"Is Email Verified: {user.get('isEmailVerified')}")
            print(f"Auth Provider: {user.get('oauthProvider')}")
            password_hash = user.get('password')
            if password_hash:
                print(f"Password Hash: {password_hash[:20]}... (Len: {len(password_hash)})") 
            else:
                print("Password Hash: None")
            print("------------------")
        else:
            print("--- User NOT Found ---")
            # List all users just in case of typo/case sensitivity
            print("Listing all users:")
            async for u in users.find({}, {"email": 1, "name": 1}):
                print(f"- {u.get('email')} ({u.get('name')})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    target_email = "mirzatamim20299@gmail.com"
    asyncio.run(debug_user(target_email))
