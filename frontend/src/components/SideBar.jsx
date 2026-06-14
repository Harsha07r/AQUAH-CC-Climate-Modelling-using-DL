// src/components/SideBar.jsx
import { Droplet, Tractor, MessageSquare, BookOpen, Settings, Plus, X } from 'lucide-react';
import HydrologyDashboard from './HydrologyDashboard';

export default function SideBar({ isOpen, toggleSidebar, currentView, setCurrentView, user, onLogout }) {

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-lg shadow-lg"
        onClick={toggleSidebar}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 h-full bg-white border-r border-gray-100 
        flex flex-col px-4 py-6 gap-1
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="px-3 mb-6">
          <div className="flex items-center gap-2 mb-1">
              <span className="text-green-700 font-bold text-lg">AQUAH-CC</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => { setCurrentView('crops'); if(isOpen) toggleSidebar(); }}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${currentView === 'crops' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Crops
          </button>
          
          <button 
            onClick={() => { setCurrentView('chat'); if(isOpen) toggleSidebar(); }}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${currentView === 'chat' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Assistant
          </button>

          <button 
            onClick={() => { setCurrentView('hydrology'); if(isOpen) toggleSidebar(); }}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${currentView === 'hydrology' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <Droplet className="w-5 h-5" />
            Hydrology
          </button>

        </nav>

        {/* Bottom section — mt-auto pushes this to the very end */}
        <div className="mt-auto flex flex-col gap-3">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-sm">
            New Analysis
          </button>
          
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-1">
            
            <button 
              onClick={() => { setCurrentView('settings'); if(isOpen) toggleSidebar(); }}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm transition-colors cursor-pointer ${currentView === 'settings' ? 'text-green-600 font-medium' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </div>

          {user && (
            <div className="border-t border-gray-100 pt-3 mt-1">
              <div className="flex items-center gap-3 px-3 py-2 mb-1">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=ECFDF5&color=047857`} 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full border border-gray-200" 
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-800 truncate">{user.displayName || 'Farmer'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}    
        />
      )}
    </>
  )
}