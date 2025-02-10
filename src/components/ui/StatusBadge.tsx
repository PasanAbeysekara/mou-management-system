interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200', 
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
