import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
};
