import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StaffManagement from './admin/StaffManagement';
import ClassManagement from './admin/ClassManagement';
import TimeReports from './admin/TimeReports';
import StaffTimeLogger from './admin/StaffTimeLogger';
import { Users, BookOpen, Clock, LogOut, BarChart3, Timer } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logging');
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'logging', label: 'Staff Time Logging', icon: Timer },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'reports', label: 'Time Reports', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'logging':
        return <StaffTimeLogger />;
      case 'staff':
        return <StaffManagement />;
      case 'classes':
        return <ClassManagement />;
      case 'reports':
        return <TimeReports />;
      default:
        return <StaffTimeLogger />;
    }
  };

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
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;