#!/usr/bin/env python3
"""
Quick script to manually verify a user's email in the database.
This is useful for testing when SMTP is not configured yet.
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# MongoDB connection string from .env
MONGO_URI = "mongodb+srv://to-do_admin:to-do_admin@cluster0.5f3edr4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "taskflow"


async def verify_user_email(email: str):
    """Manually verify a user's email in the database."""
    
    print(f"🔍 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    try:
        # Find the user
        user = await db.users.find_one({"email": email})
        
        if not user:
            print(f"❌ User with email '{email}' not found!")
            print(f"\n💡 Tip: Make sure you registered with this email first.")
            return
        
        # Check if already verified
        if user.get("isEmailVerified"):
            print(f"✅ User '{email}' is already verified!")
            print(f"   Verified at: {user.get('emailVerifiedAt')}")
            return
        
        # Verify the user
        result = await db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "isEmailVerified": True,
                    "emailVerifiedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"✅ Successfully verified user: {email}")
            print(f"   Name: {user.get('name')}")
            print(f"   Verified at: {datetime.utcnow().isoformat()}")
            print(f"\n🎉 You can now login with this account!")
        else:
            print(f"❌ Failed to verify user")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    finally:
        client.close()


async def list_unverified_users():
    """List all unverified users."""
    
    print(f"🔍 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    try:
        users = await db.users.find({"isEmailVerified": False}).to_list(length=100)
        
        if not users:
            print("✅ No unverified users found!")
            return
        
        print(f"\n📋 Found {len(users)} unverified user(s):\n")
        for i, user in enumerate(users, 1):
            print(f"{i}. {user.get('name')} ({user.get('email')})")
            print(f"   Created: {user.get('createdAt')}")
            print()
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    finally:
        client.close()


async def main():
    """Main function."""
    
    print("=" * 60)
    print("📧 Email Verification Helper")
    print("=" * 60)
    print()
    
    if len(sys.argv) > 1:
        email = sys.argv[1]
        await verify_user_email(email)
    else:
        print("Usage:")
        print(f"  python {sys.argv[0]} <email>")
        print()
        print("Example:")
        print(f"  python {sys.argv[0]} user@example.com")
        print()
        await list_unverified_users()


if __name__ == "__main__":
    asyncio.run(main())
