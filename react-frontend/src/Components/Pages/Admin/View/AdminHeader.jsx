import React from "react";
import { Menu } from "lucide-react";

export default function AdminHeader({ setSidebarOpen }) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold">
            AD
          </div>
          <span className="hidden sm:inline text-sm text-gray-600">Admin</span>
        </div>
      </div>
    </header>
  );
}
