"use client";

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

interface StatusPanelProps {
  status: SystemStatus | null;
}

export default function StatusPanel({ status }: StatusPanelProps) {
  if (!status) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          📊 System Status
        </h3>
        <div className="text-gray-500 text-center py-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        📊 System Status
      </h3>

      <div className="space-y-4">
        {/* Time Display - More prominent current time display */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-center text-white shadow-lg">
          <div className="text-3xl font-bold mb-1">
            ⏰ {status.current_time}
          </div>
          <div className="text-sm opacity-90">Current Time (Ticks)</div>
          <div className="text-xs opacity-75 mt-1">
            Each "Next Tick" advances time by 1 unit
          </div>
        </div>

        {/* Drivers Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">🚗 Drivers</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="font-semibold text-blue-600">
                {status.drivers.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Available:</span>
              <span className="font-semibold text-green-600">
                {status.drivers.available}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">On Trip:</span>
              <span className="font-semibold text-yellow-600">
                {status.drivers.on_trip}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Offline:</span>
              <span className="font-semibold text-gray-600">
                {status.drivers.offline}
              </span>
            </div>
          </div>
        </div>

        {/* Riders Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">👤 Riders</h4>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="font-semibold text-red-600">
              {status.riders.total}
            </span>
          </div>
        </div>

        {/* Requests Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            📋 Requests
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="font-semibold text-blue-600">
                {status.requests.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Waiting:</span>
              <span className="font-semibold text-yellow-600">
                {status.requests.waiting}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assigned:</span>
              <span className="font-semibold text-blue-600">
                {status.requests.assigned}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed:</span>
              <span className="font-semibold text-green-600">
                {status.requests.completed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Failed:</span>
              <span className="font-semibold text-red-600">
                {status.requests.failed}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {status.drivers.available + status.drivers.on_trip}
              </div>
              <div className="text-xs text-gray-600">Active Drivers</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">
                {status.requests.completed}
              </div>
              <div className="text-xs text-gray-600">Completed Rides</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
