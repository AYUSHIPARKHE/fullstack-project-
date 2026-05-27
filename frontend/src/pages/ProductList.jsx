import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiPackage, FiInfo } from 'react-icons/fi';
import Spinner from '../components/Spinner';

const ProductList = () => {
  const { user } = useAuth();
  const {
    products,
    loading,
    error,
    pagination,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    deleteProduct,
    fetchProducts
  } = useProducts();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search input to avoid spamming requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
      setCurrentPage(1); // Reset to page 1 on search
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery, setCurrentPage]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you absolutely sure you want to delete "${name}"?`)) {
      const res = await deleteProduct(id);
      if (res.success) {
        // Refresh products list
        fetchProducts();
      } else {
        alert(`Failed to delete: ${res.error}`);
      }
    }
  };

  // Helper to fallback to elegant product illustrations if no URL is provided
  const getProductImage = (url) => {
    return url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80';
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: '60px' }}>

      {/* Header section with Search and Add Product Call to Action */}
      <div className="glass" style={{
        padding: '30px',
        marginBottom: '30px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '4px' }}>
            Quantum <span className="text-gradient">Catalog</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Securely examine, search, and manage products</p>
        </div>

        <Link to="/products/add" className="btn btn-primary">
          <FiPlus size={20} /> ADD NEW PRODUCT
        </Link>
      </div>

      {/* Search Input Bar */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <FiSearch style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-secondary)',
          fontSize: '1.2rem'
        }} />
        <input
          type="text"
          placeholder="Filter catalog by product name or description..."
          className="form-input glass"
          style={{
            padding: '16px 16px 16px 56px',
            fontSize: '1.05rem',
            borderRadius: 'var(--radius-md)'
          }}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>

      {/* Global Error Banner */}
      {error && (
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
          <FiInfo size={24} />
          <span>{error}</span>
        </div>
      )}

      {/* Products Display Board */}
      {loading && products.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <div className="glass" style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <FiPackage size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No products found</h3>
          <p style={{ marginTop: '8px', fontSize: '0.95rem' }}>
            {localSearch ? 'Try adjusting your search query filter criteria.' : 'Start adding new products to populate the database catalog.'}
          </p>
        </div>
      ) : (
        <>
          {/* Responsive Products Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {products.map(product => {
              const isOwner = user && product.user_id === user.id;

              return (
                <div key={product.id} className="glass fade-in" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'var(--transition-normal)',
                  height: '100%',
                  position: 'relative'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow)';
                    e.currentTarget.style.borderColor = 'rgba(var(--accent-blue-rgb), 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.borderColor = 'hsla(210, 20%, 98%, 0.08)';
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <img
                      src={getProductImage(product.image_url)}
                      alt={product.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        padding: '12px',
                        transition: 'var(--transition-normal)'
                      }}
                    />

                    {/* Stock status badge */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      {product.stock > 0 ? (
                        <span className="badge badge-green">IN STOCK ({product.stock})</span>
                      ) : (
                        <span className="badge badge-red">OUT OF STOCK</span>
                      )}
                    </div>

                    {/* Owner Tag overlay */}
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {isOwner ? 'Added by You' : `@${product.owner_name}`}
                      </span>
                    </div>
                  </div>

                  {/* Card Content body */}
                  <div style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1
                  }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {product.name}
                    </h3>

                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flexGrow: 1
                    }}>
                      {product.description || 'No description provided.'}
                    </p>

                    {/* Footer Row containing Price and actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      paddingTop: '16px',
                      marginTop: 'auto'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRICE</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--accent-blue)' }}>
                          ₹{parseFloat(product.price).toFixed(2)}
                        </span>
                      </div>

                      {/* Owner controls */}
                      {isOwner && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link
                            to={`/products/edit/${product.id}`}
                            className="btn-icon"
                            title="Edit Product"
                            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="btn-icon"
                            title="Delete Product"
                            style={{
                              border: '1px solid rgba(255,255,255,0.05)',
                              color: 'var(--accent-red)'
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controllers */}
          {pagination.totalPages > 1 && (
            <div className="glass" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderRadius: 'var(--radius-md)'
            }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                <FiChevronLeft /> PREV
              </button>

              <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                Page <strong style={{ color: 'var(--text-primary)' }}>{currentPage}</strong> of {pagination.totalPages}
              </span>

              <button
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages || loading}
              >
                NEXT <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;
