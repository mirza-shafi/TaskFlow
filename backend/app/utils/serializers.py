"""Utility functions for data serialization."""
from datetime import datetime, date
from typing import Any, Dict, List
from bson import ObjectId


def serialize_dates(data: Any) -> Any:
    """
    Recursively convert datetime, date, and ObjectId objects to strings.
    
    Args:
        data: Data to serialize (dict, list, or primitive)
    
    Returns:
        Serialized data with dates and ObjectIds as strings
    """
    # DEBUG LOGGING
    # print(f"Serializing type: {type(data)}")
    
    if isinstance(data, (datetime, date)):
        # print(f"Converting date: {data}")
        return data.isoformat()
    elif isinstance(data, ObjectId):
        return str(data)
    elif isinstance(data, dict):
        return {key: serialize_dates(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_dates(item) for item in data]
    else:
        return data
