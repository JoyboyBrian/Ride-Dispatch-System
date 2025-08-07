"""
Ride Dispatch System Data Models
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

# ==================== Action Models ====================

class DriverAction(BaseModel):
    """Driver action request model for manual accept/reject operations"""
    driver_id: int = Field(..., description="Driver ID")

# ==================== Enums ====================

class DriverStatus(str, Enum):
    """Driver status enum"""
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    OFFLINE = "offline"

class RequestStatus(str, Enum):
    """Request status enum"""
    WAITING = "waiting"
    ASSIGNED = "assigned"
    REJECTED = "rejected"
    COMPLETED = "completed"
    FAILED = "failed"

# ==================== Create Models (Client -> Server) ====================

class DriverCreate(BaseModel):
    """Create driver request model - excludes backend-managed fields"""
    x: float = Field(..., description="Driver X coordinate")
    y: float = Field(..., description="Driver Y coordinate")
    status: DriverStatus = Field(DriverStatus.AVAILABLE, description="Driver status")

class RiderCreate(BaseModel):
    """Create rider request model - excludes backend-managed fields"""
    pickup_x: float = Field(..., description="Pickup X coordinate")
    pickup_y: float = Field(..., description="Pickup Y coordinate")
    dropoff_x: float = Field(..., description="Dropoff X coordinate")
    dropoff_y: float = Field(..., description="Dropoff Y coordinate")

class RideRequestCreate(BaseModel):
    """Create ride request model - excludes backend-managed fields"""
    rider_id: int = Field(..., description="Rider ID")
    pickup_x: float = Field(..., description="Pickup X coordinate")
    pickup_y: float = Field(..., description="Pickup Y coordinate")
    dropoff_x: float = Field(..., description="Dropoff X coordinate")
    dropoff_y: float = Field(..., description="Dropoff Y coordinate")

# ==================== Update Models ====================

class UpdateDriverRequest(BaseModel):
    """Update driver request model"""
    x: float = Field(..., description="Driver X coordinate")
    y: float = Field(..., description="Driver Y coordinate")
    status: DriverStatus = Field(..., description="Driver status")
    assigned_request_id: Optional[int] = Field(None, description="Assigned request ID")

class UpdateDriverStatusRequest(BaseModel):
    """Update driver status request model - only updates status field"""
    status: DriverStatus = Field(..., description="Driver status")

class UpdateRiderRequest(BaseModel):
    """Update rider request model"""
    pickup_x: float = Field(..., description="Pickup X coordinate")
    pickup_y: float = Field(..., description="Pickup Y coordinate")
    dropoff_x: float = Field(..., description="Dropoff X coordinate")
    dropoff_y: float = Field(..., description="Dropoff Y coordinate")

# ==================== Response Models (Server -> Client) ====================

class DriverResponse(BaseModel):
    """Driver response model"""
    id: int = Field(..., description="Driver ID")
    x: float = Field(..., description="Driver X coordinate")
    y: float = Field(..., description="Driver Y coordinate")
    status: DriverStatus = Field(..., description="Driver status")
    assigned_request_id: Optional[int] = Field(None, description="Assigned request ID")

class RiderResponse(BaseModel):
    """Rider response model"""
    id: int = Field(..., description="Rider ID")
    pickup_x: float = Field(..., description="Pickup X coordinate")
    pickup_y: float = Field(..., description="Pickup Y coordinate")
    dropoff_x: float = Field(..., description="Dropoff X coordinate")
    dropoff_y: float = Field(..., description="Dropoff Y coordinate")

class RideRequestResponse(BaseModel):
    """Ride request response model"""
    id: int = Field(..., description="Request ID")
    rider_id: int = Field(..., description="Rider ID")
    pickup_x: float = Field(..., description="Pickup X coordinate")
    pickup_y: float = Field(..., description="Pickup Y coordinate")
    dropoff_x: float = Field(..., description="Dropoff X coordinate")
    dropoff_y: float = Field(..., description="Dropoff Y coordinate")
    status: RequestStatus = Field(..., description="Request status")
    attempts: int = Field(..., description="Attempt count")
    assigned_driver_id: Optional[int] = Field(None, description="Assigned driver ID")
    picked_up: bool = Field(False, description="Whether passenger has been picked up")

# ==================== Internal Data Models (Server internal use) ====================

class Driver(BaseModel):
    """Driver internal data model"""
    id: int
    x: float
    y: float
    status: DriverStatus
    assigned_request_id: Optional[int] = None

class Rider(BaseModel):
    """Rider internal data model"""
    id: int
    pickup_x: float
    pickup_y: float
    dropoff_x: float
    dropoff_y: float

class RideRequest(BaseModel):
    """Ride request internal data model"""
    id: int
    rider_id: int
    pickup_x: float
    pickup_y: float
    dropoff_x: float
    dropoff_y: float
    status: RequestStatus
    attempts: int = 0
    assigned_driver_id: Optional[int] = None
    picked_up: bool = False  # New field to track pickup status

# ==================== Status Response Models ====================

class SystemStatusResponse(BaseModel):
    """System status response model"""
    current_time: int = Field(..., description="Current system time")
    drivers: dict = Field(..., description="Driver status statistics")
    riders: dict = Field(..., description="Rider status statistics")
    requests: dict = Field(..., description="Request status statistics")

class DispatchResultResponse(BaseModel):
    """Dispatch result response model"""
    results: list = Field(..., description="Dispatch result list")

class TickResultResponse(BaseModel):
    """Tick result response model"""
    updated_requests: list = Field(..., description="Updated request list")

class InitDataResponse(BaseModel):
    """Initialize data response model"""
    message: str = Field(..., description="Response message")
    drivers_created: int = Field(..., description="Number of drivers created")
    riders_created: int = Field(..., description="Number of riders created")
    requests_created: int = Field(..., description="Number of requests created") 