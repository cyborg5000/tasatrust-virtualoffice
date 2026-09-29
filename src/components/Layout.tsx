import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              TasaTrust
            </Link>

            <div className="flex items-center gap-4">
              {user && (
                <>
                  <span className="text-sm text-gray-600">
                    {user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-4 flex gap-6">
            <Link to="/member" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/member/services" className="text-gray-700 hover:text-blue-600">
              Services
            </Link>
            <Link to="/member/booking" className="text-gray-700 hover:text-blue-600">
              Booking
            </Link>
            <Link to="/member/subscription" className="text-gray-700 hover:text-blue-600">
              Subscription
            </Link>
            <Link to="/member/settings" className="text-gray-700 hover:text-blue-600">
              Settings
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © 2026 TasaTrust. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
