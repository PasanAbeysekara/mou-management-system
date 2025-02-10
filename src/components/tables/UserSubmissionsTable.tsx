import { MOUSubmission } from '@/types';

interface UserSubmissionsTableProps {
  mous: MOUSubmission[];
}

export default function UserSubmissionsTable({ mous }: UserSubmissionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {mous.map((mou) => (
            <tr key={mou.id}>
              <td className="px-6 py-4">{mou.title}</td>
              <td className="px-6 py-4">
                {Object.entries(mou.status).map(([stage, status]) => 
                  status.approved ? `${stage}, ` : ''
                )}
              </td>
              <td className="px-6 py-4">{new Date(mou.dateSubmitted).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}