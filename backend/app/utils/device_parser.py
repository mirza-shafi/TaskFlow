from user_agents import parse
from typing import Dict, Optional
import hashlib


class DeviceParser:
    """Utility class for parsing device information from User-Agent headers."""
    
    @staticmethod
    def parse_user_agent(user_agent_string: str) -> Dict[str, str]:
        """
        Parse User-Agent string to extract device information.
        
        Args:
            user_agent_string: Raw User-Agent header string
        
        Returns:
            Dictionary containing device information
        """
        user_agent = parse(user_agent_string)
        
        # Determine device type
        if user_agent.is_mobile:
            device_type = "mobile"
        elif user_agent.is_tablet:
            device_type = "tablet"
        elif user_agent.is_pc:
            device_type = "desktop"
        elif user_agent.is_bot:
            device_type = "bot"
        else:
            device_type = "unknown"
        
        # Build device name
        browser = user_agent.browser.family
        browser_version = user_agent.browser.version_string
        os = user_agent.os.family
        os_version = user_agent.os.version_string
        
        device_name = f"{browser} {browser_version} on {os} {os_version}"
        
        return {
            "deviceType": device_type,
            "deviceName": device_name,
            "browser": browser,
            "browserVersion": browser_version,
            "os": os,
            "osVersion": os_version,
            "isMobile": user_agent.is_mobile,
            "isTablet": user_agent.is_tablet,
            "isDesktop": user_agent.is_pc,
            "isBot": user_agent.is_bot,
            "userAgent": user_agent_string
        }
    
    @staticmethod
    def generate_device_id(user_agent_string: str, ip_address: str) -> str:
        """
        Generate a unique device ID based on User-Agent and IP address.
        
        Args:
            user_agent_string: Raw User-Agent header string
            ip_address: Client IP address
        
        Returns:
            Unique device ID (hash)
        """
        # Combine user agent and IP for fingerprinting
        fingerprint = f"{user_agent_string}:{ip_address}"
        
        # Generate SHA256 hash
        device_id = hashlib.sha256(fingerprint.encode()).hexdigest()
        
        return device_id
    
    @staticmethod
    def get_short_device_name(device_info: Dict[str, str]) -> str:
        """
        Get a short, user-friendly device name.
        
        Args:
            device_info: Device information dictionary
        
        Returns:
            Short device name (e.g., "Chrome on MacOS")
        """
        browser = device_info.get("browser", "Unknown Browser")
        os = device_info.get("os", "Unknown OS")
        
        return f"{browser} on {os}"


def get_client_ip(request) -> str:
    """
    Extract client IP address from request, considering proxies.
    
    Args:
        request: FastAPI Request object
    
    Returns:
        Client IP address
    """
    # Check for forwarded IP (behind proxy/load balancer)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # Take the first IP in the chain
        return forwarded.split(",")[0].strip()
    
    # Check for real IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct client
    return request.client.host if request.client else "unknown"


def get_location_from_ip(ip_address: str) -> str:
    """
    Get approximate location from IP address.
    
    Note: This is a placeholder. In production, you would use a service like:
    - MaxMind GeoIP2
    - ipapi.co
    - ip-api.com
    
    Args:
        ip_address: IP address
    
    Returns:
        Location string (e.g., "New York, US")
    """
    # For localhost/development
    if ip_address in ["127.0.0.1", "localhost", "::1", "unknown"]:
        return "Local Development"
    
    # Placeholder - in production, integrate with a geolocation service
    return "Unknown Location"
