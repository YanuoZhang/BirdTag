import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex space-x-6 items-center">
            <span className="text-xl font-bold text-blue-600">BirdTag</span>
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Home
            </Link>
            <Link
              to="/upload"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Upload
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm shadow"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content Section */}
      <Outlet />
      {/* Footer */}
      <footer className="bg-white border-t text-center py-4 text-sm text-gray-500">
        © 2025 BirdTag. All rights reserved.
      </footer>
    </div>
  );
}
