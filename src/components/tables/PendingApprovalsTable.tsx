import { MOUSubmission, UserRole } from '@/types';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';

interface PendingApprovalsTableProps {
  mous: MOUSubmission[];
  userRole: UserRole;
}

export default function PendingApprovalsTable({ mous, userRole }: PendingApprovalsTableProps) {
  // Filter MOUs based on the admin step that is "not yet approved"
  const getPendingMOUs = () => {
    return mous.filter((mou) => {
      if (!mou.status || typeof mou.status !== 'object') {
        return false; // If status is missing or not an object, skip
      }

      // We assume status = { legal: {approved: boolean}, faculty: {...}, ... }
      // Adjust to your actual structure. Also, ensure the roles match.
      switch (userRole.toUpperCase()) {
        case 'LEGAL_ADMIN':
          return !mou.status.legal?.approved;
        case 'FACULTY_ADMIN':
          return mou.status.legal?.approved && !mou.status.faculty?.approved;
        case 'SENATE_ADMIN':
          return mou.status.faculty?.approved && !mou.status.senate?.approved;
        case 'UGC_ADMIN':
          return mou.status.senate?.approved && !mou.status.ugc?.approved;
        default:
          return false;
      }
    });
  };

  const handleApprove = async (mouId: string) => {
    // Implement approval logic, e.g. call /api/mous/approve
    // e.g.: await fetch(`/api/mous/${mouId}/approve`, { method: 'POST', body: JSON.stringify({ step: userRole }) });
    // Then refresh the table or trigger re-fetch
    console.log(`Approved MOU ID: ${mouId} by ${userRole}`);
  };

  const handleReject = async (mouId: string) => {
    // Implement rejection logic
    console.log(`Rejected MOU ID: ${mouId} by ${userRole}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Submitted By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th> */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {getPendingMOUs().map((mou) => (
            <tr key={mou.id}>
              <td className="px-6 py-4 whitespace-nowrap">{mou.title}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {mou.submittedBy}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {/* dateSubmitted is a DateTime in your model */}
                {new Date(mou.dateSubmitted).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status="pending" />
              </td>
              {/* <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <Button variant="primary" size="sm" onClick={() => handleApprove(mou.id)}>
                  Approve
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleReject(mou.id)}>
                  Reject
                </Button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
