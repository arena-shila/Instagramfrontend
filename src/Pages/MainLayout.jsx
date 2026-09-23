import { useState, useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { default as Navbar }from "./Navbar";
import { UserContext } from "../App";
import { connectSocket, disconnectSocket } from "../socket";

import Sidebar from "../Component/Sidebar";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { guser } = useContext(UserContext);

  useEffect(() => {
  if (!guser?._id) return;
    connectSocket(guser._id);
    return () => disconnectSocket();
  }, [guser?._id]);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      
      {/* 1. TOP NAVBAR (80px / h-20 Fixed height) */}
      <div className="flex-shrink-0 z-50 bg-gray-900 border-b border-gray-800">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-72 bg-gray-900 border-r border-gray-800 shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
              <span className="text-sm uppercase tracking-widest text-slate-400">Menu</span>
              <button
                className="text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                onClick={() => setSidebarOpen(false)}
              >
                Close
              </button>
            </div>
            <Sidebar onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      ) : null}

      {/* 2. BOTTOM SECTION: Sidebar + Center Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar (Desktop pe dikhega) */}
        <aside className="hidden md:block flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Dynamic Center Pages (Home, Chat, Contact) */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}

export default MainLayout;