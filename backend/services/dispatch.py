"""
Ride Dispatch System - Dispatch Service
"""

import random
import threading
from typing import Dict, List, Optional
from fastapi import HTTPException

from config import DISPATCH_ALPHA, DISPATCH_BETA, REJECTION_RATE, MOVE_SPEED
from models import Driver, Rider, RideRequest, DriverStatus, RequestStatus

# Global data storage
drivers: Dict[int, Driver] = {}
riders: Dict[int, Rider] = {}
requests: Dict[int, RideRequest] = {}

# Counters for unique ID generation
driver_counter = 1
rider_counter = 1
request_counter = 1

# Time counter
current_time = 0

# Concurrency lock
data_lock = threading.Lock()

def get_data_lock():
    """Get data lock dependency function"""
    return data_lock

# ==================== Utility Functions ====================

def calculate_manhattan_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    """Calculate Manhattan distance"""
    return abs(x1 - x2) + abs(y1 - y2)

def calculate_driver_score(driver: Driver, request: RideRequest) -> float:
    """Calculate driver score (lower is better)"""
    # Calculate distance to pickup point
    eta_to_pickup = calculate_manhattan_distance(driver.x, driver.y, request.pickup_x, request.pickup_y)
    
    # Calculate assigned request count (simplified as 0 or 1)
    num_assigned = 1 if driver.assigned_request_id else 0
    
    # Combined score
    score = DISPATCH_ALPHA * eta_to_pickup + DISPATCH_BETA * num_assigned
    return score

def find_best_driver(request: RideRequest, exclude: List[int] = None) -> Optional[Driver]:
    """Find the best available driver for a request, excluding specified drivers"""
    if exclude is None:
        exclude = []
    
    # Get all available drivers (excluding specified drivers)
    available_drivers = [
        driver for driver in drivers.values() 
        if driver.status == DriverStatus.AVAILABLE and driver.id not in exclude
    ]
    
    if not available_drivers:
        return None
    
    # Find the best driver using existing scoring logic
    best_driver = None
    best_score = float('inf')
    
    for driver in available_drivers:
        score = calculate_driver_score(driver, request)
        if score < best_score:
            best_score = score
            best_driver = driver
    
    return best_driver

def move_towards_target(current_x: float, current_y: float, target_x: float, target_y: float) -> tuple[float, float]:
    """Move one step towards target (Manhattan distance)"""
    new_x, new_y = current_x, current_y
    
    # Move X axis first
    if current_x < target_x:
        new_x = min(current_x + MOVE_SPEED, target_x)
    elif current_x > target_x:
        new_x = max(current_x - MOVE_SPEED, target_x)
    
    # Then move Y axis
    if current_y < target_y:
        new_y = min(current_y + MOVE_SPEED, target_y)
    elif current_y > target_y:
        new_y = max(current_y - MOVE_SPEED, target_y)
    
    return new_x, new_y

def simulate_driver_rejection() -> bool:
    """Simulate driver rejection"""
    return random.random() < REJECTION_RATE

# ==================== Dispatch Logic ====================

def dispatch_ride() -> dict:
    """Dispatch ride requests - improved dispatch logic"""
    with data_lock:
        return _dispatch_ride_internal()

def _dispatch_ride_internal() -> dict:
    """Internal implementation of dispatch logic"""
    # Get all waiting requests
    waiting_requests = [req for req in requests.values() if req.status == RequestStatus.WAITING]
    
    if not waiting_requests:
        return {"results": []}
    
    # Get all available drivers - capture once before looping
    all_available_drivers = [driver for driver in drivers.values() if driver.status == DriverStatus.AVAILABLE]
    
    if not all_available_drivers:
        return {"results": []}
    
    results = []
    
    for request in waiting_requests:
        # Create independent copy of available drivers for each request
        available_drivers = all_available_drivers.copy()
        
        # Find best driver for each request
        best_driver = None
        best_score = float('inf')
        
        # Calculate score for each driver
        for driver in available_drivers:
            score = calculate_driver_score(driver, request)
            if score < best_score:
                best_score = score
                best_driver = driver
        
        if best_driver:
            # Try to assign driver
            max_attempts = len(available_drivers)
            attempts_made = 0
            
            while attempts_made < max_attempts:
                # Simulate driver rejection
                if simulate_driver_rejection():
                    # Driver rejects, remove from available list, try next
                    available_drivers.remove(best_driver)
                    attempts_made += 1
                    
                    # Recalculate best driver
                    if available_drivers:
                        best_score = float('inf')
                        for driver in available_drivers:
                            score = calculate_driver_score(driver, request)
                            if score < best_score:
                                best_score = score
                                best_driver = driver
                    else:
                        break
                else:
                    # Driver accepts
                    # Update request status
                    request.status = RequestStatus.ASSIGNED
                    request.assigned_driver_id = best_driver.id
                    request.attempts = attempts_made
                    
                    # Update driver status
                    best_driver.status = DriverStatus.ON_TRIP
                    best_driver.assigned_request_id = request.id
                    
                    # Remove from available list
                    available_drivers.remove(best_driver)
                    
                    results.append({
                        "request_id": request.id,
                        "assigned_driver_id": best_driver.id,
                        "attempts": attempts_made,
                        "status": "assigned"
                    })
                    break
            
            # If all drivers reject
            if attempts_made >= max_attempts:
                request.status = RequestStatus.FAILED
                request.attempts = attempts_made
                results.append({
                    "request_id": request.id,
                    "assigned_driver_id": None,
                    "attempts": attempts_made,
                    "status": "failed"
                })
    
    return {"results": results}

# ==================== Tick Logic ====================

def tick() -> dict:
    """Advance time, update all on-trip driver states"""
    with data_lock:
        return _tick_internal()

def _tick_internal() -> dict:
    """Internal implementation of tick logic"""
    global current_time
    current_time += 1
    updated_requests = []
    
    # Iterate through all on-trip drivers
    for driver in drivers.values():
        if driver.status == DriverStatus.ON_TRIP and driver.assigned_request_id:
            request = requests.get(driver.assigned_request_id)
            if not request:
                continue
            
            # Check if driver has reached pickup point
            if not request.picked_up:
                # Calculate distance to pickup point
                distance_to_pickup = calculate_manhattan_distance(
                    driver.x, driver.y, request.pickup_x, request.pickup_y
                )
                
                # If not at pickup point yet
                if distance_to_pickup > 0:
                    # Move towards pickup point
                    new_x, new_y = move_towards_target(driver.x, driver.y, request.pickup_x, request.pickup_y)
                    driver.x, driver.y = new_x, new_y
                    
                    # Check if reached pickup point
                    if calculate_manhattan_distance(driver.x, driver.y, request.pickup_x, request.pickup_y) == 0:
                        updated_requests.append({
                            "driver_id": driver.id,
                            "request_id": request.id,
                            "event": "reached_pickup"
                        })
                        # Mark pickup as completed
                        request.picked_up = True
                
                # If already at pickup point (initially at pickup point)
                elif distance_to_pickup == 0:
                    updated_requests.append({
                        "driver_id": driver.id,
                        "request_id": request.id,
                        "event": "reached_pickup"
                    })
                    request.picked_up = True
            
            # If already picked up, move towards destination
            else:
                # Calculate distance to destination
                distance_to_dropoff = calculate_manhattan_distance(
                    driver.x, driver.y, request.dropoff_x, request.dropoff_y
                )
                
                if distance_to_dropoff > 0:
                    # Move towards destination
                    new_x, new_y = move_towards_target(driver.x, driver.y, request.dropoff_x, request.dropoff_y)
                    driver.x, driver.y = new_x, new_y
                    
                    # Check if reached destination
                    if calculate_manhattan_distance(driver.x, driver.y, request.dropoff_x, request.dropoff_y) == 0:
                        # Complete trip
                        request.status = RequestStatus.COMPLETED
                        driver.status = DriverStatus.AVAILABLE
                        driver.assigned_request_id = None
                        # Reset pickup flag
                        request.picked_up = False
                        
                        updated_requests.append({
                            "driver_id": driver.id,
                            "request_id": request.id,
                            "event": "completed"
                        })
    
    return {"updated_requests": updated_requests}

# ==================== Data Management ====================

def get_system_status() -> dict:
    """Get system status overview"""
    return {
        "current_time": current_time,
        "drivers": {
            "total": len(drivers),
            "available": len([d for d in drivers.values() if d.status == DriverStatus.AVAILABLE]),
            "on_trip": len([d for d in drivers.values() if d.status == DriverStatus.ON_TRIP]),
            "offline": len([d for d in drivers.values() if d.status == DriverStatus.OFFLINE])
        },
        "riders": {
            "total": len(riders)
        },
        "requests": {
            "total": len(requests),
            "waiting": len([r for r in requests.values() if r.status == RequestStatus.WAITING]),
            "assigned": len([r for r in requests.values() if r.status == RequestStatus.ASSIGNED]),
            "completed": len([r for r in requests.values() if r.status == RequestStatus.COMPLETED]),
            "failed": len([r for r in requests.values() if r.status == RequestStatus.FAILED])
        }
    }

def init_sample_data() -> dict:
    """Initialize sample data"""
    global driver_counter, rider_counter, request_counter
    
    with data_lock:
        # Clear existing data
        drivers.clear()
        riders.clear()
        requests.clear()
        
        # Reset counters
        driver_counter = 1
        rider_counter = 1
        request_counter = 1
        
        # Create sample drivers
        sample_drivers = [
            {"x": 0, "y": 0, "status": DriverStatus.AVAILABLE},
            {"x": 5, "y": 5, "status": DriverStatus.AVAILABLE},
            {"x": 10, "y": 10, "status": DriverStatus.OFFLINE}
        ]
        
        for driver_data in sample_drivers:
            driver = Driver(id=driver_counter, **driver_data)
            drivers[driver_counter] = driver
            driver_counter += 1
        
        # Create sample riders
        sample_riders = [
            {"pickup_x": 2, "pickup_y": 2, "dropoff_x": 8, "dropoff_y": 8},
            {"pickup_x": 15, "pickup_y": 15, "dropoff_x": 20, "dropoff_y": 20}
        ]
        
        for rider_data in sample_riders:
            rider = Rider(id=rider_counter, **rider_data)
            riders[rider_counter] = rider
            rider_counter += 1
        
        # Create sample requests
        sample_requests = [
            {"rider_id": 1, "pickup_x": 2, "pickup_y": 2, "dropoff_x": 8, "dropoff_y": 8},
            {"rider_id": 2, "pickup_x": 15, "pickup_y": 15, "dropoff_x": 20, "dropoff_y": 20}
        ]
        
        for request_data in sample_requests:
            request = RideRequest(
                id=request_counter,
                rider_id=request_data["rider_id"],
                pickup_x=request_data["pickup_x"],
                pickup_y=request_data["pickup_y"],
                dropoff_x=request_data["dropoff_x"],
                dropoff_y=request_data["dropoff_y"],
                status=RequestStatus.WAITING,
                attempts=0,
                assigned_driver_id=None,
                picked_up=False
            )
            requests[request_counter] = request
            request_counter += 1
        
        return {
            "message": "Sample data initialized",
            "drivers_created": len(sample_drivers),
            "riders_created": len(sample_riders),
            "requests_created": len(sample_requests)
        }

def reset_all_data() -> dict:
    """Reset all data to clean initial state"""
    global driver_counter, rider_counter, request_counter
    
    with data_lock:
        # Clear existing data
        drivers.clear()
        riders.clear()
        requests.clear()
        
        # Reset counters
        driver_counter = 1
        rider_counter = 1
        request_counter = 1
        
        return {
            "message": "All data reset to completely clean state",
            "drivers_created": 0,
            "riders_created": 0,
            "requests_created": 0
        } 