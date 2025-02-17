'use client';

import ExpiringMOUsTable from '@/components/tables/ExpiringMOUsTable';
import PendingApprovalsTable from '@/components/tables/PendingApprovalsTable';
import RecentApprovalsTable from '@/components/tables/RecentApprovalsTable';
import UserSubmissionsTable from '@/components/tables/UserSubmissionsTable';
import { useAuth } from '@/context/AuthContext';
import { DashboardAnalytics, MOUSubmission, User, DomainKey } from '@/types';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  className?: string;
}

interface AdminDashboardContentProps {
  user: User;
  pendingApprovals: MOUSubmission[];
  domainApprovedMous: MOUSubmission[];
}

interface UserDashboardContentProps {
  user: User;
  recentMOUs: MOUSubmission[];
  expiringMOUs: MOUSubmission[];
}

function getDomainFromRole(role: string): DomainKey | 'unknown' {
  switch (role.toUpperCase()) {
    case 'LEGAL_ADMIN':
      return 'legal';
    case 'FACULTY_ADMIN':
      return 'faculty';
    case 'SENATE_ADMIN':
      return 'senate';
    case 'UGC_ADMIN':
      return 'ugc';
    default:
      return 'unknown';
  }
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [recentMOUs, setRecentMOUs] = useState<MOUSubmission[]>([]);
  const [expiringMOUs, setExpiringMOUs] = useState<MOUSubmission[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<MOUSubmission[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      if (isAdmin(user.role)) {
        fetchPendingApprovals();
      }
    }
  }, [user]);

  async function fetchDashboardData() {
    try {
      const [analyticsData, recentData, expiringData] = await Promise.all([
        fetch('/api/analytics').then(res => res.json()),
        fetch('/api/mous/recent').then(res => res.json()),
        fetch('/api/mous/expiring').then(res => res.json()),
      ]);

      setAnalytics(analyticsData);
      setRecentMOUs(recentData);
      setExpiringMOUs(expiringData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error fetching dashboard data');
    }
  }

  async function fetchPendingApprovals() {
    try {
      const res = await fetch('/api/mous/pending');
      if (!res.ok) throw new Error("Failed to fetch pending approvals");
      const data = await res.json();
      setPendingApprovals(data);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error("Error fetching pending approvals");
    }
  }

  const isAdmin = (role: string) =>
    ['LEGAL_ADMIN','FACULTY_ADMIN','SENATE_ADMIN','UGC_ADMIN','SUPER_ADMIN'].includes(role);

  // For Recently Approved, filter recentMOUs based on the domain approval.
  // const domain = user ? getDomainFromRole(user.role) : 'unknown';
  const domainApprovedMous = recentMOUs.filter((mou) => {
    if (!mou.status || typeof mou.status !== 'object') return false;
    return Object.values(mou.status).every((step) => step.approved === true);
  });

  if (!user) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard title="Total Submissions" value={analytics?.totalSubmissions || 0} />
        <AnalyticsCard title="Active MOUs" value={analytics?.activeSubmissions || 0} className="text-green-600" />
        <AnalyticsCard title="Pending Approval" value={analytics?.pendingSubmissions || 0} className="text-yellow-600" />
        <AnalyticsCard title="Expiring Soon" value={analytics?.expiringMOUs || 0} className="text-red-600" />
      </div>

      {/* Role-specific content */}
      {isAdmin(user.role) ? (
        <AdminDashboardContent 
          user={user} 
          pendingApprovals={pendingApprovals} 
          domainApprovedMous={domainApprovedMous} 
        />
      ) : (
        <UserDashboardContent 
          user={user} 
          recentMOUs={recentMOUs} 
          expiringMOUs={expiringMOUs} 
        />
      )}
    </div>
  );
}

// Helper components
const AnalyticsCard = ({ title, value, className = '' }: AnalyticsCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className={`text-3xl font-bold ${className}`}>{value}</p>
  </div>
);

const AdminDashboardContent = ({ user, pendingApprovals, domainApprovedMous }: AdminDashboardContentProps) => (
  <div className="space-y-6">
    <section>
      <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
      <PendingApprovalsTable mous={pendingApprovals} userRole={user.role} />
    </section>
    
    {user.role === 'SUPER_ADMIN' && (<section>
      <h2 className="text-xl font-semibold mb-4">Recently Approved</h2>
      <RecentApprovalsTable mous={domainApprovedMous} />
    </section>)}
    
  </div>
);

const UserDashboardContent = ({ user, recentMOUs, expiringMOUs }: UserDashboardContentProps) => (
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
