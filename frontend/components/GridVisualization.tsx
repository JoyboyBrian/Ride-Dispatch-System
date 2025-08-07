"use client";

import { useState } from "react";

interface Driver {
  id: number;
  x: number;
  y: number;
  status: "available" | "on_trip" | "offline";
  assigned_request_id?: number;
}

interface Rider {
  id: number;
  pickup_x: number;
  pickup_y: number;
  dropoff_x: number;
  dropoff_y: number;
}

interface Request {
  id: number;
  rider_id: number;
  pickup_x: number;
  pickup_y: number;
  dropoff_x: number;
  dropoff_y: number;
  status: "waiting" | "assigned" | "rejected" | "completed" | "failed";
  attempts: number;
  assigned_driver_id?: number;
}

interface GridVisualizationProps {
  drivers: Driver[];
  riders: Rider[];
  requests: Request[];
}

export default function GridVisualization({
  drivers,
  riders,
  requests,
}: GridVisualizationProps) {
  const [hoveredEntity, setHoveredEntity] = useState<{
    type: string;
    id: number;
    x: number;
    y: number;
    status?: string;
  } | null>(null);

  const createEntityElement = (entity: any, type: string, status?: string) => {
    const scale = 6; // Scale factor for grid display

    // Handle different entity types with different coordinate properties
    let x, y;
    if (type === "rider") {
      // Riders are displayed at their pickup location
      x = entity.pickup_x * scale;
      y = entity.pickup_y * scale;
    } else {
      // Drivers and other entities use x, y coordinates
      x = entity.x * scale;
      y = entity.y * scale;
    }

    const getEntityColor = () => {
      switch (type) {
        case "driver":
          switch (status) {
            case "available":
              return "bg-green-500";
            case "on_trip":
              return "bg-yellow-500";
            case "offline":
              return "bg-gray-500";
            default:
              return "bg-blue-500";
          }
        case "rider":
          return "bg-red-500";
        case "pickup":
          return "bg-cyan-500";
        case "dropoff":
          return "bg-purple-500";
        default:
          return "bg-gray-500";
      }
    };

    return (
      <div
        key={`${type}-${entity.id}`}
        className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-125 hover:z-10 ${getEntityColor()}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: "translate(-50%, -50%)",
        }}
        onMouseEnter={() =>
          setHoveredEntity({
            type,
            id: entity.id,
            x: type === "rider" ? entity.pickup_x : entity.x,
            y: type === "rider" ? entity.pickup_y : entity.y,
            status,
          })
        }
        onMouseLeave={() => setHoveredEntity(null)}
      />
    );
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        City Grid (100x100)
      </h2>

      <div className="relative w-full h-[600px] bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Entities */}
        <div className="relative w-full h-full">
          {/* Real-time position info */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {drivers.length > 0 &&
              `Drivers: ${drivers
                .map((d) => `(${d.x.toFixed(1)},${d.y.toFixed(1)})`)
                .join(", ")}`}
          </div>

          {/* Drivers */}
          {drivers.map((driver) =>
            createEntityElement(driver, "driver", driver.status)
          )}

          {/* Riders - Fixed display issue */}
          {riders.map((rider) => createEntityElement(rider, "rider"))}

          {/* Request pickup/dropoff points */}
          {requests
            .filter(
              (request) =>
                request.status === "assigned" || request.status === "waiting"
            )
            .map((request) => (
              <div key={`request-${request.id}`}>
                {createEntityElement(
                  {
                    x: request.pickup_x,
                    y: request.pickup_y,
                    id: `pickup_${request.id}`,
                  },
                  "pickup"
                )}
                {createEntityElement(
                  {
                    x: request.dropoff_x,
                    y: request.dropoff_y,
                    id: `dropoff_${request.id}`,
                  },
                  "dropoff"
                )}
              </div>
            ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
          <div className="text-sm font-medium text-black mb-2">Legend:</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-black">Available Driver</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-black">On Trip Driver</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-black">Rider</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span className="text-black">Pickup Point</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-black">Dropoff Point</span>
            </div>
          </div>
        </div>

        {/* Debug info */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Drivers: {drivers.length}, Riders: {riders.length}, Requests:{" "}
          {requests.length}
        </div>

        {/* Tooltip */}
        {hoveredEntity && (
          <div
            className="absolute bg-black bg-opacity-80 text-white px-3 py-2 rounded text-sm pointer-events-none z-20"
            style={{
              left: `${hoveredEntity.x * 6 + 20}px`,
              top: `${hoveredEntity.y * 6 - 10}px`,
            }}
          >
            {hoveredEntity.type.charAt(0).toUpperCase() +
              hoveredEntity.type.slice(1)}{" "}
            {hoveredEntity.id}
            <br />({hoveredEntity.x}, {hoveredEntity.y})
            {hoveredEntity.status && (
              <>
                <br />
                Status: {hoveredEntity.status}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
