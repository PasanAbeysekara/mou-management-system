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
          return true;
      }
    });
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
              <td className="px-6 py-4 whitespace-nowrap">
                <a
                  href={`${mou.documents.justification}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {mou.title}
                </a>
              </td>
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
