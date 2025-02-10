'use client';
import { useEffect, useState } from 'react';
import { MOUSubmission } from '@/types/index';


export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<MOUSubmission[]>([]);

  useEffect(() => {
    checkExpiringMOUs();
  }, []);

  const checkExpiringMOUs = async () => {
    try {
      const response = await fetch('/api/mous/expiring');
      const expiringMOUs = await response.json();
      setNotifications(expiringMOUs);
    } catch (error) {
      console.error('Error checking expiring MOUs:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {notifications.map((mou) => (
        <div
          key={mou.id}
          className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-yellow-500"
        >
          <h3 className="font-semibold">MOU Expiring Soon</h3>
          <p className="text-sm text-gray-600">{mou.title}</p>
          <p className="text-sm text-gray-500">Expires: {mou.validUntil}</p>
          <button
            onClick={() => window.location.href = `/mou-submission/renew/${mou.id}`}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Renew Now
          </button>
        </div>
      ))}
    </div>
  );
}