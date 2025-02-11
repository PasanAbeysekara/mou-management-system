import { MOUSubmission } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";

interface RecentApprovalsTableProps {
  mous: MOUSubmission[];
}

export default function RecentApprovalsTable({
  mous,
}: RecentApprovalsTableProps) {
  const [notifying, setNotifying] = useState<string | null>(null);

  const handleNotify = async (mouId: string) => {
    setNotifying(mouId);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mouId }),
      });
      if (!res.ok) {
        throw new Error("Failed to send notification");
      }
      toast.success("Notification sent");
    } catch (err) {
      console.error(err);
      toast.error("Error sending notification");
    } finally {
      setNotifying(null);
    }
  };

  function getRemainingDays(validUntil: string): string {
    const daysLeft = Math.ceil(
      (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft > 0 ? `${daysLeft} days left` : "Expired";
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Valid Until
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Remaining
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {mous.map((mou) => (
            <tr key={mou.id}>
              <td className="px-6 py-4">{mou.title}</td>
              <td className="px-6 py-4">Approved</td>
              <td className="px-6 py-4">
                {new Date(mou.validUntil).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {getRemainingDays(
                  new Date(mou.validUntil).toLocaleDateString()
                )}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleNotify(mou.id)}
                  className="text-blue-600 hover:text-blue-800"
                  disabled={notifying === mou.id}
                >
                  {notifying === mou.id ? "Notifying..." : "Notify"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
