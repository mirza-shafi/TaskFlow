from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
from typing import List, Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails using SMTP."""
    
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password
        self.smtp_from = settings.smtp_from
        self.smtp_from_name = settings.smtp_from_name
        
        # Setup Jinja2 for email templates
        template_dir = Path(__file__).parent.parent / "templates" / "emails"
        template_dir.mkdir(parents=True, exist_ok=True)
        
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=select_autoescape(['html', 'xml'])
        )
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email using SMTP.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (optional)
        
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.smtp_from_name} <{self.smtp_from}>"
            message["To"] = to_email
            message["Subject"] = subject
            
            # Add plain text part if provided
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            # Add HTML part
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_verification_email(self, to_email: str, name: str, token: str) -> bool:
        """
        Send email verification email.
        
        Args:
            to_email: User's email address
            name: User's name
            token: Verification token
        
        Returns:
            True if email sent successfully
        """
        verification_url = f"{settings.frontend_url}/verify-email?token={token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to TaskFlow!</h1>
                </div>
                <div class="content">
                    <h2>Hi {name},</h2>
                    <p>Thank you for signing up for TaskFlow! We're excited to have you on board.</p>
                    <p>To complete your registration and start managing your tasks, please verify your email address by clicking the button below:</p>
                    <center>
                        <a href="{verification_url}" class="button">Verify Email Address</a>
                    </center>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">{verification_url}</p>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    <p>If you didn't create an account with TaskFlow, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 TaskFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to TaskFlow!
        
        Hi {name},
        
        Thank you for signing up for TaskFlow! To complete your registration, please verify your email address by visiting:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you didn't create an account with TaskFlow, please ignore this email.
        
        © 2026 TaskFlow. All rights reserved.
        """
        
        return await self.send_email(
            to_email=to_email,
            subject="Verify Your Email - TaskFlow",
            html_content=html_content,
            text_content=text_content
        )
    
    async def send_password_reset_email(self, to_email: str, name: str, token: str) -> bool:
        """
        Send password reset email.
        
        Args:
            to_email: User's email address
            name: User's name
            token: Reset token
        
        Returns:
            True if email sent successfully
        """
        reset_url = f"{settings.frontend_url}/reset-password?token={token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <h2>Hi {name},</h2>
                    <p>We received a request to reset your password for your TaskFlow account.</p>
                    <p>Click the button below to reset your password:</p>
                    <center>
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </center>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">{reset_url}</p>
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>This link will expire in 1 hour</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your password won't change until you create a new one</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2026 TaskFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        Hi {name},
        
        We received a request to reset your password for your TaskFlow account.
        
        To reset your password, visit:
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this reset, please ignore this email. Your password won't change until you create a new one.
        
        © 2026 TaskFlow. All rights reserved.
        """
        
        return await self.send_email(
            to_email=to_email,
            subject="Reset Your Password - TaskFlow",
            html_content=html_content,
            text_content=text_content
        )
    
    async def send_new_device_login_email(
        self,
        to_email: str,
        name: str,
        device_name: str,
        location: str,
        ip_address: str
    ) -> bool:
        """
        Send notification email for new device login.
        
        Args:
            to_email: User's email address
            name: User's name
            device_name: Name of the device
            location: Location from IP
            ip_address: IP address
        
        Returns:
            True if email sent successfully
        """
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .info-box {{ background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 New Device Login Detected</h1>
                </div>
                <div class="content">
                    <h2>Hi {name},</h2>
                    <p>We detected a new login to your TaskFlow account from a device we haven't seen before.</p>
                    <div class="info-box">
                        <p><strong>Device:</strong> {device_name}</p>
                        <p><strong>Location:</strong> {location}</p>
                        <p><strong>IP Address:</strong> {ip_address}</p>
                    </div>
                    <div class="warning">
                        <strong>⚠️ Was this you?</strong>
                        <p>If you recognize this activity, you can ignore this email.</p>
                        <p>If you don't recognize this login, please secure your account immediately by changing your password.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2026 TaskFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        New Device Login Detected
        
        Hi {name},
        
        We detected a new login to your TaskFlow account from a device we haven't seen before.
        
        Device: {device_name}
        Location: {location}
        IP Address: {ip_address}
        
        If you recognize this activity, you can ignore this email.
        If you don't recognize this login, please secure your account immediately by changing your password.
        
        © 2026 TaskFlow. All rights reserved.
        """
        
        return await self.send_email(
            to_email=to_email,
            subject="New Device Login - TaskFlow",
            html_content=html_content,
            text_content=text_content
        )


# Global email service instance
email_service = EmailService()
