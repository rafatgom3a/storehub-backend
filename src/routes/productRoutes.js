import { Router } from 'express';
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controllers/productController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireAuth, requireAdmin, createProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.patch('/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);
export default router;
