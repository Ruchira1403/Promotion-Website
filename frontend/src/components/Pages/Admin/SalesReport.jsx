import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import Spinner from '../../UI/Spinner';
import { FaArrowLeft, FaDownload, FaCalendarAlt, FaChartPie, FaChartLine, FaTable } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SalesReport = () => {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    monthlyOrders: 0,
    pendingOrders: 0,
    dailySales: [],
    salesByCategory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('week'); // 'week', 'month', 'year'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'daily', 'category', 'orders'
  const [completedOrders, setCompletedOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalesData();
    fetchCompletedOrders();
  }, [dateRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/sales?period=${dateRange}`);
      setSalesData(response.data);
    } catch (err) {
      setError('Failed to load sales data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const response = await api.get('/admin/orders/completed');
      setCompletedOrders(response.data);
    } catch (err) {
      console.error('Error fetching completed orders:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs.${(amount || 0).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Export sales data as CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "Date,Order ID,Customer,Items,Total\n";
    
    // Data rows
    completedOrders.forEach(order => {
      const row = [
        formatDate(order.createdAt),
        order._id,
        order.user ? order.user.username : 'Guest',
        order.items.length,
        order.totalAmount
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // COLORS for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/admin/dashboard')} 
          className="mr-4 p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Sales Reports</h1>
        <button 
          onClick={exportToCSV} 
          className="ml-auto flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <FaDownload className="mr-2" /> Export Report
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Date Range Selector */}
      <div className="mb-6 flex items-center">
        <FaCalendarAlt className="text-gray-500 mr-2" />
        <div className="bg-white p-1 rounded-md shadow-sm border border-gray-300 flex">
          <button 
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-md text-sm ${dateRange === 'week' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-md text-sm ${dateRange === 'month' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Last 30 Days
          </button>
          <button 
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-md text-sm ${dateRange === 'year' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Sales</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(salesData.totalSales)}</p>
          <p className="text-sm text-gray-500 mt-1">From completed orders</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Orders</h3>
          <p className="text-3xl font-bold text-green-600">{salesData.monthlyOrders || 0}</p>
          <p className="text-sm text-gray-500 mt-1">{dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'This year'}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Average Order Value</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {formatCurrency(salesData.totalSales && salesData.monthlyOrders ? 
              salesData.totalSales / completedOrders.length : 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Revenue per order</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`mr-2 py-4 px-6 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaChartPie className="inline mr-2" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`mr-2 py-4 px-6 text-sm font-medium ${
              activeTab === 'daily'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaChartLine className="inline mr-2" /> Daily Sales
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`mr-2 py-4 px-6 text-sm font-medium ${
              activeTab === 'category'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaChartPie className="inline mr-2" /> By Category
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`mr-2 py-4 px-6 text-sm font-medium ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaTable className="inline mr-2" /> Orders List
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Sales Chart */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                <h3 className="text-lg font-medium mb-3 text-gray-700">Sales Trend</h3>
                <div className="h-80">
                  {salesData.dailySales && salesData.dailySales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesData.dailySales}
                        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="_id" 
                          angle={-45} 
                          textAnchor="end"
                          tick={{ fontSize: 12 }} 
                          height={60}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`Rs.${value.toFixed(2)}`, 'Sales']} 
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="sales" name="Sales (Rs.)" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No sales data available for this period</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                <h3 className="text-lg font-medium mb-3 text-gray-700">Sales by Category</h3>
                <div className="h-80">
                  {salesData.salesByCategory && salesData.salesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesData.salesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="sales"
                          nameKey="_id"
                        >
                          {salesData.salesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `Rs.${value.toFixed(2)}`} 
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No category data available for this period</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Daily Sales Analysis</h2>
            <div className="h-96">
              {salesData.dailySales && salesData.dailySales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData.dailySales}
                    margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="_id" 
                      angle={-45} 
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`Rs.${value.toFixed(2)}`, 'Sales']} 
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend verticalAlign="top" height={40} />
                    <Bar dataKey="sales" name="Sales (Rs.)" fill="#4f46e5" />
                    <Bar dataKey="count" name="Order Count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No sales data available for this period</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'category' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sales by Product Category</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="h-80">
                {salesData.salesByCategory && salesData.salesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesData.salesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                        nameKey="_id"
                      >
                        {salesData.salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rs.${value.toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No category data available for this period</p>
                  </div>
                )}
              </div>
              
              {/* Category Table */}
              <div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData.salesByCategory.map((category, index) => {
                      const totalAmount = salesData.salesByCategory.reduce((sum, cat) => sum + cat.sales, 0);
                      const percentage = totalAmount > 0 ? (category.sales / totalAmount) * 100 : 0;
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category._id || 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(category.sales)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{percentage.toFixed(1)}%</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {completedOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          #{order._id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.user?.username || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{order.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {completedOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No completed orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;