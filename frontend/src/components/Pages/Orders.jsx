import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../utils/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const successMessage = location.state?.success ? location.state.message : null;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (err) {
      setError("Failed to load orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper to get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-lg text-gray-600">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="mb-2 md:mb-0">
                    <p className="text-sm text-gray-600">Order placed</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  
                  <div className="mb-2 md:mb-0">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  
                  <div className="mb-2 md:mb-0">
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-medium">#{order._id.substring(0, 8)}</p>
                  </div>
                  
                  <div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold mb-4">Items</h3>
                
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {item.product && (
                          <>
                            <img
                              src={`http://localhost:4000${item.product.imageUrl}`}
                              alt={item.product.name}
                              className="h-16 w-16 object-cover rounded"
                            />
                            <div className="ml-4">
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-500">
                                ${item.price.toFixed(2)} x {item.quantity}
                              </p>
                            </div>
                          </>
                        )}
                        {!item.product && (
                          <div className="ml-4">
                            <p className="font-medium text-gray-500">Product no longer available</p>
                            <p className="text-sm text-gray-500">
                              ${item.price.toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <p className="font-medium">Shipping Address:</p>
                  <p className="text-gray-700">
                    {order.shippingAddress && (
                      <>
                        {order.shippingAddress.street}, {order.shippingAddress.city}, 
                        {order.shippingAddress.postalCode}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="font-medium">Payment Method:</p>
                  <p className="text-gray-700">
                    {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;