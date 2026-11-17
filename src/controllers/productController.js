import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const allowedSorts = {
  priceLow: { price: 1 },
  priceHigh: { price: -1 },
  ratingHigh: { rating: -1 },
  newest: { createdAt: -1 },
  default: { createdAt: -1 }
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getProducts(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 9));
    const filter = { isActive: true };
    if (req.query.search?.trim()) {
      const term = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      filter.$or = [{ title: term }, { description: term }, { brand: term }];
    }
    if (req.query.category) {
      const categories = String(req.query.category).split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
      if (categories.length) filter.category = { $in: categories };
    }
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      filter.price = {};
      if (req.query.minPrice !== undefined && req.query.minPrice !== '') filter.price.$gte = Math.max(0, Number(req.query.minPrice));
      if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') filter.price.$lte = Math.max(0, Number(req.query.maxPrice));
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }
    if (req.query.minRating !== undefined && Number(req.query.minRating) > 0) {
      filter.rating = { $gte: Math.min(5, Number(req.query.minRating)) };
    }
    if (req.query.featured === 'true') filter.isFeatured = true;

    const sort = allowedSorts[req.query.sort] || allowedSorts.default;
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean({ virtuals: true }),
      Product.countDocuments(filter)
    ]);
    res.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

export async function getProductById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Product not found' });
    const product = await Product.findOne({ _id: req.params.id, isActive: true }).lean({ virtuals: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) { next(error); }
}

async function validateCategory(categorySlug) {
  if (!categorySlug) return false;
  return Boolean(await Category.exists({ slug: String(categorySlug).toLowerCase(), isActive: true }));
}

export async function createProduct(req, res, next) {
  try {
    if (!(await validateCategory(req.body.category))) {
      return res.status(400).json({ message: 'A valid active category slug is required' });
    }
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) { next(error); }
}

export async function updateProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Product not found' });
    if (req.body.category && !(await validateCategory(req.body.category))) {
      return res.status(400).json({ message: 'A valid active category slug is required' });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated successfully', product });
  } catch (error) { next(error); }
}

export async function deleteProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Product not found' });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) { next(error); }
}
