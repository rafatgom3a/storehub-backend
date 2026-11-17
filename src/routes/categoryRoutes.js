import { Router } from 'express';
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from '../controllers/categoryController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', requireAuth, requireAdmin, createCategory);
router.put('/:id', requireAuth, requireAdmin, updateCategory);
router.patch('/:id', requireAuth, requireAdmin, updateCategory);
router.delete('/:id', requireAuth, requireAdmin, deleteCategory);
export default router;
