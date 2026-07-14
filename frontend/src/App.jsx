// src/App.jsx
import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, signOut } from './firebase';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';
import LandingPage from './pages/LandingPage';
import Settings from './components/Settings';
import HydrologyPage from './components/HydrologyPage';
import CropsPage from './components/CropsPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // <-- 2. The Smart UX Toggle: Tracks what the user is currently looking at
  const [currentView, setCurrentView] = useState('chat');
  const [currentLanguage, setCurrentLanguage] = useState('en-IN');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) return <Login onLoginSuccess={() => setUser(true)} />;
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  return (
    // 3. Pass the view state down to the Layout so the Sidebar buttons can control it!
    <Layout 
      user={user} 
      onLogout={handleLogout}
      currentView={currentView}
      setCurrentView={setCurrentView}
    >
      {/* 4. The Toggle Logic: Show Chat by default, or Settings if they clicked the button */}
      {currentView === 'chat'      && <ChatInterface user={user} currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} />}
      {currentView === 'settings'  && <Settings user={user} currentLanguage={currentLanguage} />}
      {currentView === 'hydrology' && <HydrologyPage />}
      {currentView === 'crops'     && <CropsPage />}
    </Layout>
  );
}

export default App;