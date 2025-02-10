import { MOUSubmission, UserRole } from '@/types';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';

interface PendingApprovalsTableProps {
  mous: MOUSubmission[];
  userRole: UserRole;
}

export default function PendingApprovalsTable({ mous, userRole }: PendingApprovalsTableProps) {
  const getPendingMOUs = () => {
    return mous.filter(mou => {
      switch (userRole) {
        case 'legal_admin':
          return !mou.status.legal.approved;
        case 'faculty_admin':
          return mou.status.legal.approved && !mou.status.faculty.approved;
        case 'senate_admin':
          return mou.status.faculty.approved && !mou.status.senate.approved;
        case 'ugc_admin':
          return mou.status.senate.approved && !mou.status.ugc.approved;
        default:
          return false;
      }
    });
  };

  const handleApprove = async (mouId: string) => {
    // Implement approval logic
  };

  const handleReject = async (mouId: string) => {
    // Implement rejection logic
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {getPendingMOUs().map((mou) => (
            <tr key={mou.id}>
              <td className="px-6 py-4 whitespace-nowrap">{mou.title}</td>
              <td className="px-6 py-4 whitespace-nowrap">{mou.submittedBy}</td>
              <td className="px-6 py-4 whitespace-nowrap">{mou.dateSubmitted}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status="pending" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(mou.id)}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleReject(mou.id)}
                >
                  Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}