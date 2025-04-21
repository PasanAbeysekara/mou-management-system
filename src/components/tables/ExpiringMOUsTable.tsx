import { MOUSubmission } from '@/types';

interface ExpiringMOUsTableProps {
  mous: MOUSubmission[];
}

export default function ExpiringMOUsTable({ mous }: ExpiringMOUsTableProps) {
  const handleRenew = (mouId: string) => {
    // Send user to the MOU form with a "renewId" query param
    window.location.href = `/mou-submission/form?renewId=${mouId}`;
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
              Expires
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {mous.map((mou) => (
            <tr key={mou.id}>
              <td className="px-6 py-4">
                <a
                  href={`${mou.documents.justification}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {mou.title}
                </a>
              </td>
              <td className="px-6 py-4">
                {new Date(mou.validUntil).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleRenew(mou.id)}
                >
                  Renew
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
