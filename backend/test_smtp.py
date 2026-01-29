#!/usr/bin/env python3
"""
Test SMTP connection to Gmail.
This helps diagnose if the credentials are correct.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Your credentials from .env
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "mirza.md.shafi.uddin@gmail.com"
SMTP_PASSWORD = "lhpzbxwzztprcxky"  # Update if you regenerate

def test_smtp_connection():
    """Test SMTP connection and authentication."""
    
    print("=" * 60)
    print("🔍 Gmail SMTP Connection Test")
    print("=" * 60)
    print()
    
    print(f"📧 Email: {SMTP_USER}")
    print(f"🔐 Password: {'*' * len(SMTP_PASSWORD)}")
    print(f"🌐 Server: {SMTP_HOST}:{SMTP_PORT}")
    print()
    
    try:
        print("Step 1: Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
        print("✅ Connected successfully")
        print()
        
        print("Step 2: Starting TLS encryption...")
        server.starttls()
        print("✅ TLS started")
        print()
        
        print("Step 3: Authenticating with credentials...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        print("✅ Authentication successful!")
        print()
        
        print("Step 4: Sending test email...")
        
        # Create email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "✅ TaskFlow SMTP Test - Success!"
        msg['From'] = SMTP_USER
        msg['To'] = SMTP_USER
        
        # Email body
        text = "This is a test email from TaskFlow. Your SMTP configuration is working!"
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #4CAF50;">✅ SMTP Test Successful!</h2>
            <p>Your Gmail SMTP configuration is working correctly.</p>
            <p><strong>Email:</strong> {SMTP_USER}</p>
            <p><strong>Server:</strong> {SMTP_HOST}:{SMTP_PORT}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated test email from TaskFlow backend.
            </p>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(text, 'plain'))
        msg.attach(MIMEText(html, 'html'))
        
        # Send
        server.send_message(msg)
        print("✅ Test email sent successfully!")
        print()
        
        server.quit()
        
        print("=" * 60)
        print("🎉 SUCCESS! Everything is working!")
        print("=" * 60)
        print()
        print(f"📬 Check your inbox: {SMTP_USER}")
        print("   You should receive a test email within seconds.")
        print()
        print("✅ Your SMTP configuration is correct!")
        print("   The email system should work in your app now.")
        print()
        
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print("❌ AUTHENTICATION FAILED")
        print()
        print(f"Error: {e}")
        print()
        print("=" * 60)
        print("💡 SOLUTIONS:")
        print("=" * 60)
        print()
        print("1. Verify 2-Factor Authentication is enabled:")
        print("   → https://myaccount.google.com/security")
        print()
        print("2. Regenerate App Password:")
        print("   → https://myaccount.google.com/apppasswords")
        print("   → Delete old 'taskflow' password")
        print("   → Create new one")
        print("   → Copy it carefully (remove spaces!)")
        print()
        print("3. Check for typos in password:")
        print("   → Current password has", len(SMTP_PASSWORD), "characters")
        print("   → Should be 16 characters")
        print()
        print("4. Try 'Display Unlock Captcha':")
        print("   → https://accounts.google.com/DisplayUnlockCaptcha")
        print()
        
        return False
        
    except smtplib.SMTPConnectError as e:
        print("❌ CONNECTION FAILED")
        print()
        print(f"Error: {e}")
        print()
        print("💡 Check your internet connection")
        print("   Gmail SMTP might be blocked by firewall")
        print()
        
        return False
        
    except Exception as e:
        print("❌ UNEXPECTED ERROR")
        print()
        print(f"Error: {e}")
        print()
        
        return False


if __name__ == "__main__":
    success = test_smtp_connection()
    
    if not success:
        print()
        print("📖 For more help, see:")
        print("   /Users/mirzashafi/sproject/TaskFlow/backend-fastapi/EMAIL_SETUP_GUIDE.md")
        print()
        exit(1)
    else:
        exit(0)
