import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../../../utils/api";
import { FaArrowLeft, FaCheck, FaTruck, FaBox, FaBan, FaClock, FaShippingFast } from "react-icons/fa";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: <FaClock className="text-yellow-500" />, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', icon: <FaBox className="text-blue-500" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', icon: <FaTruck className="text-purple-500" />, color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', icon: <FaShippingFast className="text-green-500" />, color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', icon: <FaCheck className="text-green-500" />, color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', icon: <FaBan className="text-red-500" />, color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      
      // Update the local state
      setOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
      
      // Show success message
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusDisplay = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return (
      <span className={`px-3 py-1 rounded-full inline-flex items-center ${statusOption.color}`}>
        <span className="mr-2">{statusOption.icon}</span>
        <span>{statusOption.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Order not found'}
        </div>
        <button 
          onClick={() => navigate('/admin/orders')} 
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/admin/orders')} 
          className="mr-4 p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Order #{order._id.substring(0, 8)}
              </h2>
              <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center mt-4 sm:mt-0">
              <div className="mb-2 sm:mb-0 sm:mr-4">
                {getStatusDisplay(order.status)}
              </div>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><span className="font-medium">Name:</span> {order.user?.username || 'Guest'}</p>
                <p><span className="font-medium">Email:</span> {order.user?.email || 'N/A'}</p>
              </div>

              <h3 className="text-lg font-semibold mt-6 mb-3">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Payment Method:</span>
                  <span>{order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">Rs.{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-8 mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.product && item.product.imageUrl && (
                          <img 
                            src={`http://localhost:4000${item.product.imageUrl}`} 
                            alt={item.product.name} 
                            className="h-10 w-10 object-cover rounded mr-3"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {item.product ? item.product.name : 'Product no longer available'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs.{item.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs.{(item.price * item.quantity).toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;