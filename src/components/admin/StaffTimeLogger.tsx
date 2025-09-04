import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Staff {
  _id: string;
  email: string;
  fullName: string;
  role: string;
}

interface Class {
  _id: string;
  name: string;
  description: string;
}

const StaffTimeLogger: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeForm, setActiveForm] = useState<'arrival' | 'teaching'>('arrival');
  const [loading, setLoading] = useState(false);


  const [arrivalForm, setArrivalForm] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    arrivalTime: '',
    notes: ''
  });

  const [teachingForm, setTeachingForm] = useState({
    staffId: '',
    classId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    notes: ''
  });

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchStaff();
    fetchClasses();
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_BASE}/staff`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff.filter((member: Staff) => member.role === 'staff'));
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/classes`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleArrivalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  

    try {
      const response = await fetch(`${API_BASE}/time-logs/arrival`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(arrivalForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Arrival time logged successfully!');
        setArrivalForm({
          staffId: '',
          date: new Date().toISOString().split('T')[0],
          arrivalTime: '',
          notes: ''
        });
      } else {
        toast.error(data.message || 'Failed to log arrival time');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleTeachingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/time-logs/teaching`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(teachingForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Teaching time logged successfully!');
        setTeachingForm({
          staffId: '',
          classId: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          notes: ''
        });
      } else {
        toast.error(data.message || 'Failed to log teaching time');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const setCurrentTime = (form: 'arrival' | 'teaching', field?: 'startTime' | 'endTime') => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    if (form === 'arrival') {
      setArrivalForm({ ...arrivalForm, arrivalTime: timeString });
    } else if (form === 'teaching' && field) {
      setTeachingForm({ ...teachingForm, [field]: timeString });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Users className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Staff Time Logging</h2>
        <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
          Admin Supervised
        </span>
      </div>

      <p className="text-gray-600 mb-6">
        As an admin, you can log arrival and teaching times for staff members under your supervision.
      </p>

      {/* Form Type Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveForm('arrival')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition duration-200 ${
            activeForm === 'arrival'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Log Arrival Time
        </button>
        <button
          onClick={() => setActiveForm('teaching')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition duration-200 ${
            activeForm === 'teaching'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Log Teaching Time
        </button>
      </div>

      {/* Arrival Form */}
      {activeForm === 'arrival' && (
        <form onSubmit={handleArrivalSubmit} className="max-w-md space-y-6">
          <div>
            <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-2">
              Staff Member
            </label>
            <select
              id="staffId"
              value={arrivalForm.staffId}
              onChange={(e) => setArrivalForm({ ...arrivalForm, staffId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select staff member</option>
              {staff.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="arrivalDate"
              value={arrivalForm.date}
              onChange={(e) => setArrivalForm({ ...arrivalForm, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-700 mb-2">
              Arrival Time
            </label>
            <div className="flex space-x-2">
              <input
                type="time"
                id="arrivalTime"
                value={arrivalForm.arrivalTime}
                onChange={(e) => setArrivalForm({ ...arrivalForm, arrivalTime: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setCurrentTime('arrival')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                Now
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="arrivalNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="arrivalNotes"
              value={arrivalForm.notes}
              onChange={(e) => setArrivalForm({ ...arrivalForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging...' : 'Log Arrival Time'}
          </button>
        </form>
      )}

      {/* Teaching Form */}
      {activeForm === 'teaching' && (
        <form onSubmit={handleTeachingSubmit} className="max-w-md space-y-6">
          <div>
            <label htmlFor="teachingStaffId" className="block text-sm font-medium text-gray-700 mb-2">
              Staff Member
            </label>
            <select
              id="teachingStaffId"
              value={teachingForm.staffId}
              onChange={(e) => setTeachingForm({ ...teachingForm, staffId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select staff member</option>
              {staff.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              id="classId"
              value={teachingForm.classId}
              onChange={(e) => setTeachingForm({ ...teachingForm, classId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="teachingDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="teachingDate"
              value={teachingForm.date}
              onChange={(e) => setTeachingForm({ ...teachingForm, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <div className="flex space-x-1">
                <input
                  type="time"
                  id="startTime"
                  value={teachingForm.startTime}
                  onChange={(e) => setTeachingForm({ ...teachingForm, startTime: e.target.value })}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setCurrentTime('teaching', 'startTime')}
                  className="px-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 text-xs"
                >
                  Now
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <div className="flex space-x-1">
                <input
                  type="time"
                  id="endTime"
                  value={teachingForm.endTime}
                  onChange={(e) => setTeachingForm({ ...teachingForm, endTime: e.target.value })}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setCurrentTime('teaching', 'endTime')}
                  className="px-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 text-xs"
                >
                  Now
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="teachingNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="teachingNotes"
              value={teachingForm.notes}
              onChange={(e) => setTeachingForm({ ...teachingForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Class details, topics covered, etc..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging...' : 'Log Teaching Time'}
          </button>
        </form>
      )}
    </div>
  );
};

export default StaffTimeLogger;