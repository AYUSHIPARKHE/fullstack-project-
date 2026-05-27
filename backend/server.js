import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Setup middlewares
app.use(cors({
  origin: '*', // For local dev, allow any origin. In production, configure explicitly.
  credentials: true,
}));
app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Product CRUD API! Everything is online.' });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Fallbacks for missing endpoints and global errors
app.use(notFound);
app.use(errorHandler);

// Bootstrap server and database connection
const startServer = async () => {
  try {
    // 1. Initialize PostgreSQL database & verify tables
    await initDB();

    // 2. Start HTTP server
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Backend Server running in development mode`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('⛔ Critical failure: Could not start Express server:', error.message);
    process.exit(1);
  }
};

startServer();
