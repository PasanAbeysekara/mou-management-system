"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      toast.success('Password updated successfully! Please login again.');
      logout();
      router.push('/login');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Unknown error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-6 rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Change Your Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>New Password</label>
          <input
            className="w-full border rounded p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password</label>
          <input
            className="w-full border rounded p-2"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
