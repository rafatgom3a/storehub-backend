import { Router } from 'express';
import { getProductById, getProducts } from '../services/dummyJsonService.js';
const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const data = await getProducts({ limit: req.query.limit, skip: req.query.skip, category: req.query.category });
    res.json(data);
  } catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try { res.json(await getProductById(req.params.id)); }
  catch (error) { next(error); }
});
export default router;
