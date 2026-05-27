import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiTag, FiFileText, FiLayers, FiImage, FiAlertCircle } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import Spinner from '../components/Spinner';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, createProduct, updateProduct, loading } = useProducts();
  const { token } = useAuth();

  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState(null);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Handle direct file upload to backend
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Type validation
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, JPEG, GIF, etc.)');
      return;
    }

    // Size validation
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    setFormError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed');
      }

      setImageUrl(data.image_url);
    } catch (err) {
      setFormError(err.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Clear errors after 5 seconds
  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => setFormError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [formError]);

  // Load product if editing
  useEffect(() => {
    const loadProduct = async () => {
      if (!isEditMode) return;
      setFetchingProduct(true);
      const product = await getProductById(id);
      setFetchingProduct(false);

      if (product) {
        setName(product.name);
        setDescription(product.description || '');
        setPrice(product.price.toString());
        setStock(product.stock.toString());
        setImageUrl(product.image_url || '');
      } else {
        setFormError('Product not found or access denied.');
      }
    };

    loadProduct();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!name || price === '' || stock === '') {
      setFormError('Please fill in all required fields (Name, Price, Stock).');
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Price must be a positive number.');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Stock must be a positive integer.');
      return;
    }

    const productPayload = {
      name,
      description,
      price: priceNum,
      stock: stockNum,
      image_url: imageUrl,
    };

    let result;
    if (isEditMode) {
      result = await updateProduct(id, productPayload);
    } else {
      result = await createProduct(productPayload);
    }

    if (result.success) {
      navigate('/products');
    } else {
      setFormError(result.error || 'Operation failed. Please try again.');
    }
  };

  if (fetchingProduct) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: '60px', maxWidth: '800px' }}>

      {/* Return back button */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/products" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          fontWeight: '500',
          transition: 'var(--transition-fast)'
        }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <FiArrowLeft /> Back to Catalog
        </Link>
      </div>

      <div className="glass" style={{
        padding: '40px',
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)'
      }}>
        {/* Header Title */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>
            {isEditMode ? 'Modify ' : 'Create '}
            <span className="text-gradient">{isEditMode ? 'Product' : 'Inventory'}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isEditMode ? 'Update product description, pricing parameters, or stock quantities.' : 'Add a brand new physical or digital product to the marketplace.'}
          </p>
        </div>

        {formError && (
          <div className="glass" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            color: 'var(--accent-red)'
          }}>
            <FiAlertCircle size={24} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem' }}>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Product Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Product Name *</label>
            <div style={{ position: 'relative' }}>
              <FiTag style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                id="name"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                className="form-input"
                style={{ paddingLeft: '48px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Product Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">Detailed Description</label>
            <div style={{ position: 'relative' }}>
              <FiFileText style={{
                position: 'absolute',
                left: '16px',
                top: '20px',
                color: 'var(--text-muted)'
              }} />
              <textarea
                id="description"
                placeholder="Describe key features, box dimensions, product materials, warranty specifics..."
                className="form-input"
                style={{ paddingLeft: '48px', minHeight: '120px', resize: 'vertical' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Price & Stock Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            {/* Price */}
            <div className="form-group">
              <label className="form-label" htmlFor="price">Price (₹) *</label>
              <div style={{ position: 'relative' }}>
                <FaRupeeSign style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="price"
                  placeholder="2999.00"
                  className="form-input"
                  style={{ paddingLeft: '48px' }}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading || uploadingImage}
                  required
                />
              </div>
            </div>

            {/* Stock Quantity */}
            <div className="form-group">
              <label className="form-label" htmlFor="stock">Stock Quantity *</label>
              <div style={{ position: 'relative' }}>
                <FiLayers style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type="number"
                  min="0"
                  id="stock"
                  placeholder="25"
                  className="form-input"
                  style={{ paddingLeft: '48px' }}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          {/* Direct Product Image Upload */}
          <div className="form-group">
            <label className="form-label">Product Image *</label>

            {imageUrl ? (
              // Thumbnail/Preview Box
              <div className="glass" style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '2px solid var(--accent-blue)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                height: '280px',
                justifyContent: 'center'
              }}>
                <img
                  src={imageUrl}
                  alt="Product preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    width: 'fit-content'
                  }}
                  onClick={() => setImageUrl('')}
                  disabled={loading || uploadingImage}
                >
                  Remove & Upload Another
                </button>
              </div>
            ) : (
              // Upload Zone
              <div
                className="glass"
                style={{
                  border: '2px dashed rgba(34, 197, 94, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'var(--transition-fast)',
                  backgroundColor: 'rgba(0, 0, 0, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-blue)';
                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.35)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  disabled={loading || uploadingImage}
                />
                {uploadingImage ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Spinner />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Uploading picture to server...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <FiImage size={36} style={{ color: 'var(--accent-blue)' }} />
                    <div>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Click to upload image</span> or drag and drop
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      PNG, JPG, JPEG or GIF format (Max 5MB)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '28px',
            marginTop: '12px'
          }}>
            <Link to="/products" className="btn btn-secondary" style={{ padding: '12px 30px' }}>
              CANCEL
            </Link>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 40px' }}
              disabled={loading || uploadingImage}
            >
              {loading ? 'SAVING DATA...' : uploadingImage ? 'UPLOADING IMAGE...' : isEditMode ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductForm;
