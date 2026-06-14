// src/components/Topbar.jsx
import { Bell, Menu } from 'lucide-react';

export default function Navbar({ toggleSidebar }) {
  return (
    <header className="flex justify-between md:justify-end items-center p-4 md:p-6 gap-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-30 relative">
      
      {/* Hamburger Menu (Mobile Only) */}
      <button 
        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </button>

      {/* Action Icons */}
      <div className="flex items-center gap-2 md:gap-3">
        <button className="p-2 text-gray-500 hover:text-gray-800"><Bell size={20} /></button>
      </div>
    </header>
  );
}