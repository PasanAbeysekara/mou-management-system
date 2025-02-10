"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="University Logo"
                width={48}
                height={48}
                className="mr-3"
              />
            </Link>
            <div>
              <h1 className="text-red-700 text-xl font-bold">MOU Manager</h1>
              <p className="text-sm text-gray-600">
                University of Jayawardenapura
              </p>
            </div>
          </div>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-8">
              {[
                { name: "Dashboard", path: "/" },
                { name: "MOU Submission", path: "/mou-submission" },
                ...(user.role !== "USER"
                  ? [{ name: "Admin Panel", path: "/admin-panel" }]
                  : []),
              ].map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 text-gray-700 relative group ${
                    isActive(item.path) ? "text-red-700" : "hover:text-red-700"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-red-700 transform origin-left transition-transform duration-300 ${
                      isActive(item.path)
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              ))}
            </nav>
          )}

          {/* Right side - Auth & Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-gray-600 hover:text-red-700 relative"
                  >
                    <NotificationsIcon className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 rounded-full text-xs text-white flex items-center justify-center">
                      2
                    </span>
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <NotificationItem
                          title="MOU Expiring Soon"
                          message="Your MOU with ABC Corp is expiring in 30 days"
                          time="2 hours ago"
                        />
                        <NotificationItem
                          title="MOU Approved"
                          message="Your MOU submission has been approved by Legal"
                          time="1 day ago"
                        />
                      </div>
                      <div className="px-4 py-2 border-t text-center">
                        <Link
                          href="/notifications"
                          className="text-sm text-red-700 hover:text-red-800"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                      <Image
                        // src={user.avatar || "/avatar-placeholder.png"}
                        src={"/logo.png"}
                        alt="User avatar"
                        width={32}
                        height={32}
                      />
                    </div>
                    <span className="hidden md:block text-sm text-gray-700">
                      {user.name}
                    </span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <PersonIcon className="h-4 w-4" />
                          <span>Your Profile</span>
                        </div>
                      </Link>
                      {user.role === "SUPER_ADMIN" && (
                        <Link
                          href="/admin-management"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center space-x-2">
                            <AdminPanelSettingsIcon className="h-4 w-4" />
                            <span>Admin Management</span>
                          </div>
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <SettingsIcon className="h-4 w-4" />
                          <span>Settings</span>
                        </div>
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <LogoutIcon className="h-4 w-4" />
                          <span>Sign out</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-red-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NotificationItem({
  title,
  message,
  time,
}: {
  title: string;
  message: string;
  time: string;
}) {
  return (
    <div className="px-4 py-3 hover:bg-gray-50 border-b last:border-b-0">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <p className="text-sm text-gray-600">{message}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  );
}
