import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ProductProvider = ({ children }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    totalItems: 0,
    totalPages: 1,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch all products based on pagination and search
  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/products?page=${currentPage}&limit=8&search=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not fetch products');
      }

      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, searchQuery]);

  // Fetch products automatically when pagination or search changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get a single product by ID (does not write to products list state)
  const getProductById = async (id) => {
    if (!token) return null;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Product not found');
      }
      return data.product;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create Product
  const createProduct = async (productData) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not create product');
      }

      // Refresh product list to show new item
      await fetchProducts();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update Product
  const updateProduct = async (id, productData) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not update product');
      }

      // Update state immediately
      setProducts(prev =>
        prev.map(p => (p.id === parseInt(id) ? data.product : p))
      );
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not delete product');
      }

      // Remove from list
      setProducts(prev => prev.filter(p => p.id !== id));
      // Adjust totalItems count
      setPagination(prev => ({
        ...prev,
        totalItems: prev.totalItems - 1,
      }));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        pagination,
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        fetchProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
export default ProductContext;
