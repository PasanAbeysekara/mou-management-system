'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MOUSubmission } from '@/types';
import StatusIndicator from '@/components/ui/StatusIndicator';
// If you have a user or AuthContext:
import { useAuth } from '@/context/AuthContext';

// Helper Components remain the same

const PreviewField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="font-semibold block text-sm text-gray-600">{label}</label>
    <p className="mt-1">{value}</p>
  </div>
);

// Icons
const PreviewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12z" />
  </svg>
);
const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const AcceptIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function AdminPanel() {
  const router = useRouter();
  const { user } = useAuth();  // if you have an AuthContext
  const [mouSubmissions, setMouSubmissions] = useState<MOUSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedMOU, setSelectedMOU] = useState<MOUSubmission | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  // On component mount, fetch data
  useEffect(() => {
    if (!user) return;
    fetchPendingMous();
  }, [user]);

  async function fetchPendingMous() {
    setLoading(true);
    try {
      const res = await fetch('/api/mous/pending');
      if (!res.ok) {
        throw new Error('Failed to fetch pending MOUs');
      }
      const data: MOUSubmission[] = await res.json();
      setMouSubmissions(data);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching pending MOUs');
    } finally {
      setLoading(false);
    }
  }

  // Handle preview
  const handlePreview = (mou: MOUSubmission) => {
    setSelectedMOU(mou);
    setPreviewOpen(true);
  };

  // Approve
  const handleApprove = async (mouId: string) => {
    try {
      const res = await fetch('/api/mous/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mouId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to approve MOU');
      }
      toast.success('MOU approved successfully');
      // Refresh the table
      fetchPendingMous();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Unknown error');
      }
    }
  };

  // Reject
  const handleReject = async (mouId: string) => {
    try {
      const res = await fetch('/api/mous/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mouId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to reject MOU');
      }
      toast.success('MOU rejected');
      fetchPendingMous();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Unknown error');
      }
    }
  };

  // Simple pagination placeholders
  const pageSize = 5;
  const totalPages = Math.ceil(mouSubmissions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = mouSubmissions.slice(startIndex, startIndex + pageSize);

  if (!user) {
    return <div className="p-6">Please log in as a domain admin.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-6">Domain Admin Panel</h1>
        {loading && <p>Loading Pending MOUs...</p>}
      </div>

      <div className="space-y-4">
        {!loading && pageData.map((mou) => {
          return (
            <div key={mou.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="mb-1">
                    <span className="font-semibold">Title: </span>
                    {mou.title}
                  </div>
                  <div>
                    <span className="font-semibold">Date: </span>
                    {/* if dateSubmitted is a string */}
                    {new Date(mou.dateSubmitted).toLocaleDateString()}
                  </div>
                </div>
  
                {/* Approval Status Indicators */}
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
                    label="Senate"
                    approved={Boolean(mou.status.senate.approved)}
                    active={Boolean(mou.status.faculty.approved)}
                  />
                  <StatusIndicator
                    label="UGC"
                    approved={Boolean(mou.status.ugc.approved)}
                    active={Boolean(mou.status.senate.approved)}
                  />
                </div>
  
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreview(mou)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Preview"
                  >
                    <PreviewIcon />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleReject(mou.id)}
                    title="Reject"
                  >
                    <DeleteIcon />
                  </button>
                  <button
                    className="text-green-600 hover:text-green-800"
                    onClick={() => handleApprove(mou.id)}
                    title="Approve"
                  >
                    <AcceptIcon />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 rounded border hover:bg-gray-100"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded border ${
              currentPage === page ? 'bg-red-700 text-white' : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-3 py-1 rounded border hover:bg-gray-100"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Preview Modal */}
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
              <PreviewField
                label="Partner Organization"
                value={selectedMOU.partnerOrganization}
              />
              <PreviewField label="Purpose" value={selectedMOU.purpose} />
              <PreviewField label="Description" value={selectedMOU.description} />
              <div className="grid grid-cols-2 gap-4">
                <PreviewField label="Date Signed" value={selectedMOU.datesSigned ? new Date(selectedMOU.datesSigned).toLocaleDateString() : 'Not specified'} />
                <PreviewField label="Valid Until" value={selectedMOU.validUntil ? new Date(selectedMOU.validUntil).toLocaleDateString() : 'Not specified'} />
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
                onClick={() => {
                  setPreviewOpen(false);
                  handleApprove(selectedMOU.id);
                }}
              >
                Approve
              </button>
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                onClick={() => {
                  setPreviewOpen(false);
                  handleReject(selectedMOU.id);
                }}
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
