"""
Ride Dispatch System - FastAPI Backend Service
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import threading

# Import configuration and models
from config import HOST, PORT, ENABLE_THREADING_LOCK
from models import SystemStatusResponse, DispatchResultResponse, TickResultResponse, InitDataResponse

# Import routers
from routers import drivers, riders, requests

# Import services
from services.dispatch import (
    dispatch_ride, tick, get_system_status, init_sample_data, reset_all_data,
    data_lock
)

# Create FastAPI application instance
app = FastAPI(
    title="Ride Dispatch System",
    version="1.0.0",
    description="FastAPI-based intelligent ride dispatch system",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Concurrency Safety ====================

def get_data_lock():
    """Get data lock dependency function"""
    return data_lock if ENABLE_THREADING_LOCK else None

# ==================== Include Routers ====================

app.include_router(drivers.router)
app.include_router(riders.router)
app.include_router(requests.router)

# ==================== Dispatch & Tick Endpoints ====================

@app.post("/dispatch", response_model=DispatchResultResponse,
          summary="Execute dispatch",
          description="Assign drivers to all waiting requests with driver rejection and retry mechanism")
async def dispatch_ride_endpoint(lock: Optional[threading.Lock] = Depends(get_data_lock)):
    """Dispatch ride requests - improved dispatch logic"""
    return dispatch_ride()

@app.post("/tick", response_model=TickResultResponse,
          summary="Advance time",
          description="Advance one time unit, update all on-trip driver positions and states")
async def tick_endpoint(lock: Optional[threading.Lock] = Depends(get_data_lock)):
    """Advance time, update all on-trip driver states"""
    return tick()

# ==================== Status Query Endpoints ====================

@app.get("/status", response_model=SystemStatusResponse,
         summary="Get system status",
         description="Return current overall system status statistics")
async def get_system_status_endpoint():
    """Get system status overview"""
    return get_system_status()

# ==================== Sample Data Initialization ====================

@app.post("/init-sample-data", response_model=InitDataResponse,
          summary="Initialize sample data",
          description="Clear existing data and create sample drivers, riders, and requests")
async def init_sample_data_endpoint(lock: Optional[threading.Lock] = Depends(get_data_lock)):
    """Initialize sample data"""
    return init_sample_data()

@app.post("/reset-all", response_model=InitDataResponse,
          summary="Reset all data",
          description="Clear all existing data and reset to initial state")
async def reset_all_endpoint(lock: Optional[threading.Lock] = Depends(get_data_lock)):
    """Reset all data to initial state"""
    return reset_all_data()

# ==================== Root Path ====================

@app.get("/",
         summary="API information",
         description="Return basic API information and available endpoints")
async def root():
    """Root path, return API information"""
    return {
        "message": "Ride Dispatch System API",
        "version": "1.0.0",
        "description": "FastAPI-based intelligent ride dispatch system",
        "endpoints": {
            "drivers": "/drivers",
            "riders": "/riders", 
            "requests": "/requests",
            "dispatch": "/dispatch",
            "tick": "/tick",
            "status": "/status",
            "init_sample_data": "/init-sample-data",
            "reset_all": "/reset-all"
        },
        "docs": "/docs",
        "redoc": "/redoc"
    }

# ==================== Startup Configuration ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT) 