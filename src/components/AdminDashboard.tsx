import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StaffManagement from './admin/StaffManagement';
import ClassManagement from './admin/ClassManagement';
import TimeReports from './admin/TimeReports';
import StaffTimeLogger from './admin/StaffTimeLogger';
import { Users, BookOpen, Clock, LogOut, BarChart3, Timer } from 'lucide-react';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SingleLogs from './admin/SingleLogs';

const tabs = [
  { id: 'logging', label: 'Staff Time Logging', icon: Timer, path: '/admin/logging' },
  { id: 'staff', label: 'Staff Management', icon: Users, path: '/admin/staff' },
  { id: 'classes', label: 'Classes', icon: BookOpen, path: '/admin/classes' },
  { id: 'reports', label: 'Time Reports', icon: BarChart3, path: '/admin/reports' },
];

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="hidden lg:block lg:text-xl lg:font-bold text-gray-800">Staff Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.fullName}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="lg:flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname.startsWith(tab.path);
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <Routes>
            <Route path="/admin/logging" element={<StaffTimeLogger />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/classes" element={<ClassManagement />} />
            <Route path="/admin/reports" element={<TimeReports />} />
            <Route path="/admin/staff/:id" element={<SingleLogs />} />
            {/* Default route */}
            <Route path="*" element={<Navigate to="/admin/logging" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;