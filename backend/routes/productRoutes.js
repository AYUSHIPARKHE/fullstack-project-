import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply auth protection middleware to all product routes
router.use(protect);

// Endpoint for direct image upload
router.post('/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }
    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      image_url: imageUrl,
    });
  });
});

router.route('/')
  .post(createProduct)
  .get(getProducts);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
