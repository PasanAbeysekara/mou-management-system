'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SuperRegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register-super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register super admin');
      }

      toast.success('Super Admin created successfully!');
      // Optionally redirect them to set-password page or login
      router.push('/set-password');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Unknown error occurred');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-10">
      <h1 className="text-2xl font-bold mb-4">One-Time Super Admin Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Email</label>
          <input
            className="w-full border rounded p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Name (Optional)</label>
          <input
            className="w-full border rounded p-2"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Register Super Admin
        </button>
      </form>
    </div>
  );
}
