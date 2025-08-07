"use client";

import { useState, useEffect } from "react";
import GridVisualization from "@/components/GridVisualization";
import ControlPanel from "@/components/ControlPanel";
import StatusPanel from "@/components/StatusPanel";
import ActivityLog from "@/components/ActivityLog";

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

interface SystemStatus {
  current_time: number;
  drivers: {
    total: number;
    available: number;
    on_trip: number;
    offline: number;
  };
  riders: {
    total: number;
  };
  requests: {
    total: number;
    waiting: number;
    assigned: number;
    completed: number;
    failed: number;
  };
}

export default function Home() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const API_BASE = "/api";

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const fetchData = async () => {
    try {
      const [driversRes, ridersRes, requestsRes, statusRes] = await Promise.all(
        [
          fetch(`${API_BASE}/drivers`),
          fetch(`${API_BASE}/riders`),
          fetch(`${API_BASE}/requests`),
          fetch(`${API_BASE}/status`),
        ]
      );

      if (driversRes.ok) setDrivers(await driversRes.json());
      if (ridersRes.ok) setRiders(await ridersRes.json());
      if (requestsRes.ok) setRequests(await requestsRes.json());
      if (statusRes.ok) setSystemStatus(await statusRes.json());
    } catch (error) {
      addLog(`Error fetching data: ${error}`);
    }
  };

  const initializeSampleData = async () => {
    try {
      const response = await fetch(`${API_BASE}/init-sample-data`, {
        method: "POST",
      });
      if (response.ok) {
        addLog("✅ Sample data initialized");
        await fetchData();
      }
    } catch (error) {
      addLog(`❌ Error initializing sample data: ${error}`);
    }
  };

  const resetAllData = async () => {
    try {
      const response = await fetch(`${API_BASE}/reset-all`, {
        method: "POST",
      });
      if (response.ok) {
        const result = await response.json();
        addLog(`🔄 All data reset: ${result.message}`);
        // Force refresh data
        await fetchData();
        // Clear any cached data
        setDrivers([]);
        setRiders([]);
        setRequests([]);
        // Fetch fresh data
        await fetchData();
      }
    } catch (error) {
      addLog(`❌ Error resetting data: ${error}`);
    }
  };

  const addDriver = async (x: number, y: number) => {
    try {
      const response = await fetch(`${API_BASE}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y, status: "available" }),
      });
      if (response.ok) {
        addLog(`🚗 Driver added at position (${x}, ${y})`);
        await fetchData();
      }
    } catch (error) {
      addLog(`❌ Error adding driver: ${error}`);
    }
  };

  const removeDriver = async () => {
    if (drivers.length === 0) {
      addLog("⚠️ No drivers to remove");
      return;
    }
    const driverId = drivers[0].id;
    try {
      const response = await fetch(`${API_BASE}/drivers/${driverId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        addLog(`🗑️ Driver ${driverId} removed`);
        await fetchData();
      }
    } catch (error) {
      addLog(`❌ Error removing driver: ${error}`);
    }
  };

  const addRider = async (
    pickupX: number,
    pickupY: number,
    dropoffX: number,
    dropoffY: number
  ) => {
    try {
      const response = await fetch(`${API_BASE}/riders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup_x: pickupX,
          pickup_y: pickupY,
          dropoff_x: dropoffX,
          dropoff_y: dropoffY,
        }),
      });
      if (response.ok) {
        addLog(
          `👤 Rider added: (${pickupX},${pickupY}) → (${dropoffX},${dropoffY})`
        );
        await fetchData();
      }
    } catch (error) {
      addLog(`❌ Error adding rider: ${error}`);
    }
  };

  const removeRider = async () => {
    if (riders.length === 0) {
      addLog("⚠️ No riders to remove");
      return;
    }
    const riderId = riders[0].id;
    try {
      const response = await fetch(`${API_BASE}/riders/${riderId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        addLog(`🗑️ Rider ${riderId} removed`);
        await fetchData();
      }
    } catch (error) {
      addLog(`❌ Error removing rider: ${error}`);
    }
  };

  const createRequest = async (riderId: number) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) {
      addLog("❌ Selected rider not found");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rider_id: riderId,
          pickup_x: rider.pickup_x,
          pickup_y: rider.pickup_y,
          dropoff_x: rider.dropoff_x,
          dropoff_y: rider.dropoff_y,
        }),
      });
      if (response.ok) {
        addLog(`📋 Request created for rider ${riderId}`);
        await fetchData();
      }
    } catch (error) {
      addLog(`❌ Error creating request: ${error}`);
    }
  };

  const dispatchRides = async () => {
    try {
      const response = await fetch(`${API_BASE}/dispatch`, {
        method: "POST",
      });
      if (response.ok) {
        const result = await response.json();
        addLog(
          `🚀 Dispatch completed: ${result.results.length} requests processed`
        );

        // Add detailed dispatch result logs
        if (result.results && result.results.length > 0) {
          result.results.forEach((result: any) => {
            if (result.status === "assigned") {
              addLog(
                `✅ Request ${result.request_id} assigned to driver ${result.assigned_driver_id} (attempts: ${result.attempts})`
              );
            } else if (result.status === "failed") {
              addLog(
                `❌ Request ${result.request_id} failed (attempts: ${result.attempts})`
              );
            }
          });
        }

        await fetchData();
      }
    } catch (error) {
      addLog(`❌ Error dispatching rides: ${error}`);
    }
  };

  const advanceTime = async () => {
    try {
      const response = await fetch(`${API_BASE}/tick`, {
        method: "POST",
      });
      if (response.ok) {
        const result = await response.json();

        // Add detailed log information
        if (result.updated_requests && result.updated_requests.length > 0) {
          result.updated_requests.forEach((update: any) => {
            if (update.event === "reached_pickup") {
              addLog(
                `🚗 Driver ${update.driver_id} reached pickup point for request ${update.request_id}`
              );
            } else if (update.event === "completed") {
              addLog(
                `✅ Trip ${update.request_id} completed, driver ${update.driver_id} is now available`
              );
            }
          });
        } else {
          addLog("⏰ Time advanced: All drivers are moving...");
        }

        await fetchData();
      }
    } catch (error) {
      addLog(`❌ Error advancing time: ${error}`);
    }
  };

  useEffect(() => {
    initializeSampleData();
  }, []);

  // Auto-refresh data every 2 seconds to show real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
          <h1 className="text-4xl font-bold mb-2">🚗 Ride Dispatch System</h1>
          <p className="text-lg opacity-90">
            Intelligent ride dispatch simulation with real-time visualization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <div className="lg:col-span-2">
            <GridVisualization
              drivers={drivers}
              riders={riders}
              requests={requests}
            />
          </div>

          <div className="space-y-6">
            <ControlPanel
              riders={riders}
              onAddDriver={addDriver}
              onRemoveDriver={removeDriver}
              onAddRider={addRider}
              onRemoveRider={removeRider}
              onCreateRequest={createRequest}
              onDispatchRides={dispatchRides}
              onAdvanceTime={advanceTime}
              onRefreshStatus={fetchData}
              onResetAll={resetAllData}
            />

            <StatusPanel status={systemStatus} />

            <ActivityLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
