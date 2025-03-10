import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { FaBitcoin, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaCog } from 'react-icons/fa';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <FaBitcoin className="h-8 w-8 text-yellow-500" />
                <span className="ml-2 text-xl font-bold">Trenches Tracker</span>
              </Link>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                  Dashboard
                </Link>
                
                {user ? (
                  <>
                    <Link href="/portfolio" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/portfolio' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                      My Portfolio
                    </Link>
                    <Link href="/settings" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/settings' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                      <FaCog className="inline mr-1" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      <FaSignOutAlt className="inline mr-1" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/login' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                      <FaSignInAlt className="inline mr-1" /> Login
                    </Link>
                    <Link href="/signup" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/signup' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                      <FaUserPlus className="inline mr-1" /> Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                Dashboard
              </Link>
              
              {user ? (
                <>
                  <Link href="/portfolio" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/portfolio' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    My Portfolio
                  </Link>
                  <Link href="/settings" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/settings' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    <FaCog className="inline mr-1" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
                  >
                    <FaSignOutAlt className="inline mr-1" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/login' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    <FaSignInAlt className="inline mr-1" /> Login
                  </Link>
                  <Link href="/signup" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/signup' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}>
                    <FaUserPlus className="inline mr-1" /> Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm">
            &copy; {new Date().getFullYear()} Trenches Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 