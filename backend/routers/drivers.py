"""
Ride Dispatch System - Drivers Router
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
import threading

from models import (
    DriverCreate, UpdateDriverRequest, UpdateDriverStatusRequest, DriverResponse,
    Driver, DriverStatus
)
from services.dispatch import drivers, driver_counter, data_lock

router = APIRouter(prefix="/drivers", tags=["drivers"])

def get_data_lock():
    """Get data lock dependency function"""
    return data_lock

# ==================== CRUD Endpoints ====================

@router.post("/", response_model=DriverResponse,
             summary="Create driver",
             description="Create a new driver with auto-generated ID")
async def create_driver(
    driver_request: DriverCreate,
    lock: Optional[threading.Lock] = Depends(get_data_lock)
):
    """Create driver - auto-generate ID"""
    global driver_counter
    
    if lock:
        with lock:
            return _create_driver_internal(driver_request)
    else:
        return _create_driver_internal(driver_request)

def _create_driver_internal(driver_request: DriverCreate) -> DriverResponse:
    """Internal implementation of driver creation"""
    global driver_counter
    
    new_id = driver_counter
    driver_counter += 1
    
    driver = Driver(
        id=new_id,
        x=driver_request.x,
        y=driver_request.y,
        status=driver_request.status,
        assigned_request_id=None
    )
    
    drivers[new_id] = driver
    return DriverResponse(**driver.dict())

@router.get("/", response_model=List[DriverResponse],
            summary="Get all drivers",
            description="Return information for all drivers in the system")
async def get_drivers():
    """Get all drivers"""
    return [DriverResponse(**driver.dict()) for driver in drivers.values()]

@router.get("/{driver_id}", response_model=DriverResponse,
            summary="Get specific driver",
            description="Get driver details by driver ID")
async def get_driver(driver_id: int):
    """Get specific driver"""
    if driver_id not in drivers:
        raise HTTPException(status_code=404, detail="Driver not found")
    return DriverResponse(**drivers[driver_id].dict())

@router.patch("/{driver_id}/status", response_model=DriverResponse,
            summary="Update driver status",
            description="Update only the driver's status field")
async def update_driver_status(
    driver_id: int,
    status_request: UpdateDriverStatusRequest,
    lock: Optional[threading.Lock] = Depends(get_data_lock)
):
    """Update only the driver's status field"""
    if driver_id not in drivers:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    if lock:
        with lock:
            return _update_driver_status_internal(driver_id, status_request)
    else:
        return _update_driver_status_internal(driver_id, status_request)

def _update_driver_status_internal(driver_id: int, status_request: UpdateDriverStatusRequest) -> DriverResponse:
    """Internal implementation of driver status update - only updates status field"""
    # Get existing driver data
    existing_driver = drivers[driver_id]
    
    # Create updated driver with only status changed
    driver = Driver(
        id=driver_id,
        x=existing_driver.x,  # Keep existing location
        y=existing_driver.y,  # Keep existing location
        status=status_request.status,  # Update only status
        assigned_request_id=existing_driver.assigned_request_id  # Keep existing assignment
    )
    
    drivers[driver_id] = driver
    return DriverResponse(**driver.dict())

@router.delete("/{driver_id}",
               summary="Delete driver",
               description="Delete driver with specified ID")
async def delete_driver(
    driver_id: int,
    lock: Optional[threading.Lock] = Depends(get_data_lock)
):
    """Delete driver"""
    if driver_id not in drivers:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    if lock:
        with lock:
            del drivers[driver_id]
    else:
        del drivers[driver_id]
    
    return {"message": "Driver deleted successfully"} 