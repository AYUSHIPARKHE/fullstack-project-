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
  console.log('[UPLOAD] Upload request received');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('[UPLOAD] Multer error:', err.message, err.code, err);
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      console.error('[UPLOAD] No file received in request. req.body:', req.body);
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }
    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    console.log('[UPLOAD] Success! Image saved:', imageUrl);
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
