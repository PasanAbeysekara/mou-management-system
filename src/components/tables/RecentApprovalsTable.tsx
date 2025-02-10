import { MOUSubmission } from '@/types';

interface RecentApprovalsTableProps {
  mous: MOUSubmission[];
}

export default function RecentApprovalsTable({ mous }: RecentApprovalsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {mous.map((mou) => (
            <tr key={mou.id}>
              <td className="px-6 py-4">{mou.title}</td>
              <td className="px-6 py-4">Approved</td>
              <td className="px-6 py-4">{new Date(mou.dateSubmitted).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}