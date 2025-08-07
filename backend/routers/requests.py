"""
Ride Dispatch System - Requests Router
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
import threading

from models import (
    RideRequestCreate, RideRequestResponse,
    RideRequest, RequestStatus,
    DriverStatus, DriverAction
)
from services.dispatch import riders, drivers, requests, find_best_driver, data_lock, request_counter

router = APIRouter(prefix="/requests", tags=["requests"])

def get_data_lock():
    """Get data lock dependency function"""
    return data_lock

# ==================== CRUD Endpoints ====================

@router.post("/", response_model=RideRequestResponse,
             summary="Create ride request",
             description="Create a new ride request with auto-generated ID and initialized as waiting")
async def create_request(
    request_data: RideRequestCreate,
    lock: Optional[threading.Lock] = Depends(get_data_lock)
):
    """Create ride request - auto-generate ID, initialize as waiting"""
    global request_counter
    
    # Validate rider exists
    if request_data.rider_id not in riders:
        raise HTTPException(status_code=400, detail="Rider not found")
    
    if lock:
        with lock:
            return _create_request_internal(request_data)
    else:
        return _create_request_internal(request_data)

def _create_request_internal(request_data: RideRequestCreate) -> RideRequestResponse:
    """Internal implementation of request creation"""
    global request_counter
    
    new_id = request_counter
    request_counter += 1
    
    request = RideRequest(
        id=new_id,
        rider_id=request_data.rider_id,
        pickup_x=request_data.pickup_x,
        pickup_y=request_data.pickup_y,
        dropoff_x=request_data.dropoff_x,
        dropoff_y=request_data.dropoff_y,
        status=RequestStatus.WAITING,  # Force initialize as waiting
        attempts=0,
        assigned_driver_id=None,
        picked_up=False
    )
    
    requests[new_id] = request
    return RideRequestResponse(**request.dict())

@router.get("/", response_model=List[RideRequestResponse],
            summary="Get all requests",
            description="Return information for all ride requests in the system")
async def get_requests():
    """Get all requests"""
    return [RideRequestResponse(**request.dict()) for request in requests.values()]

@router.get("/{request_id}", response_model=RideRequestResponse,
            summary="Get specific request",
            description="Get request details by request ID")
async def get_request(request_id: int):
    """Get specific request"""
    if request_id not in requests:
        raise HTTPException(status_code=404, detail="Request not found")
    return RideRequestResponse(**requests[request_id].dict())

# ==================== Manual Accept/Reject Endpoints ====================

@router.post("/{request_id}/accept", response_model=RideRequestResponse,
             summary="Manually accept ride request",
             description="Manually accept a ride request and assign it to a driver")
async def accept_request(
    request_id: int,
    action: DriverAction,
    lock: Optional[threading.Lock] = Depends(get_data_lock)
):
    """Manually accept a ride request and assign it to a specific driver"""
    # Validate request exists and is in waiting status
    if request_id not in requests:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request = requests[request_id]
    if request.status != RequestStatus.WAITING:
        raise HTTPException(status_code=400, detail="Request is not in waiting status")
    
    # Validate driver exists and is available
    if action.driver_id not in drivers:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    driver = drivers[action.driver_id]
    if driver.status != DriverStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Driver is not available")
    
    if lock:
        with lock:
            return _accept_request_internal(request_id, action.driver_id)
    else:
        return _accept_request_internal(request_id, action.driver_id)

def _accept_request_internal(request_id: int, driver_id: int) -> RideRequestResponse:
    """Internal implementation of request acceptance"""
    # Get the request and driver
    request = requests[request_id]
    driver = drivers[driver_id]
    
    # Update request status to assigned
    request.status = RequestStatus.ASSIGNED
    request.assigned_driver_id = driver_id
    request.attempts = 0  # Reset attempts since this is manual assignment
    
    # Update driver status to on trip
    driver.status = DriverStatus.ON_TRIP
    driver.assigned_request_id = request_id
    
    # Return the updated request
    return RideRequestResponse(**request.dict())

@router.post("/{request_id}/reject", response_model=RideRequestResponse,
             summary="Manually reject ride request",
             description="Manually reject a ride request and attempt to find another driver")
async def reject_request(
    request_id: int,
    action: DriverAction,
    lock: Optional[threading.Lock] = Depends(get_data_lock)
):
    """Manually reject a ride request and attempt to find another driver"""
    # Validate request exists and is in waiting status
    if request_id not in requests:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request = requests[request_id]
    if request.status != RequestStatus.WAITING:
        raise HTTPException(status_code=400, detail="Request is not in waiting status")
    
    # Validate driver exists
    if action.driver_id not in drivers:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    if lock:
        with lock:
            return _reject_request_internal(request_id, action.driver_id)
    else:
        return _reject_request_internal(request_id, action.driver_id)

def _reject_request_internal(request_id: int, driver_id: int) -> RideRequestResponse:
    """Internal implementation of request rejection"""
    # Get the request
    request = requests[request_id]
    
    # Increment attempt counter
    request.attempts += 1
    
    # Use existing dispatch logic to find best driver (excluding the rejecting driver)
    best_driver = find_best_driver(request, exclude=[driver_id])
    
    if best_driver:
        # Assign to the best available driver
        request.status = RequestStatus.ASSIGNED
        request.assigned_driver_id = best_driver.id
        
        # Update driver status
        best_driver.status = DriverStatus.ON_TRIP
        best_driver.assigned_request_id = request_id
    else:
        # No suitable driver found, mark as failed
        request.status = RequestStatus.FAILED
        request.assigned_driver_id = None
    
    return RideRequestResponse(**request.dict()) 