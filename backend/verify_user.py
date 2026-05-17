import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def verify_user():
    uri = "mongodb+srv://to-do_admin:to-do_admin@cluster0.5f3edr4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(uri)
    db = client.taskflow
    
    result = await db.users.update_one(
        {"email": "mirza.md.shafi.uddin@gmail.com"},
        {"$set": {"isEmailVerified": True}}
    )
    print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")

if __name__ == "__main__":
    asyncio.run(verify_user())
