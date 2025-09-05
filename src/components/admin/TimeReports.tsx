import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ArrivalLog {
  _id: string;
  staffId: {
    _id: string;
    fullName: string;
    email: string;
  };
  date: string;
  arrivalTime: string;
  notes: string;
}

interface TeachingLog {
  _id: string;
  staffId: {
    _id: string;
    fullName: string;
    email: string;
  };
  classId: {
    _id: string;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

const TimeReports: React.FC = () => {
  const [arrivalLogs, setArrivalLogs] = useState<ArrivalLog[]>([]);
  const [teachingLogs, setTeachingLogs] = useState<TeachingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('arrival');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchTimeReports();
  }, [dateRange]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchTimeReports = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`${API_BASE}/time-logs/all?${params}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setArrivalLogs(data.arrivalLogs);
        setTeachingLogs(data.teachingLogs);
      } else {
        toast.error('Failed to fetch time reports');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const calculateTeachingHours = (startTime: string, endTime: string) => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Time Reports</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
            Admin View - All Staff Data
          </span>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveReport('arrival')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition duration-200 ${
            activeReport === 'arrival'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Arrival Logs ({arrivalLogs.length})
        </button>
        <button
          onClick={() => setActiveReport('teaching')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition duration-200 ${
            activeReport === 'teaching'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Teaching Logs ({teachingLogs.length})
        </button>
      </div>

      {/* Arrival Logs */}
      {activeReport === 'arrival' && (
        <div className="grid md:grid-cols-3 gap-8">
          {arrivalLogs.map((log) => (
            <button key={log._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{log.staffId.fullName}</h3>
                  <p className="text-sm text-gray-600">{log.staffId.email}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-gray-700">
                      <strong>Date:</strong> {formatDate(log.date)}
                    </span>
                    <span className="text-blue-600">
                      <strong>Arrival:</strong> {formatTime(log.arrivalTime)}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Notes:</strong> {log.notes}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}

          {arrivalLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No arrival logs found for the selected period.
            </div>
          )}
        </div>
      )}

      {/* Teaching Logs */}
      {activeReport === 'teaching' && (
        <div className="space-y-4 gap-8">
          {teachingLogs.map((log) => (
            <button key={log._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{log.staffId.fullName}</h3>
                  <p className="text-sm text-gray-600">{log.staffId.email}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <span className="text-gray-700">
                      <strong>Date:</strong> {formatDate(log.date)}
                    </span>
                    <span className="text-purple-600">
                      <strong>Class:</strong> {log.classId.name}
                    </span>
                    <span className="text-blue-600">
                      <strong>Start:</strong> {formatTime(log.startTime)}
                    </span>
                    <span className="text-green-600">
                      <strong>End:</strong> {formatTime(log.endTime)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-amber-600">
                      <strong>Duration:</strong> {calculateTeachingHours(log.startTime, log.endTime)} hours
                    </span>
                  </div>
                  {log.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Notes:</strong> {log.notes}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}

          {teachingLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No teaching logs found for the selected period.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeReports;