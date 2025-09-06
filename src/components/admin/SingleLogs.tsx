import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

interface ArrivalLog {
  _id: string;
  date: string;
  arrivalTime: string;
  notes: string;
}

interface TeachingLog {
  _id: string;
  classId: {
    _id: string;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

interface DayLogs {
  arrival?: ArrivalLog;
  teaching: TeachingLog[];
}

const SingleLogs: React.FC = () => {
    const { id } = useParams()
    const [user, setUser] = useState()
  const [logs, setLogs] = useState<{ [date: string]: DayLogs }>({});
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchMyLogs = async () => {
      try {
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );     

        const response = await fetch(
          `${API_BASE}/time-logs/staff-logs/${id}`,
          {
            method: "POST",
            headers: getAuthHeaders(),          
            body: JSON.stringify({ startOfMonth, endOfMonth})
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Organize logs by date
          const logsByDate: { [date: string]: DayLogs } = {};

          data.arrivalLogs.forEach((log: ArrivalLog) => {
            const dateKey = log.date.split("T")[0];
            if (!logsByDate[dateKey]) {
              logsByDate[dateKey] = { teaching: [] };
            }
            logsByDate[dateKey].arrival = log;
          });

          data.teachingLogs.forEach((log: TeachingLog) => {
            const dateKey = log.date.split("T")[0];
            if (!logsByDate[dateKey]) {
              logsByDate[dateKey] = { teaching: [] };
            }
            logsByDate[dateKey].teaching.push(log);
          });

          setLogs(logsByDate);
        } else {
          toast.error("Failed to fetch logs");
        }
      } catch (error) {
        toast.error("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };
    const uresp =async ()=>{
        const response = await fetch(`${API_BASE}/staff/${id}`,{
            headers: getAuthHeaders()
        })
        const r = await response.json()
        setUser(r.staff.fullName)
    }
    uresp()
    fetchMyLogs();
  }, [currentDate]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  const getDayLogs = (date: Date): DayLogs | null => {
    const dateKey = formatDate(date);
    return logs[dateKey] || null;
  };

  const hasLogs = (date: Date): boolean => {
    const dayLogs = getDayLogs(date);
    return !!(dayLogs?.arrival || dayLogs?.teaching.length);
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">{user}'s Time Logs</h2>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2 h-16"></div>;
              }

              const dateKey = formatDate(day);
              const dayLogs = getDayLogs(day);
              const hasLogsForDay = hasLogs(day);
              const isSelected = selectedDate === dateKey;
              const isToday = formatDate(new Date()) === dateKey;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className={`p-2 h-16 border rounded-lg transition duration-200 text-left relative ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : hasLogsForDay
                      ? 'border-green-300 bg-green-50 hover:bg-green-100'
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="text-sm font-medium text-gray-800">
                    {day.getDate()}
                  </div>
                  
                  {hasLogsForDay && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="flex space-x-1">
                        {dayLogs?.arrival && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Arrival logged"></div>
                        )}
                        {dayLogs?.teaching && dayLogs.teaching.length > 0 && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Teaching logged"></div>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Logs for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
          </div>

          <div className="p-4">
            {logs[selectedDate] ? (
              <div className="space-y-6">
                {/* Arrival Log */}
                {logs[selectedDate].arrival && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-blue-800">Arrival Time</h4>
                    </div>
                    <p className="text-blue-700">
                      <strong>Time:</strong> {formatTime(logs[selectedDate].arrival!.arrivalTime)}
                    </p>
                    {logs[selectedDate].arrival!.notes && (
                      <p className="text-blue-700 mt-2">
                        <strong>Notes:</strong> {logs[selectedDate].arrival!.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Teaching Logs */}
                {logs[selectedDate].teaching.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-green-800">Teaching Sessions</h4>
                    </div>
                    {logs[selectedDate].teaching.map((log) => (
                      <div key={log._id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2">{log.classId.name}</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                          <p><strong>Start:</strong> {formatTime(log.startTime)}</p>
                          <p><strong>End:</strong> {formatTime(log.endTime)}</p>
                          <p><strong>Duration:</strong> {calculateTeachingHours(log.startTime, log.endTime)} hours</p>
                        </div>
                        {log.notes && (
                          <p className="text-green-700 mt-2 text-sm">
                            <strong>Notes:</strong> {log.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!logs[selectedDate].arrival && logs[selectedDate].teaching.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No logs found for this date.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No logs found for this date.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Arrival logged</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Teaching logged</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border-2 border-blue-200 rounded-full mr-2"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleLogs;