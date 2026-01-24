import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cropsAPI } from '../services/api';
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const { user, getToken } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price_per_kg: '',
    quantity_kg: '',
    image_url: '',
  });

  useEffect(() => {
    loadMyCrops();
  }, []);

  const loadMyCrops = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await cropsAPI.getMyCrops(token);
      setCrops(data.crops || []);
    } catch (err) {
      alert('Failed to load crops: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = await getToken();
      await cropsAPI.create(token, {
        name: formData.name,
        price_per_kg: parseFloat(formData.price_per_kg),
        quantity_kg: parseFloat(formData.quantity_kg),
        image_url: formData.image_url || null,
      });
      setFormData({ name: '', price_per_kg: '', quantity_kg: '', image_url: '' });
      setShowAddForm(false);
      loadMyCrops();
    } catch (err) {
      alert('Failed to add crop: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = crops.reduce((sum, crop) => sum + (crop.price_per_kg * crop.quantity_kg), 0);
  const totalQuantity = crops.reduce((sum, crop) => sum + crop.quantity_kg, 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-fadeIn">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">
              <span className="title-icon">👨‍🌾</span>
              Farmer Dashboard
            </h1>
            <p className="dashboard-subtitle">Manage your crops and track your inventory</p>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <div className="stat-value">{crops.length}</div>
                <div className="stat-label">Total Crops</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚖️</div>
              <div className="stat-info">
                <div className="stat-value">{totalQuantity.toFixed(1)}</div>
                <div className="stat-label">Total KG</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-value">₹{totalValue.toFixed(2)}</div>
                <div className="stat-label">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`add-crop-button ${showAddForm ? 'active' : ''}`}
        >
          <span>{showAddForm ? '✕' : '+'}</span>
          <span>{showAddForm ? 'Cancel' : 'Add New Crop'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-container animate-fadeIn">
          <div className="form-card">
            <h3 className="form-title">
              <span>🌱</span>
              Add New Crop
            </h3>
            <form onSubmit={handleSubmit} className="crop-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Crop Name *</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g., Organic Tomatoes"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price per KG (₹) *</label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50.00"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity (KG) *</label>
                  <input
                    id="quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="100.00"
                    value={formData.quantity_kg}
                    onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group form-group-full">
                  <label htmlFor="image">Image URL (optional)</label>
                  <input
                    id="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="submit-button">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Add Crop</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="crops-section">
        <div className="section-header">
          <h2 className="section-title">My Crops</h2>
          <span className="crop-count">{crops.length} {crops.length === 1 ? 'crop' : 'crops'}</span>
        </div>

        {loading && !showAddForm ? (
          <div className="loading-state">
            <span className="spinner"></span>
            <p>Loading your crops...</p>
          </div>
        ) : crops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌾</div>
            <h3>No crops yet</h3>
            <p>Start by adding your first crop to the marketplace!</p>
            <button onClick={() => setShowAddForm(true)} className="empty-action-button">
              Add Your First Crop
            </button>
          </div>
        ) : (
          <div className="crops-grid">
            {crops.map((crop) => (
              <div key={crop.id} className="crop-card animate-fadeIn">
                {crop.image_url ? (
                  <div className="crop-image-wrapper">
                    <img src={crop.image_url} alt={crop.name} className="crop-image" />
                  </div>
                ) : (
                  <div className="crop-image-placeholder">
                    <span className="placeholder-icon">🌾</span>
                  </div>
                )}
                <div className="crop-content">
                  <h3 className="crop-name">{crop.name}</h3>
                  <div className="crop-details">
                    <div className="crop-detail-item">
                      <span className="detail-icon">💰</span>
                      <div>
                        <div className="detail-label">Price</div>
                        <div className="detail-value">₹{crop.price_per_kg}/KG</div>
                      </div>
                    </div>
                    <div className="crop-detail-item">
                      <span className="detail-icon">⚖️</span>
                      <div>
                        <div className="detail-label">Available</div>
                        <div className="detail-value">{crop.quantity_kg} KG</div>
                      </div>
                    </div>
                  </div>
                  <div className="crop-footer">
                    <div className="crop-total">
                      Total Value: <strong>₹{(crop.price_per_kg * crop.quantity_kg).toFixed(2)}</strong>
                    </div>
                    <div className="crop-date">
                      {new Date(crop.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
