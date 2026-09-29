import { Outlet, Link } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              TasaTrust
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-blue-600">
                Services
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-blue-600">
                Pricing
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600">
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TasaTrust</h3>
              <p className="text-gray-400 text-sm">
                Your trusted partner for digital transformation and business growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/services" className="hover:text-white">Web Development</Link></li>
                <li><Link to="/services" className="hover:text-white">Digital Marketing</Link></li>
                <li><Link to="/services" className="hover:text-white">Business Tools</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 TasaTrust. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
