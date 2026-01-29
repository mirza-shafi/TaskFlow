"""
Database initialization and index creation for advanced authentication.

Run this script once to create necessary indexes for optimal performance.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def create_indexes():
    """Create database indexes for collections."""
    
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.database_name]
    
    print("Creating indexes...")
    
    # Users collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("isEmailVerified")
    print("✓ Users indexes created")
    
    # Sessions collection indexes
    await db.sessions.create_index([("userId", 1), ("deviceId", 1)])
    await db.sessions.create_index("userId")
    await db.sessions.create_index("isActive")
    await db.sessions.create_index("expiresAt", expireAfterSeconds=0)  # TTL index
    await db.sessions.create_index("refreshTokenHash")
    print("✓ Sessions indexes created")
    
    # Token blacklist indexes
    await db.token_blacklist.create_index("tokenHash", unique=True)
    await db.token_blacklist.create_index("expiresAt", expireAfterSeconds=0)  # TTL index
    print("✓ Token blacklist indexes created")
    
    # Login attempts indexes
    await db.login_attempts.create_index("email", unique=True)
    await db.login_attempts.create_index("lastAttempt")
    print("✓ Login attempts indexes created")
    
    # Security logs indexes
    await db.security_logs.create_index("userId")
    await db.security_logs.create_index("event")
    await db.security_logs.create_index("timestamp")
    await db.security_logs.create_index([("userId", 1), ("timestamp", -1)])
    print("✓ Security logs indexes created")
    
    print("\n✅ All indexes created successfully!")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(create_indexes())
