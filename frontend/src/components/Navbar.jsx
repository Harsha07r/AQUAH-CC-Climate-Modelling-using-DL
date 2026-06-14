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

      {/* Status Pills (Hidden on very small screens to save space) */}
      <div className="hidden sm:flex bg-gray-100 rounded-full p-1 border border-gray-200">
        <button className="px-4 py-1.5 text-xs font-bold text-gray-500 rounded-full">DASHBOARD</button>
        <button className="px-4 py-1.5 text-xs font-bold bg-white shadow-sm text-green-800 rounded-full">ALMANAC</button>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-2 md:gap-3">
        <button className="hidden sm:block px-4 py-2 bg-[#f4fdf8] text-green-800 text-xs font-bold rounded-full border border-green-200">SIMPLE MODE</button>
        <button className="px-3 py-2 text-gray-500 text-xs font-bold rounded-full hover:bg-gray-100">EN/HI</button>
        <button className="p-2 text-gray-500 hover:text-gray-800"><Bell size={20} /></button>
      </div>
    </header>
  );
}