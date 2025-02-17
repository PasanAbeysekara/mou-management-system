import { MOUSubmission } from '@/types';
import StatusIndicator from '@/components/ui/StatusIndicator';

interface UserSubmissionsTableProps {
  mous: MOUSubmission[];
}

export default function UserSubmissionsTable({ mous }: UserSubmissionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Submitted By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Valid Until
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {mous.map((mou) => (
            <tr key={mou.id}>
              <td className="px-6 py-4">{mou.title}</td>
              <td className="px-6 py-4">
                {/* Example: show all stages that are approved */}
                {/* {mou.status.legal.approved && 'Legal '}
                {mou.status.faculty.approved && 'Faculty '}
                {mou.status.senate.approved && 'Senate '} */}
                <div className="flex space-x-4">
                  <StatusIndicator
                    label="Legal"
                    approved={Boolean(mou.status.legal.approved)}
                    active={true}
                  />
                  <StatusIndicator
                    label="Faculty"
                    approved={Boolean(mou.status.faculty.approved)}
                    active={Boolean(mou.status.legal.approved)}
                  />
                  <StatusIndicator
                    label="Senate & Council"
                    approved={Boolean(mou.status.senate.approved)}
                    active={Boolean(mou.status.faculty.approved)}
                  />
                  <StatusIndicator
                    label="UGC"
                    approved={Boolean(mou.status.ugc.approved)}
                    active={Boolean(mou.status.senate.approved)}
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                {mou.submittedBy}
              </td>
              <td className="px-6 py-4">
                {new Date(mou.validUntil).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {new Date(mou.dateSubmitted).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
