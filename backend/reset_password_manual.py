import asyncio
import os
import sys

# Add current directory to path so app.config can be imported
sys.path.append(os.getcwd())

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.core.security import hash_password

async def reset_password(email, new_password):
    print(f"Connecting to MongoDB at {settings.mongo_uri}...")
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.database_name]
    users = db.users

    print(f"Searching for user: {email}")
    user = await users.find_one({"email": email})

    if not user:
        print("User not found!")
        return

    print(f"User found: {user['_id']}")
    print(f"Hashing new password: {new_password}")
    hashed_pw = hash_password(new_password)

    print("Updating password in database...")
    result = await users.update_one(
        {"email": email},
        {"$set": {"password": hashed_pw}}
    )

    if result.modified_count > 0:
        print("✅ Password updated successfully!")
    else:
        print("⚠️ Password not updated (maybe it was already the same?)")

if __name__ == "__main__":
    target_email = "mirzatamim20299@gmail.com"
    new_pass = "12345678"
    asyncio.run(reset_password(target_email, new_pass))
