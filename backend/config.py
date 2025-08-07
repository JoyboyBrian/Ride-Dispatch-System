"""
Ride Dispatch System Configuration
"""

import os
from typing import Final

# Dispatch algorithm parameters
DISPATCH_ALPHA: Final[float] = float(os.getenv("DISPATCH_ALPHA", "1.0"))  # Distance weight
DISPATCH_BETA: Final[float] = float(os.getenv("DISPATCH_BETA", "0.1"))    # Load weight

# Driver rejection probability
REJECTION_RATE: Final[float] = float(os.getenv("REJECTION_RATE", "0.1"))

# Movement speed (distance per tick)
MOVE_SPEED: Final[float] = float(os.getenv("MOVE_SPEED", "1.0"))

# Server configuration
HOST: Final[str] = os.getenv("HOST", "0.0.0.0")
PORT: Final[int] = int(os.getenv("PORT", "8000"))

# Concurrency safety configuration
ENABLE_THREADING_LOCK: Final[bool] = os.getenv("ENABLE_THREADING_LOCK", "true").lower() == "true" 