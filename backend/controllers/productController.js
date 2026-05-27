import { query } from '../config/db.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, image_url } = req.body;

    // Validation
    if (!name || price === undefined || stock === undefined) {
      res.status(400);
      throw new Error('Product name, price, and stock are required');
    }

    if (parseFloat(price) < 0) {
      res.status(400);
      throw new Error('Price cannot be negative');
    }

    if (parseInt(stock) < 0) {
      res.status(400);
      throw new Error('Stock cannot be negative');
    }

    // Insert new product associated with current logged-in user
    const result = await query(
      `INSERT INTO products (name, description, price, stock, image_url, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || '', parseFloat(price), parseInt(stock), image_url || '', req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (with pagination, search)
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let queryText = 'SELECT p.*, u.username as owner_name, u.email as owner_email FROM products p JOIN users u ON p.user_id = u.id';
    let countQueryText = 'SELECT COUNT(*) FROM products p JOIN users u ON p.user_id = u.id';

    const queryParams = [];
    const countParams = [];

    // Search filter setup
    if (search) {
      queryText += ' WHERE (p.name ILIKE $1 OR p.description ILIKE $1)';
      countQueryText += ' WHERE (p.name ILIKE $1 OR p.description ILIKE $1)';
      queryParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    // Order and Pagination setup
    queryText += ' ORDER BY p.created_at DESC';

    const limitParamIndex = queryParams.length + 1;
    const offsetParamIndex = queryParams.length + 2;

    queryText += ` LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`;
    queryParams.push(limit, offset);

    // Execute queries in parallel
    const [productsResult, countResult] = await Promise.all([
      query(queryText, queryParams),
      query(countQueryText, countParams),
    ]);

    const products = productsResult.rows;
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT p.*, u.username as owner_name, u.email as owner_email FROM products p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [id]
    );

    const product = result.rows[0];

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image_url } = req.body;

    // Find the product
    const findResult = await query('SELECT * FROM products WHERE id = $1', [id]);
    const product = findResult.rows[0];

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Ownership check (Only creator can update)
    if (product.user_id !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized: You can only edit products you created yourself');
    }

    // Validation
    if (!name || price === undefined || stock === undefined) {
      res.status(400);
      throw new Error('Product name, price, and stock are required');
    }

    if (parseFloat(price) < 0) {
      res.status(400);
      throw new Error('Price cannot be negative');
    }

    if (parseInt(stock) < 0) {
      res.status(400);
      throw new Error('Stock cannot be negative');
    }

    // Execute update
    const updateResult = await query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, stock = $4, image_url = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, description || '', parseFloat(price), parseInt(stock), image_url || '', id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updateResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the product
    const findResult = await query('SELECT * FROM products WHERE id = $1', [id]);
    const product = findResult.rows[0];

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Ownership check (Only creator can delete)
    if (product.user_id !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized: You can only delete products you created yourself');
    }

    // Execute delete
    await query('DELETE FROM products WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
