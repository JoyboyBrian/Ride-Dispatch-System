"""
Ride Dispatch System - Riders Router
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
import threading

from models import (
    RiderCreate, UpdateRiderRequest, RiderResponse,
    Rider
)
from services.dispatch import riders, rider_counter, data_lock

router = APIRouter(prefix="/riders", tags=["riders"])

def get_data_lock():
    """Get data lock dependency function"""
    return data_lock

# ==================== CRUD Endpoints ====================

@router.post("/", response_model=RiderResponse,
             summary="Create rider",
             description="Create a new rider with auto-generated ID")
async def create_rider(
    rider_request: RiderCreate,
    lock: Optional[threading.Lock] = Depends(get_data_lock)
):
    """Create rider - auto-generate ID"""
    global rider_counter
    
    if lock:
        with lock:
            return _create_rider_internal(rider_request)
    else:
        return _create_rider_internal(rider_request)

def _create_rider_internal(rider_request: RiderCreate) -> RiderResponse:
    """Internal implementation of rider creation"""
    global rider_counter
    
    new_id = rider_counter
    rider_counter += 1
    
    rider = Rider(
        id=new_id,
        pickup_x=rider_request.pickup_x,
        pickup_y=rider_request.pickup_y,
        dropoff_x=rider_request.dropoff_x,
        dropoff_y=rider_request.dropoff_y
    )
    
    riders[new_id] = rider
    return RiderResponse(**rider.dict())

@router.get("/", response_model=List[RiderResponse],
            summary="Get all riders",
            description="Return information for all riders in the system")
async def get_riders():
    """Get all riders"""
    return [RiderResponse(**rider.dict()) for rider in riders.values()]

@router.get("/{rider_id}", response_model=RiderResponse,
            summary="Get specific rider",
            description="Get rider details by rider ID")
async def get_rider(rider_id: int):
    """Get specific rider"""
    if rider_id not in riders:
        raise HTTPException(status_code=404, detail="Rider not found")
    return RiderResponse(**riders[rider_id].dict())

@router.put("/{rider_id}", response_model=RiderResponse,
            summary="Update rider information",
            description="Update information for specified rider")
async def update_rider(
    rider_id: int,
    rider_request: UpdateRiderRequest,
    lock: Optional[threading.Lock] = Depends(get_data_lock)
):
    """Update rider information"""
    if rider_id not in riders:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    if lock:
        with lock:
            return _update_rider_internal(rider_id, rider_request)
    else:
        return _update_rider_internal(rider_id, rider_request)

def _update_rider_internal(rider_id: int, rider_request: UpdateRiderRequest) -> RiderResponse:
    """Internal implementation of rider update"""
    rider = Rider(
        id=rider_id,
        pickup_x=rider_request.pickup_x,
        pickup_y=rider_request.pickup_y,
        dropoff_x=rider_request.dropoff_x,
        dropoff_y=rider_request.dropoff_y
    )
    
    riders[rider_id] = rider
    return RiderResponse(**rider.dict())

@router.delete("/{rider_id}",
               summary="Delete rider",
               description="Delete rider with specified ID")
async def delete_rider(
    rider_id: int,
    lock: Optional[threading.Lock] = Depends(get_data_lock)
):
    """Delete rider"""
    if rider_id not in riders:
        raise HTTPException(status_code=404, detail="Rider not found")
    
    if lock:
        with lock:
            del riders[rider_id]
    else:
        del riders[rider_id]
    
    return {"message": "Rider deleted successfully"} 