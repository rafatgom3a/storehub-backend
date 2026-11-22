import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

function serializeWishlist(wishlist) {
  return (wishlist?.products || []).filter(Boolean).map((product) => ({
    ...product.toObject({ virtuals: true }),
    id: String(product._id),
  }));
}

async function getOrCreateWishlist(userId) {
  return Wishlist.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, products: [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

export async function getWishlist(req, res, next) {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    return res.json({ products: serializeWishlist(wishlist) });
  } catch (error) { return next(error); }
}

export async function addWishlistProduct(req, res, next) {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return res.status(404).json({ message: 'Product not found.' });
    const product = await Product.findOne({ _id: productId, isActive: { $ne: false }, is_active: { $ne: false } });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const wishlist = await getOrCreateWishlist(req.user._id);
    if (!wishlist.products.some((id) => String(id) === String(product._id))) {
      wishlist.products.push(product._id);
      await wishlist.save();
    }
    await wishlist.populate('products');
    return res.json({ message: 'Product added to wishlist.', products: serializeWishlist(wishlist) });
  } catch (error) { return next(error); }
}

export async function removeWishlistProduct(req, res, next) {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    wishlist.products = wishlist.products.filter((id) => String(id) !== String(req.params.productId));
    await wishlist.save();
    await wishlist.populate('products');
    return res.json({ message: 'Product removed from wishlist.', products: serializeWishlist(wishlist) });
  } catch (error) { return next(error); }
}
