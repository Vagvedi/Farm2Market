import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cropsAPI, ordersAPI } from '../services/api';
import './Marketplace.css';

const Marketplace = () => {
  const { user, getToken } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      setLoading(true);
      const data = await cropsAPI.getAll();
      setCrops(data.crops || []);
    } catch (err) {
      alert('Failed to load crops: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (cropId, maxQuantity) => {
    const currentQty = cart[cropId] || 0;
    if (currentQty < maxQuantity) {
      setCart({ ...cart, [cropId]: currentQty + 1 });
      setShowCart(true);
    }
  };

  const removeFromCart = (cropId) => {
    const newCart = { ...cart };
    if (newCart[cropId] > 1) {
      newCart[cropId] -= 1;
    } else {
      delete newCart[cropId];
    }
    setCart(newCart);
  };

  const updateCartQuantity = (cropId, quantity, maxQuantity) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[cropId];
      setCart(newCart);
    } else if (quantity <= maxQuantity) {
      setCart({ ...cart, [cropId]: quantity });
    }
  };

  const removeFromCartCompletely = (cropId) => {
    const newCart = { ...cart };
    delete newCart[cropId];
    setCart(newCart);
  };

  const placeOrder = async () => {
    if (Object.keys(cart).length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!user) {
      alert('Please login to place an order');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const items = Object.entries(cart).map(([crop_id, quantity_kg]) => ({
        crop_id,
        quantity_kg: parseFloat(quantity_kg),
      }));

      await ordersAPI.create(token, { items });
      alert('Order placed successfully!');
      setCart({});
      setShowCart(false);
      loadCrops();
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = Object.entries(cart).reduce((total, [cropId, qty]) => {
    const crop = crops.find((c) => c.id === cropId);
    return total + (crop ? crop.price_per_kg * qty : 0);
  }, 0);

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="marketplace-container">
      <div className="marketplace-header animate-fadeIn">
        <div>
          <h1 className="marketplace-title">
            <span className="title-icon">🛒</span>
            Marketplace
          </h1>
          <p className="marketplace-subtitle">Discover fresh crops from local farmers</p>
        </div>
        {cartItemCount > 0 && (
          <button
            onClick={() => setShowCart(!showCart)}
            className="cart-toggle-button"
          >
            <span className="cart-icon">🛒</span>
            <span className="cart-badge">{cartItemCount}</span>
            <span>View Cart</span>
          </button>
        )}
      </div>

      {showCart && cartItemCount > 0 && (
        <div className="cart-sidebar animate-slideIn">
          <div className="cart-header">
            <h3>Shopping Cart</h3>
            <button onClick={() => setShowCart(false)} className="close-cart">✕</button>
          </div>
          <div className="cart-items">
            {Object.entries(cart).map(([cropId, qty]) => {
              const crop = crops.find((c) => c.id === cropId);
              if (!crop) return null;
              return (
                <div key={cropId} className="cart-item">
                  <div className="cart-item-image">
                    {crop.image_url ? (
                      <img src={crop.image_url} alt={crop.name} />
                    ) : (
                      <div className="cart-item-placeholder">🌾</div>
                    )}
                  </div>
                  <div className="cart-item-details">
                    <h4>{crop.name}</h4>
                    <p>₹{crop.price_per_kg}/KG</p>
                    <div className="cart-item-controls">
                      <button onClick={() => removeFromCart(cropId)} className="cart-qty-btn">−</button>
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) =>
                          updateCartQuantity(cropId, parseInt(e.target.value) || 0, crop.quantity_kg)
                        }
                        min="1"
                        max={crop.quantity_kg}
                        className="cart-qty-input"
                      />
                      <button onClick={() => addToCart(cropId, crop.quantity_kg)} className="cart-qty-btn">+</button>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    <div>₹{(crop.price_per_kg * qty).toFixed(2)}</div>
                    <button onClick={() => removeFromCartCompletely(cropId)} className="remove-item">🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <strong>₹{cartTotal.toFixed(2)}</strong>
            </div>
            <button onClick={placeOrder} disabled={loading} className="checkout-button">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Place Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading && crops.length === 0 ? (
        <div className="loading-state">
          <span className="spinner"></span>
          <p>Loading fresh crops...</p>
        </div>
      ) : crops.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌾</div>
          <h3>No crops available</h3>
          <p>Check back later for fresh produce!</p>
        </div>
      ) : (
        <div className="crops-grid">
          {crops.map((crop) => {
            const inCart = cart[crop.id] || 0;
            const available = crop.quantity_kg - inCart;
            return (
              <div key={crop.id} className="crop-card animate-fadeIn">
                {crop.image_url ? (
                  <div className="crop-image-wrapper">
                    <img src={crop.image_url} alt={crop.name} className="crop-image" />
                    {inCart > 0 && (
                      <div className="in-cart-badge">
                        {inCart} in cart
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="crop-image-placeholder">
                    <span className="placeholder-icon">🌾</span>
                  </div>
                )}
                <div className="crop-content">
                  <h3 className="crop-name">{crop.name}</h3>
                  {crop.profiles && (
                    <p className="crop-farmer">
                      <span>👨‍🌾</span>
                      {crop.profiles.full_name}
                    </p>
                  )}
                  <div className="crop-pricing">
                    <div className="price-tag">
                      <span className="price-label">Price</span>
                      <span className="price-value">₹{crop.price_per_kg}/KG</span>
                    </div>
                    <div className="availability-tag">
                      <span className="availability-label">Available</span>
                      <span className={`availability-value ${available <= 10 ? 'low-stock' : ''}`}>
                        {available} KG
                      </span>
                    </div>
                  </div>
                  <div className="crop-actions">
                    {inCart > 0 ? (
                      <div className="quantity-controls">
                        <button onClick={() => removeFromCart(crop.id)} className="qty-button">−</button>
                        <input
                          type="number"
                          value={inCart}
                          onChange={(e) =>
                            updateCartQuantity(crop.id, parseInt(e.target.value) || 0, crop.quantity_kg)
                          }
                          min="0"
                          max={crop.quantity_kg}
                          className="qty-input"
                        />
                        <button onClick={() => addToCart(crop.id, crop.quantity_kg)} className="qty-button">+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(crop.id, crop.quantity_kg)}
                        disabled={available <= 0}
                        className="add-to-cart-button"
                      >
                        <span>🛒</span>
                        <span>{available <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                      </button>
                    )}
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

export default Marketplace;
