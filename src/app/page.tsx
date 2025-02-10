'use client';
import ExpiringMOUsTable from '@/components/tables/ExpiringMOUsTable';
import PendingApprovalsTable from '@/components/tables/PendingApprovalsTable';
import RecentApprovalsTable from '@/components/tables/RecentApprovalsTable';
import UserSubmissionsTable from '@/components/tables/UserSubmissionsTable';
import { useAuth } from '@/context/AuthContext';
import { isAdmin } from '@/lib/utils';
import { DashboardAnalytics, MOUSubmission, User } from '@/types/index';
import { useState, useEffect } from 'react';


interface AnalyticsCardProps {
  title: string;
  value: string | number;
  className?: string;
}

interface AdminDashboardContentProps {
  user: User;
  recentMOUs: MOUSubmission[];
}

interface UserDashboardContentProps {
  user: User;
  recentMOUs: MOUSubmission[];
  expiringMOUs: MOUSubmission[];
}

export default function Home() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [recentMOUs, setRecentMOUs] = useState<MOUSubmission[]>([]);
  const [expiringMOUs, setExpiringMOUs] = useState<MOUSubmission[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [analyticsData, mous] = await Promise.all([
        fetch('/api/analytics').then(res => res.json()),
        fetch('/api/mous/recent').then(res => res.json())
      ]);
      setAnalytics(analyticsData);
      setRecentMOUs(mous);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (!user) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Submissions"
          value={analytics?.totalSubmissions || 0}
        />
        <AnalyticsCard
          title="Active MOUs"
          value={analytics?.activeSubmissions || 0}
          className="text-green-600"
        />
        <AnalyticsCard
          title="Pending Approval"
          value={analytics?.pendingSubmissions || 0}
          className="text-yellow-600"
        />
        <AnalyticsCard
          title="Expiring Soon"
          value={analytics?.expiringMOUs || 0}
          className="text-red-600"
        />
      </div>

      {/* Role-specific content */}
      {isAdmin(user.role) ? (
        <AdminDashboardContent user={user} recentMOUs={recentMOUs} />
      ) : (
        <UserDashboardContent user={user} recentMOUs={recentMOUs} expiringMOUs={expiringMOUs} />
      )}
    </div>
  );
}

// Helper components
const AnalyticsCard = ({ title, value, className = '' } : AnalyticsCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className={`text-3xl font-bold ${className}`}>{value}</p>
  </div>
);

const AdminDashboardContent = ({ user, recentMOUs } : AdminDashboardContentProps) => (
  <div className="space-y-6">
    <section>
      <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
      <PendingApprovalsTable mous={recentMOUs} userRole={user.role} />
    </section>
    
    <section>
      <h2 className="text-xl font-semibold mb-4">Recently Approved</h2>
      <RecentApprovalsTable mous={recentMOUs} />
    </section>
  </div>
);

const UserDashboardContent = ({ user, recentMOUs, expiringMOUs } : UserDashboardContentProps) => (
  <div className="space-y-6">
    <section>
      <h2 className="text-xl font-semibold mb-4">Your MOU Submissions</h2>
      <UserSubmissionsTable mous={recentMOUs} />
    </section>
    
    {expiringMOUs.length > 0 && (
      <section>
        <h2 className="text-xl font-semibold mb-4">MOUs Expiring Soon</h2>
        <ExpiringMOUsTable mous={expiringMOUs} />
      </section>
    )}
  </div>
);