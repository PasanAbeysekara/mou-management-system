'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import OrganizationMapPicker from '@/components/OrganizationMapPicker';

export default function OrganizationCreationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Organization name is required.");
      return;
    }
    if (!location) {
      toast.error("Please select a location from the map.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address: location.address, lat: location.lat, lng: location.lng }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }
      const org = await res.json();
      toast.success(`Organization "${org.name}" created successfully.`);
      setName('');
      setLocation(null);
      // Optionally, redirect or refresh page.
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Add Organization</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Name */}
        <div>
          <label className="block mb-1 font-medium">Organization Name</label>
          <input
            type="text"
            placeholder="e.g. Acme Corp"
            className="w-full p-3 border rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {/* Map Picker for Organization Location */}
        <div>
          <label className="block mb-1 font-medium">Select Organization Location</label>
          <OrganizationMapPicker onLocationSelect={setLocation} />
          {location && (
            <p className="mt-2 text-sm text-gray-600">
              Selected Address: {location.address || `${location.lat}, ${location.lng}`}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-700 text-white p-3 rounded-md hover:bg-red-800"
        >
          {loading ? 'Creating...' : 'Create Organization'}
        </button>
      </form>
    </div>
  );
}
