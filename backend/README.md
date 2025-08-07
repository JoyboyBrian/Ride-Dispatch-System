# Ride Dispatch System Backend

Intelligent ride dispatch system backend service based on FastAPI.

## 🚀 Features

### Core Features

- **Intelligent Dispatch Algorithm**: ETA-based driver assignment with load balancing
- **Driver Rejection Handling**: Automatic retry with next best driver
- **Time Progression**: Manual tick-based simulation
- **Concurrency Safety**: Thread-safe operations
- **RESTful API**: Complete CRUD operations for all entities
- **Auto-generated Documentation**: Swagger/ReDoc API docs

### Technical Features

- **Automatic ID Generation**: No need to provide IDs when creating entities
- **Configurable Parameters**: All algorithm parameters configurable via environment variables
- **Separated Request/Response Models**: Cleaner API interface design
- **Improved Dispatch Algorithm**: Fixed mutual interference issues in multi-request dispatch
- **Precise Distance Calculation**: Fixed distance calculation logic in time progression

## Installation and Running

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables (Optional)

```bash
# Dispatch algorithm parameters
export DISPATCH_ALPHA=1.0    # Distance weight
export DISPATCH_BETA=0.1     # Load weight

# Driver rejection probability
export REJECTION_RATE=0.1

# Movement speed
export MOVE_SPEED=1.0

# Server configuration
export HOST=0.0.0.0
export PORT=8000

# Concurrency safety configuration
export ENABLE_THREADING_LOCK=true
```

### 3. Run Service

```bash
python main.py
```

Or using uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API Documentation

After starting the service, visit the following addresses to view API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## System Assumptions and Simplifications

### Core Assumptions

1. **Grid-based World**: City represented as 100x100 grid with integer coordinates
2. **Discrete Time**: Time advances in discrete ticks rather than continuous
3. **Fixed Movement Speed**: All drivers move at identical speed (1 unit per tick)
4. **Manhattan Distance**: Movement and distance calculation use Manhattan distance
5. **No Traffic**: No traffic congestion or road conditions affecting movement
6. **Perfect Information**: System has complete knowledge of all entities' positions
7. **Immediate Communication**: No network delays in driver-rider communication

### Simplifications Made

1. **Binary Driver Load**: Driver load simplified to 0 or 1 (assigned/not assigned)
2. **No Driver Preferences**: Drivers don't have personal preferences or ratings
3. **No Rider Preferences**: Riders don't specify driver preferences
4. **No Dynamic Pricing**: Fixed pricing model (not implemented)
5. **No Real-time Updates**: No WebSocket for real-time position updates
6. **No Persistence**: All data stored in memory, no database
7. **No Authentication**: No user authentication or authorization
8. **No Rate Limiting**: No API rate limiting or throttling
9. **No Geographic Constraints**: No real-world geographic boundaries
10. **No Weather Conditions**: No weather affecting movement or availability

### Technical Simplifications

1. **In-Memory Storage**: No persistent database, data lost on restart
2. **Single-threaded Simulation**: No parallel processing of multiple requests
3. **Synchronous Operations**: No async processing of dispatch decisions
4. **No Caching**: No caching of frequently accessed data
5. **No Load Balancing**: No distributed system considerations
6. **No Monitoring**: No system health monitoring or metrics
7. **No Logging**: No comprehensive logging system
8. **No Configuration Management**: Limited configuration options

### Future Enhancements

These simplifications could be addressed in future versions:

1. **Real-time Updates**: WebSocket integration for live position updates
2. **Persistent Storage**: Database integration for data persistence
3. **Advanced Algorithms**: Machine learning for better dispatch decisions
4. **Multi-threading**: Parallel processing for high-load scenarios
5. **Authentication**: User authentication and role-based access
6. **Monitoring**: Comprehensive system monitoring and analytics
7. **Caching**: Redis or similar for performance optimization
8. **Load Balancing**: Horizontal scaling capabilities

## API Interfaces

### Basic CRUD Interfaces

#### Driver Management

- `POST /drivers` - Create driver (auto-generate ID)
- `GET /drivers` - Get all drivers
- `GET /drivers/{id}` - Get specific driver
- `PATCH /drivers/{id}/status` - Update driver status
- `DELETE /drivers/{id}` - Delete driver

#### Rider Management

- `POST /riders` - Create rider (auto-generate ID)
- `GET /riders` - Get all riders
- `GET /riders/{id}` - Get specific rider
- `PUT /riders/{id}` - Update rider
- `DELETE /riders/{id}` - Delete rider

#### Request Management

- `POST /requests` - Create ride request (auto-generate ID, initialize as waiting)
- `GET /requests` - Get all requests
- `GET /requests/{id}` - Get specific request
- `POST /requests/{request_id}/accept` - Manually accept ride request
- `POST /requests/{request_id}/reject` - Manually reject ride request

### Core Business Interfaces

- `POST /dispatch` - Execute dispatch assignment
- `POST /tick` - Advance time, update driver positions
- `GET /status` - Get system status
- `POST /init-sample-data` - Initialize sample data

## Usage Examples

### 1. Initialize Sample Data

```bash
curl -X POST http://localhost:8000/init-sample-data
```

### 2. Create Driver (No ID Required)

```bash
curl -X POST http://localhost:8000/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "x": 0,
    "y": 0,
    "status": "available"
  }'
```

### 3. Create Rider (No ID Required)

```bash
curl -X POST http://localhost:8000/riders \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_x": 2,
    "pickup_y": 2,
    "dropoff_x": 8,
    "dropoff_y": 8
  }'
```

### 4. Create Ride Request (No ID Required, Auto-initialize as Waiting)

```bash
curl -X POST http://localhost:8000/requests \
  -H "Content-Type: application/json" \
  -d '{
    "rider_id": 1,
    "pickup_x": 2,
    "pickup_y": 2,
    "dropoff_x": 8,
    "dropoff_y": 8
  }'
```

### 5. Execute Dispatch

```bash
curl -X POST http://localhost:8000/dispatch
```

### 6. Advance Time

```bash
curl -X POST http://localhost:8000/tick
```

### 7. Check System Status

```bash
curl http://localhost:8000/status
```

### 8. Manually Accept Ride Request

```bash
curl -X POST http://localhost:8000/requests/1/accept \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": 1
  }'
```

### 9. Manually Reject Ride Request

```bash
curl -X POST http://localhost:8000/requests/1/reject \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": 1
  }'
```

### 10. Update Driver Status

```bash
curl -X PATCH http://localhost:8000/drivers/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "offline"
  }'
```

## Data Models

### Driver

- `id`: Driver ID (auto-generated)
- `x`, `y`: Current position coordinates
- `status`: Status (available/on_trip/offline)
- `assigned_request_id`: Assigned request ID

### Rider

- `id`: Rider ID (auto-generated)
- `pickup_x`, `pickup_y`: Pickup point coordinates
- `dropoff_x`, `dropoff_y`: Dropoff point coordinates

### RideRequest

- `id`: Request ID (auto-generated)
- `rider_id`: Rider ID
- `pickup_x`, `pickup_y`: Pickup point coordinates
- `dropoff_x`, `dropoff_y`: Dropoff point coordinates
- `status`: Status (waiting/assigned/rejected/completed/failed)
- `attempts`: Attempt count
- `assigned_driver_id`: Assigned driver ID

## Dispatch Algorithm Design

### Core Algorithm

The system uses a weighted scoring algorithm to assign drivers to requests:

```
score = α × ETA_to_pickup + β × num_assigned
```

Where:

- `ETA_to_pickup`: Manhattan distance from driver to pickup point
- `num_assigned`: Number of requests assigned to driver (simplified as 0 or 1)
- `α`, `β`: Weight parameters (configurable via environment variables)

Drivers with lower scores have higher priority.

### Algorithm Goals

1. **Minimize ETA**: Prioritize drivers with shortest estimated time to pickup
2. **Fairness**: Distribute requests evenly among drivers through load balancing
3. **Efficiency**: Maximize completed rides and minimize idle drivers
4. **Fallback**: Retry with alternate drivers upon rejection

### Implementation Details

- **Distance Calculation**: Uses Manhattan distance for simplicity and grid-based movement
- **Load Balancing**: Considers driver's current assignment count in scoring
- **Rejection Handling**: Simulates driver rejection with configurable probability
- **Retry Logic**: Attempts assignment with next best driver if current driver rejects
- **Concurrency Safety**: Uses thread locks to prevent data races in multi-request scenarios

### Algorithm Assumptions

1. **Fixed Speed**: All drivers move at the same speed (1 unit per tick)
2. **Manhattan Distance**: Movement follows grid lines, not diagonal paths
3. **Immediate Assignment**: Drivers are assigned immediately when available
4. **No Preemption**: Once assigned, drivers complete their current trip
5. **Simplified Load**: Driver load is binary (assigned or not assigned)

## Time Progression Mechanism

Each time the `/tick` interface is called:

1. Iterate through all drivers with `on_trip` status
2. If driver hasn't reached pickup point, move one step towards pickup point
3. If driver has reached pickup point but not destination, move one step towards destination
4. When driver reaches destination, mark request as completed, reset driver status to available

## Concurrency Safety

The system supports multi-threaded environments:

- Uses `threading.Lock` to protect critical data operations
- Can control whether to enable locks via `ENABLE_THREADING_LOCK` environment variable
- All write operations (create, update, delete, dispatch, time progression, manual accept/reject) are protected by locks
- Thread locks ensure data consistency in concurrent environments

## Configuration Parameters

### Environment Variables

| Variable Name           | Default | Description                                 |
| ----------------------- | ------- | ------------------------------------------- |
| `DISPATCH_ALPHA`        | 1.0     | Distance weight in dispatch algorithm       |
| `DISPATCH_BETA`         | 0.1     | Load weight in dispatch algorithm           |
| `REJECTION_RATE`        | 0.1     | Driver rejection probability                |
| `MOVE_SPEED`            | 1.0     | Distance moved per tick                     |
| `HOST`                  | 0.0.0.0 | Server listening address                    |
| `PORT`                  | 8000    | Server listening port                       |
| `ENABLE_THREADING_LOCK` | true    | Whether to enable threading lock for safety |

### Effect on Dispatch Behavior

- **DISPATCH_ALPHA**: Controls how much distance to pickup point affects driver selection. Higher values prioritize closer drivers.
- **DISPATCH_BETA**: Controls how much driver load affects selection. Higher values prioritize less busy drivers.
- **REJECTION_RATE**: Probability that a driver will reject an assignment (0.0 to 1.0).
- **MOVE_SPEED**: How far drivers move each tick when traveling to pickup/dropoff points.
- **ENABLE_THREADING_LOCK**: When true, uses thread locks to prevent data races in concurrent environments.

## Testing

Run test script:

```bash
python test_new_endpoints.py
```

Test content includes:

- Basic functionality tests
- Automatic ID generation tests
- Concurrency safety tests
- Configuration parameter tests

## File Structure

```
backend/
├── config.py
├── main.py
├── models.py
├── README.md
├── requirements.txt
├── routers
│   ├── __init__.py
│   ├── drivers.py
│   ├── requests.py
│   └── riders.py
├── services
│   ├── __init__.py
│   └── dispatch.py
└── test_new_endpoints.py
```

## Improvement Notes

### 1. Automatic ID Generation

- No need to provide IDs when creating entities
- System automatically assigns incremental IDs
- Avoids ID conflict issues

### 2. Concurrency Safety

- Uses thread locks to protect critical operations
- Supports multi-threaded environments
- Prevents data races

### 3. Configurable Parameters

- All algorithm parameters configurable via environment variables
- Easy debugging and optimization
- Supports parameter adjustment for different environments

### 4. Improved Dispatch Algorithm

- Fixed mutual interference issues in multi-request dispatch
- Each request uses independent available driver list
- More accurate driver assignment

### 5. Precise Distance Calculation

- Fixed distance calculation logic in time progression
- Recalculates destination distance after reaching pickup point
- More accurate movement simulation
