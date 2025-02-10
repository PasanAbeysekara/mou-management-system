const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
  
const StatusIndicator = ({ label, approved, active }: { label: string; approved: boolean; active: boolean }) => (
    <div className="flex flex-col items-center">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center ${
          !active ? 'bg-gray-200' : approved ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        {approved && <CheckIcon />}
      </div>
      <span className="text-xs mt-1">{label}</span>
      <span className="text-xs">approval</span>
    </div>
  );
  

export default StatusIndicator;