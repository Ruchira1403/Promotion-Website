import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaChartLine, 
  FaSignOutAlt 
} from 'react-icons/fa';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            <li>
              <Link to="/admin" className="flex items-center p-3 rounded-lg hover:bg-blue-700">
                <FaHome className="mr-3" /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/products" className="flex items-center p-3 rounded-lg hover:bg-blue-700">
                <FaBox className="mr-3" /> Products
              </Link>
            </li>
            <li>
              <Link to="/admin/orders" className="flex items-center p-3 rounded-lg hover:bg-blue-700">
                <FaShoppingCart className="mr-3" /> Orders
              </Link>
            </li>
            <li>
              <Link to="/admin/sales-report" className="flex items-center p-3 rounded-lg hover:bg-blue-700">
                <FaChartLine className="mr-3" /> Sales Report
              </Link>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center p-3 rounded-lg hover:bg-blue-700 w-full text-left"
              >
                <FaSignOutAlt className="mr-3" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;