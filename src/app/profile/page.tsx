"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { update } = useSession(); 

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    // department: "",
    role: "",
    avatar: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email,
        role: user.role,
        avatar: user.avatar || "/logo.png",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setProfile({ ...profile, avatar: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();

      // Update the session explicitly here:
      await update({ user: { name: data.user.name } });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile");
    }
  };
  

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mt-10 mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>

      {/* <div className="flex items-center space-x-6 mb-6">
        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100">
          <Image
            src={profile.avatar || "/logo.png"}
            alt="Avatar"
            fill
            className="object-cover"
          />
        </div>
        <input type="file" onChange={handleAvatarChange} />
      </div> */}

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            className="w-full border rounded px-3 py-2"
            value={profile.name}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            value={profile.email}
            readOnly
          />
        </div>

        {/* <div>
          <label className="block font-medium">Department</label>
          <input
            type="text"
            name="department"
            className="w-full border rounded px-3 py-2"
            value={profile.department}
            onChange={handleInputChange}
          />
        </div> */}

        <div>
          <label className="block font-medium">Role</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            value={profile.role}
            readOnly
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
            onClick={logout}
          >
            Logout
          </button>

          <button
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
