"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/**
 * Page for SUPER_ADMIN to manage or create domain admins.
 */
export default function AdminManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // We only allow SUPER_ADMIN to view this page
  useEffect(() => {
    console.log("Checking session", session);
    if (session && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/");
    }
  }, [session, router]);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("LEGAL_ADMIN"); // default pick
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, name, department }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin");
      }
      toast.success(
        `Admin ${data.user.email} created with role ${data.user.role}`
      );
      // Clear fields
      setEmail("");
      setRole("LEGAL_ADMIN");
      setName("");
      setDepartment("");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unknown error");
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto m-10">
      <h1 className="text-2xl font-bold mb-4">
        Admin Management (SUPER_ADMIN only)
      </h1>
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
          <label>Role</label>
          <select
            className="w-full border rounded p-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="LEGAL_ADMIN">LEGAL_ADMIN</option>
            <option value="FACULTY_ADMIN">FACULTY_ADMIN</option>
            <option value="SENATE_ADMIN">SENATE_ADMIN</option>
            <option value="UGC_ADMIN">UGC_ADMIN</option>
            {/* Add more domain-based roles as needed */}
          </select>
        </div>
        <div>
          <label>Name (optional)</label>
          <input
            className="w-full border rounded p-2"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Department (optional)</label>
          <input
            className="w-full border rounded p-2"
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className=" bg-red-700 text-white p-3 rounded-md hover:bg-red-800"
          >
            Create Admin
          </button>
        </div>
      </form>
    </div>
  );
}
