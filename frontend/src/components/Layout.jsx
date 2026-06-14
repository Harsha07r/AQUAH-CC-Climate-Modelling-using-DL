// src/components/Layout.jsx
import { useState } from 'react';
import Topbar from './Navbar';
import SideBar from './SideBar';

export default function Layout({ children, user, onLogout, currentView, setCurrentView }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100 p-0 sm:p-2 md:p-4 font-sans text-gray-800">
      <div className="flex w-full h-full bg-white sm:rounded-[2rem] overflow-hidden shadow-xl border border-gray-200 relative">
        
        <SideBar 
   isOpen={isSidebarOpen} 
   toggleSidebar={toggleSidebar} 
   currentView={currentView} 
   setCurrentView={setCurrentView} 
   user={user} 
   onLogout={onLogout} 
/>
        
        <div className="flex-1 flex flex-col relative w-full overflow-hidden">
          <Topbar toggleSidebar={toggleSidebar} />
          
          {/* This is where your Chat, Home Page, or Dashboard will inject itself */}
          <main className="flex-1 overflow-hidden relative">
            {children}
          </main>
          
        </div>
      </div>
    </div>
  );
}