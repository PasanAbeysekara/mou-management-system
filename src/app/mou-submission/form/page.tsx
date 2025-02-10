'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function MOUSubmissionForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    partnerOrganization: '',
    purpose: '',
    description: '',
    datesSigned: '', // optional in DB but we'll still collect it
    validUntil: '',
    renewalOf: '',   // optional
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Construct the body to match your mou_submissions schema
      // status, documents, and history are required JSON fields in your schema
      // We'll include default or empty values here
      const payload = {
        ...formData,
        // If datesSigned is empty, we can pass null instead
        datesSigned: formData.datesSigned || null,
        renewalOf: formData.renewalOf || null,

        // Provide default JSON if user doesn't fill them in the UI
        status: {
          legal: { approved: false, date: null },
          faculty: { approved: false, date: null },
          senate: { approved: false, date: null },
          ugc: { approved: false, date: null },
        },
        documents: [], // or an array of file objects if you handle uploads
        history: [
          {
            action: 'Created',
            date: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch('/api/mou-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit MOU');
      }

      // Submission successful
      toast.success('MOU submitted successfully!');
      router.push('/mou-submission/success');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">MOU Submission Form</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TITLE (Required) */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            placeholder="Title of the MOU"
            className="w-full p-3 border rounded-md"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        {/* PARTNER ORGANIZATION (Required) */}
        <div>
          <label className="block mb-1 font-medium">Partner Organization</label>
          <input
            type="text"
            placeholder="e.g. Acme Corp"
            className="w-full p-3 border rounded-md"
            value={formData.partnerOrganization}
            onChange={(e) =>
              setFormData({ ...formData, partnerOrganization: e.target.value })
            }
            required
          />
        </div>

        {/* PURPOSE (Required) */}
        <div>
          <label className="block mb-1 font-medium">Purpose of the MOU</label>
          <input
            type="text"
            placeholder="Brief purpose statement"
            className="w-full p-3 border rounded-md"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            required
          />
        </div>

        {/* DESCRIPTION (Required) */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            placeholder="Detailed description"
            className="w-full p-3 border rounded-md h-32"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>

        {/* DATES */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Date Signed (optional)</label>
            <input
              type="date"
              className="w-full p-3 border rounded-md"
              value={formData.datesSigned}
              onChange={(e) =>
                setFormData({ ...formData, datesSigned: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Valid Until</label>
            <input
              type="date"
              className="w-full p-3 border rounded-md"
              value={formData.validUntil}
              onChange={(e) =>
                setFormData({ ...formData, validUntil: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* RENEWAL OF (Optional) */}
        <div>
          <label className="block mb-1 font-medium">Renewal Of (optional)</label>
          <input
            type="text"
            placeholder="ID of the MOU being renewed"
            className="w-full p-3 border rounded-md"
            value={formData.renewalOf}
            onChange={(e) => setFormData({ ...formData, renewalOf: e.target.value })}
          />
        </div>

        {/* Additional Buttons for Documents (optional UI logic) */}
        <button
          className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700"
          type="button"
        >
          Download MOU Justification Template
        </button>
        <button
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
          type="button"
        >
          Upload the filled Justification Document
        </button>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full bg-red-700 text-white p-3 rounded-md hover:bg-red-800"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
