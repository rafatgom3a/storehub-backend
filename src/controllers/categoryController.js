import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const slugify = value => String(value || '').trim().toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function getCategories(_req, res, next) {
  try {
    const categories = await Category.find({ isActive: { $ne: false }, is_active: { $ne: false } }).sort({ name: 1 }).lean({ virtuals: true });
    res.json({ categories });
  } catch (error) { next(error); }
}

export async function getCategoryById(req, res, next) {
  try {
    const query = mongoose.isValidObjectId(req.params.id) ? { _id: req.params.id } : { slug: req.params.id.toLowerCase() };
    const category = await Category.findOne({ ...query, isActive: { $ne: false }, is_active: { $ne: false } }).lean({ virtuals: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) { next(error); }
}

export async function createCategory(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const slug = slugify(req.body.slug || name);
    if (!name || !slug) return res.status(400).json({ message: 'Category name is required' });
    const category = await Category.create({ ...req.body, name, slug });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) { next(error); }
}

export async function updateCategory(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Category not found' });
    const updates = { ...req.body };
    if (updates.name && !updates.slug) updates.slug = slugify(updates.name);
    if (updates.slug) updates.slug = slugify(updates.slug);
    const current = await Category.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Category not found' });
    if (updates.slug && updates.slug !== current.slug) {
      const productCount = await Product.countDocuments({ category: current.slug });
      if (productCount > 0) return res.status(409).json({ message: 'Cannot change this category slug while products use it. Move those products to another category first.' });
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated successfully', category });
  } catch (error) { next(error); }
}

export async function deleteCategory(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Category not found' });
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) return res.status(409).json({ message: `Cannot delete this category while ${productCount} product(s) use it` });
    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) { next(error); }
}
