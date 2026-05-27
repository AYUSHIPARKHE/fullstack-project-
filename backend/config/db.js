import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const dbConfig = {
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  host: process.env.PG_HOST || '127.0.0.1',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'product_crud_db',
};

let pool;

// Auto-initialize DB and schema tables
export const initDB = async () => {
  const targetDb = dbConfig.database;

  // 1. First, connect to default 'postgres' database to ensure our target DB exists
  const tempPool = new Pool({
    ...dbConfig,
    database: 'postgres',
  });

  try {
    console.log(`Checking if database "${targetDb}" exists...`);
    const res = await tempPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDb]
    );

    if (res.rowCount === 0) {
      console.log(`Database "${targetDb}" not found. Creating database...`);
      // CREATE DATABASE cannot run inside a transaction block, so we run it directly
      await tempPool.query(`CREATE DATABASE ${targetDb}`);
      console.log(`Database "${targetDb}" created successfully.`);
    } else {
      console.log(`Database "${targetDb}" already exists.`);
    }
  } catch (err) {
    console.error('Error verifying database existence:', err.message);
    console.log('Attempting to proceed assuming database exists or will be resolved.');
  } finally {
    await tempPool.end();
  }

  // 2. Connect to the actual target database pool
  pool = new Pool(dbConfig);

  // Test target DB connection
  try {
    const client = await pool.connect();
    console.log(`Connected to PostgreSQL database "${targetDb}" successfully.`);
    client.release();
  } catch (err) {
    console.error(`CRITICAL: Failed to connect to database "${targetDb}":`, err.message);
    console.error('Please verify that PostgreSQL is running and credentials in backend/.env are correct.');
    throw err;
  }

  // 3. Initialize schema tables
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Initializing database schema...');
    await pool.query(sql);
    console.log('Database tables verified and ready.');
  } catch (err) {
    console.error('CRITICAL: Error running schema initialization:', err.message);
    throw err;
  }
};

// Export helper to query database
export const query = (text, params) => {
  if (!pool) {
    throw new Error('Database pool has not been initialized yet. Call initDB() first.');
  }
  return pool.query(text, params);
};

export { pool };
