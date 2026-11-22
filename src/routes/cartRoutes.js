import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from '../controllers/cartController.js';

const router = Router();
router.use(requireAuth);
router.get('/', getCart);
router.post('/items/:productId', addCartItem);
router.patch('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);
export default router;
