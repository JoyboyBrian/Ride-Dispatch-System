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
}: ControlPanelProps) {
  const [driverX, setDriverX] = useState("10");
  const [driverY, setDriverY] = useState("10");
  const [pickupX, setPickupX] = useState("20");
  const [pickupY, setPickupY] = useState("20");
  const [dropoffX, setDropoffX] = useState("80");
  const [dropoffY, setDropoffY] = useState("80");
  const [selectedRiderId, setSelectedRiderId] = useState<number | "">("");

  const handleAddDriver = () => {
    onAddDriver(parseInt(driverX) || 0, parseInt(driverY) || 0);
  };

  const handleAddRider = () => {
    onAddRider(
      parseInt(pickupX) || 0,
      parseInt(pickupY) || 0,
      parseInt(dropoffX) || 0,
      parseInt(dropoffY) || 0
    );
  };

  const handleCreateRequest = () => {
    if (selectedRiderId !== "") {
      onCreateRequest(selectedRiderId as number);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-6">
      {/* Driver Management */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          🚗 Driver Management
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X Coordinate:
            </label>
            <input
              type="number"
              min="0"
              max="99"
              value={driverX}
              onChange={(e) => setDriverX(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y Coordinate:
            </label>
            <input
              type="number"
              min="0"
              max="99"
              value={driverY}
              onChange={(e) => setDriverY(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddDriver}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Driver
            </button>
            <button
              onClick={onRemoveDriver}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Remove Driver
            </button>
          </div>
        </div>
      </div>

      {/* Rider Management */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          👤 Rider Management
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup X:
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={pickupX}
                onChange={(e) => setPickupX(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Y:
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={pickupY}
                onChange={(e) => setPickupY(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dropoff X:
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={dropoffX}
                onChange={(e) => setDropoffX(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dropoff Y:
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={dropoffY}
                onChange={(e) => setDropoffY(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddRider}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Rider
            </button>
            <button
              onClick={onRemoveRider}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Remove Rider
            </button>
          </div>
        </div>
      </div>

      {/* Ride Requests */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          🚀 Ride Requests
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rider ID:
            </label>
            <select
              value={selectedRiderId}
              onChange={(e) =>
                setSelectedRiderId(
                  e.target.value ? parseInt(e.target.value) : ""
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a rider</option>
              {riders.map((rider) => (
                <option key={rider.id} value={rider.id}>
                  Rider {rider.id} ({rider.pickup_x}, {rider.pickup_y}) → (
                  {rider.dropoff_x}, {rider.dropoff_y})
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateRequest}
              disabled={selectedRiderId === ""}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create Request
            </button>
            <button
              onClick={onDispatchRides}
              className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Dispatch Rides
            </button>
          </div>
        </div>
      </div>

      {/* Time Control */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          ⏰ Time Control
        </h3>
        <div className="space-y-3">
          <div className="text-xs text-gray-600 mb-2">
            <p>
              • <strong>Next Tick</strong>: Advance time, move all drivers one
              step
            </p>
            <p>
              • Drivers automatically travel to pickup points, then to
              destinations
            </p>
            <p>• Check activity log for detailed progress</p>
          </div>
          <button
            onClick={onAdvanceTime}
            className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
          >
            Next Tick
          </button>
          <button
            onClick={onRefreshStatus}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* System Control */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          🔄 System Control
        </h3>
        <div className="space-y-3">
          <button
            onClick={onResetAll}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
