import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flexGrow: 1, padding: '24px 0' }}>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Product CRUD Routes */}
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <ProductList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/add"
                  element={
                    <ProtectedRoute>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/edit/:id"
                  element={
                    <ProtectedRoute>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="*" element={<Navigate to="/products" replace />} />
              </Routes>
            </main>
          </div>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
