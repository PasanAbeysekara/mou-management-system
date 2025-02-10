'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MOUSubmissionForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    partnerOrganization: '',
    purpose: '',
    description: '',
    datesSigned: '',
    validUntil: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    router.push('/mou-submission/success');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">MOU Submission Form</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            placeholder="Partner Organization"
            className="w-full p-3 border rounded-md"
            value={formData.partnerOrganization}
            onChange={(e) => setFormData({...formData, partnerOrganization: e.target.value})}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Purpose of the MOU"
            className="w-full p-3 border rounded-md"
            value={formData.purpose}
            onChange={(e) => setFormData({...formData, purpose: e.target.value})}
          />
        </div>
        <div>
          <textarea
            placeholder="Description"
            className="w-full p-3 border rounded-md h-32"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            placeholder="Date Signed"
            className="w-full p-3 border rounded-md"
            value={formData.datesSigned}
            onChange={(e) => setFormData({...formData, datesSigned: e.target.value})}
          />
          <input
            type="date"
            placeholder="Valid Until"
            className="w-full p-3 border rounded-md"
            value={formData.validUntil}
            onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
          />
        </div>
        <button className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700">
          Download MOU Justification Template
        </button>
        <button className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700">
          Upload the filled Justification Document
        </button>
        <button type="submit" className="w-full bg-red-700 text-white p-3 rounded-md hover:bg-red-800">
          Submit
        </button>
      </form>
    </div>
  );
}