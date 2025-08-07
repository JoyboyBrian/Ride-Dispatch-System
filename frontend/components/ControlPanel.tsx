"use client";

import { useState } from "react";

interface Rider {
  id: number;
  pickup_x: number;
  pickup_y: number;
  dropoff_x: number;
  dropoff_y: number;
}

interface ControlPanelProps {
  riders: Rider[];
  onAddDriver: (x: number, y: number) => void;
  onRemoveDriver: () => void;
  onAddRider: (
    pickupX: number,
    pickupY: number,
    dropoffX: number,
    dropoffY: number
  ) => void;
  onRemoveRider: () => void;
  onCreateRequest: (riderId: number) => void;
  onDispatchRides: () => void;
  onAdvanceTime: () => void;
  onRefreshStatus: () => void;
  onResetAll: () => void;
  onInitializeSampleData: () => void;
}

export default function ControlPanel({
  riders,
  onAddDriver,
  onRemoveDriver,
  onAddRider,
  onRemoveRider,
  onCreateRequest,
  onDispatchRides,
  onAdvanceTime,
  onRefreshStatus,
  onResetAll,
  onInitializeSampleData,
}: ControlPanelProps) {
  const [driverX, setDriverX] = useState("10");
  const [driverY, setDriverY] = useState("10");
  const [pickupX, setPickupX] = useState("20");
  const [pickupY, setPickupY] = useState("20");
  const [dropoffX, setDropoffX] = useState("80");
  const [dropoffY, setDropoffY] = useState("80");
  const [selectedRiderId, setSelectedRiderId] = useState<number | "">("");

  // Error states for coordinate validation
  const [driverError, setDriverError] = useState("");
  const [riderError, setRiderError] = useState("");

  // Coordinate validation function
  const validateCoordinate = (
    value: string,
    min: number = 0,
    max: number = 99
  ): boolean => {
    const num = parseInt(value);
    return !isNaN(num) && num >= min && num <= max;
  };

  // Validate driver coordinates
  const validateDriverCoordinates = () => {
    const xValid = validateCoordinate(driverX);
    const yValid = validateCoordinate(driverY);

    if (!xValid || !yValid) {
      setDriverError("Please enter coordinates within range (0-99)");
      return false;
    }
    setDriverError("");
    return true;
  };

  // Validate rider coordinates
  const validateRiderCoordinates = () => {
    const pickupXValid = validateCoordinate(pickupX);
    const pickupYValid = validateCoordinate(pickupY);
    const dropoffXValid = validateCoordinate(dropoffX);
    const dropoffYValid = validateCoordinate(dropoffY);

    if (!pickupXValid || !pickupYValid || !dropoffXValid || !dropoffYValid) {
      setRiderError("Please enter coordinates within range (0-99)");
      return false;
    }
    setRiderError("");
    return true;
  };

  const handleAddDriver = () => {
    if (validateDriverCoordinates()) {
      onAddDriver(parseInt(driverX) || 0, parseInt(driverY) || 0);
    }
  };

  const handleAddRider = () => {
    if (validateRiderCoordinates()) {
      onAddRider(
        parseInt(pickupX) || 0,
        parseInt(pickupY) || 0,
        parseInt(dropoffX) || 0,
        parseInt(dropoffY) || 0
      );
    }
  };

  const handleCreateRequest = () => {
    if (selectedRiderId !== "") {
      onCreateRequest(selectedRiderId as number);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Driver Card */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold mb-3 text-gray-800">
            🚗 Driver Management
          </h3>
          <div className="space-y-3">
            {/* Driver Coordinates */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">
                Position
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="X"
                  value={driverX}
                  onChange={(e) => {
                    setDriverX(e.target.value);
                    setDriverError(""); // Clear error when user starts typing
                  }}
                  className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    driverError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="Y"
                  value={driverY}
                  onChange={(e) => {
                    setDriverY(e.target.value);
                    setDriverError(""); // Clear error when user starts typing
                  }}
                  className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    driverError ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {driverError && (
                <p className="text-red-500 text-xs mt-1">{driverError}</p>
              )}
            </div>
            {/* Driver Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddDriver}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Add Driver
              </button>
              <button
                onClick={onRemoveDriver}
                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Remove Driver
              </button>
            </div>
          </div>
        </div>

        {/* Rider Card */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold mb-3 text-gray-800">
            👤 Rider Management
          </h3>
          <div className="space-y-3">
            {/* Rider Coordinates */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">
                Coordinates
              </h4>
              <div className="space-y-2">
                {/* Pickup */}
                <div>
                  <h5 className="text-xs text-gray-500 mb-1">Pickup</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="X"
                      value={pickupX}
                      onChange={(e) => {
                        setPickupX(e.target.value);
                        setRiderError(""); // Clear error when user starts typing
                      }}
                      className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        riderError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="Y"
                      value={pickupY}
                      onChange={(e) => {
                        setPickupY(e.target.value);
                        setRiderError(""); // Clear error when user starts typing
                      }}
                      className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        riderError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>
                {/* Dropoff */}
                <div>
                  <h5 className="text-xs text-gray-500 mb-1">Dropoff</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="X"
                      value={dropoffX}
                      onChange={(e) => {
                        setDropoffX(e.target.value);
                        setRiderError(""); // Clear error when user starts typing
                      }}
                      className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        riderError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="Y"
                      value={dropoffY}
                      onChange={(e) => {
                        setDropoffY(e.target.value);
                        setRiderError(""); // Clear error when user starts typing
                      }}
                      className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        riderError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              </div>
              {riderError && (
                <p className="text-red-500 text-xs mt-1">{riderError}</p>
              )}
            </div>
            {/* Rider Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddRider}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Add Rider
              </button>
              <button
                onClick={onRemoveRider}
                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Remove Rider
              </button>
            </div>
          </div>
        </div>

        {/* Request & Dispatch Card */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold mb-3 text-gray-800">
            🚀 Request & Dispatch
          </h3>
          <div className="space-y-3">
            {/* Rider Selection */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">
                Select Rider
              </h4>
              <select
                value={selectedRiderId}
                onChange={(e) =>
                  setSelectedRiderId(
                    e.target.value ? parseInt(e.target.value) : ""
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select rider</option>
                {riders.map((rider) => (
                  <option key={rider.id} value={rider.id}>
                    Rider {rider.id}
                  </option>
                ))}
              </select>
            </div>
            {/* Request & Dispatch Buttons */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={handleCreateRequest}
                disabled={selectedRiderId === ""}
                className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                Create Request
              </button>
              <button
                onClick={onDispatchRides}
                className="w-full bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm"
              >
                Dispatch Rides
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Control Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <button
          onClick={onAdvanceTime}
          className="bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm"
        >
          Next Tick
        </button>
        <button
          onClick={onRefreshStatus}
          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Refresh Status
        </button>
        <button
          onClick={onInitializeSampleData}
          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
        >
          Initialize Sample Data
        </button>
        <button
          onClick={onResetAll}
          className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
