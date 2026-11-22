import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addWishlistProduct, getWishlist, removeWishlistProduct } from '../controllers/wishlistController.js';

const router = Router();
router.use(requireAuth);
router.get('/', getWishlist);
router.post('/products/:productId', addWishlistProduct);
router.delete('/products/:productId', removeWishlistProduct);
export default router;
