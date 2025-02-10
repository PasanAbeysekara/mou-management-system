'use client';
import { useState } from 'react';

interface MOUSubmission {
  id: string;
  title: string;
  date: string;
  partnerOrganization: string;
  purpose: string;
  description: string;
  datesSigned: string;
  validUntil: string;
  status: {
    legal: boolean;
    faculty: boolean;
    senate: boolean;
    ugc: boolean;
  };
  documents: {
    justification: string;
  };
}

export default function AdminPanel() {
  const [selectedMOU, setSelectedMOU] = useState<MOUSubmission | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data - replace with actual API call
  const mouSubmissions: MOUSubmission[] = [
    {
      id: '1',
      title: 'Partnership with ABC Corp',
      date: 'Oct 10, 2023',
      partnerOrganization: 'ABC Corp',
      purpose: 'Research Collaboration',
      description: 'Joint research project in AI and Machine Learning',
      datesSigned: '2023-10-10',
      validUntil: '2024-10-10',
      status: {
        legal: true,
        faculty: true,
        senate: false,
        ugc: false
      },
      documents: {
        justification: '/path/to/document.pdf'
      }
    },
    // Add more mock data as needed
  ];

  const handlePreview = (mou: MOUSubmission) => {
    setSelectedMOU(mou);
    setPreviewOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-6">MOU Submissions</h1>
      </div>
      <div className="space-y-4">
        {mouSubmissions.map((mou) => (
          <div key={mou.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="mb-1">
                  <span className="font-semibold">Title: </span>
                  {mou.title}
                </div>
                <div>
                  <span className="font-semibold">Date: </span>
                  {mou.date}
                </div>
              </div>

              {/* Approval Status Indicators */}
              <div className="flex space-x-4">
                <StatusIndicator
                  label="Legal"
                  approved={mou.status.legal}
                  active={true}
                />
                <StatusIndicator
                  label="Faculty"
                  approved={mou.status.faculty}
                  active={mou.status.legal}
                />
                <StatusIndicator
                  label="Senate"
                  approved={mou.status.senate}
                  active={mou.status.faculty}
                />
                <StatusIndicator
                  label="UGC"
                  approved={mou.status.ugc}
                  active={mou.status.senate}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreview(mou)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <PreviewIcon />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <DeleteIcon />
                </button>
                <button className="text-green-600 hover:text-green-800">
                  <AcceptIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Pagination */}
      <div className="mt-6 flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          className="px-3 py-1 rounded border hover:bg-gray-100"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-red-700 text-white' : 'hover:bg-gray-100'
              }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="px-3 py-1 rounded border hover:bg-gray-100"
          disabled={currentPage === 5}
        >
          Next
        </button>
      </div>

      {/* Custom Modal */}
      {previewOpen && selectedMOU && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">MOU Preview</h2>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <PreviewField label="Partner Organization" value={selectedMOU.partnerOrganization} />
              <PreviewField label="Purpose" value={selectedMOU.purpose} />
              <PreviewField label="Description" value={selectedMOU.description} />
              <div className="grid grid-cols-2 gap-4">
                <PreviewField label="Date Signed" value={selectedMOU.datesSigned} />
                <PreviewField label="Valid Until" value={selectedMOU.validUntil} />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Documents</h3>
                <a
                  href={selectedMOU.documents.justification}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Justification Document
                </a>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              >
                Approve
              </button>
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components remain the same
const StatusIndicator = ({ label, approved, active }: { label: string; approved: boolean; active: boolean }) => (
  <div className="flex flex-col items-center">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${!active ? 'bg-gray-200' :
        approved ? 'bg-green-500' : 'bg-blue-500'
      }`}>
      {approved && <CheckIcon />}
    </div>
    <span className="text-xs mt-1">{label}</span>
    <span className="text-xs">approval</span>
  </div>
);

const PreviewField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="font-semibold block text-sm text-gray-600">{label}</label>
    <p className="mt-1">{value}</p>
  </div>
);

// Icons remain the same
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PreviewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const AcceptIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


