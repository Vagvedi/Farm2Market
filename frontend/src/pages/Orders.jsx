import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import './Orders.css';

const Orders = () => {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await ordersAPI.getMyOrders(token);
      setOrders(data.orders || []);
    } catch (err) {
      alert('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', color: '#d97706', icon: '⏳' };
      case 'accepted':
        return { bg: '#dbeafe', color: '#2563eb', icon: '✅' };
      case 'delivered':
        return { bg: '#d1fae5', color: '#059669', icon: '🎉' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', icon: '📦' };
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-state">
          <span className="spinner"></span>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header animate-fadeIn">
        <div>
          <h1 className="orders-title">
            <span className="title-icon">📦</span>
            My Orders
          </h1>
          <p className="orders-subtitle">Track your order history and status</p>
        </div>
        {orders.length > 0 && (
          <div className="orders-stats">
            <div className="order-stat">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="order-stat">
              <span className="stat-value">
                {orders.filter(o => o.status === 'pending').length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping in the marketplace to see your orders here!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const total = order.order_items?.reduce(
              (sum, item) => sum + item.price_at_order * item.quantity_kg,
              0
            ) || 0;
            const itemCount = order.order_items?.length || 0;
            const statusStyle = getStatusColor(order.status);

            return (
              <div key={order.id} className="order-card animate-fadeIn">
                <div className="order-header-section">
                  <div className="order-info">
                    <div className="order-id">
                      <span className="id-label">Order ID</span>
                      <span className="id-value">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="order-date">
                      <span className="date-icon">📅</span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div
                    className="order-status"
                    style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    <span className="status-icon">{statusStyle.icon}</span>
                    <span className="status-label">{getStatusLabel(order.status)}</span>
                  </div>
                </div>

                <div className="order-items-section">
                  <h4 className="items-title">
                    <span>🛒</span>
                    Items ({itemCount})
                  </h4>
                  <div className="items-list">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="order-item">
                        <div className="item-image-wrapper">
                          {item.crops?.image_url ? (
                            <img
                              src={item.crops.image_url}
                              alt={item.crops.name}
                              className="item-image"
                            />
                          ) : (
                            <div className="item-image-placeholder">
                              <span>🌾</span>
                            </div>
                          )}
                        </div>
                        <div className="item-details">
                          <h5 className="item-name">{item.crops?.name || 'Unknown Crop'}</h5>
                          <div className="item-specs">
                            <span className="item-spec">
                              <strong>{item.quantity_kg} KG</strong>
                            </span>
                            <span className="item-spec">
                              @ ₹{item.price_at_order}/KG
                            </span>
                          </div>
                        </div>
                        <div className="item-total">
                          <span className="item-total-label">Subtotal</span>
                          <span className="item-total-value">
                            ₹{(item.quantity_kg * item.price_at_order).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-total-section">
                    <div className="total-label">Order Total</div>
                    <div className="total-value">₹{total.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
