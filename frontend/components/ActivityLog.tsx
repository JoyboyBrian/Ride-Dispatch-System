"use client";

interface ActivityLogProps {
  logs: string[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        📝 Activity Log
      </h3>

      <div className="h-64 overflow-y-auto space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4 text-sm">
            No activity yet
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="text-xs text-gray-600 py-1 border-b border-gray-100 last:border-b-0"
            >
              {log}
            </div>
          ))
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {logs.length} log entries
        </div>
      )}
    </div>
  );
}
