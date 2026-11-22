import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

function serializeCart(cart) {
  return (cart?.items || [])
    .filter(item => item.product)
    .map(item => ({
      ...item.product.toObject({ virtuals: true }),
      id: String(item.product._id),
      quantity: item.quantity,
    }));
}

async function getOrCreateCart(userId) {
  return Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

export async function getCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json({ items: serializeCart(cart) });
  } catch (error) { next(error); }
}

export async function addCartItem(req, res, next) {
  try {
    const { productId } = req.params;
    const quantity = Math.max(1, Math.floor(Number(req.body.quantity) || 1));
    if (!mongoose.isValidObjectId(productId)) return res.status(404).json({ message: 'Product not found.' });
    const product = await Product.findOne({ _id: productId, isActive: { $ne: false }, is_active: { $ne: false } });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(item => String(item.product) === String(product._id));
    if (existing) existing.quantity += quantity;
    else cart.items.push({ product: product._id, quantity });
    await cart.save();
    await cart.populate('items.product');
    res.json({ message: 'Cart updated.', items: serializeCart(cart) });
  } catch (error) { next(error); }
}

export async function updateCartItem(req, res, next) {
  try {
    const { productId } = req.params;
    const quantity = Math.floor(Number(req.body.quantity));
    if (!mongoose.isValidObjectId(productId)) return res.status(404).json({ message: 'Product not found.' });
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find(entry => String(entry.product) === String(productId));
    if (!item) return res.status(404).json({ message: 'Item is not in your cart.' });
    if (!Number.isFinite(quantity) || quantity < 1) cart.items = cart.items.filter(entry => String(entry.product) !== String(productId));
    else item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    res.json({ message: 'Cart updated.', items: serializeCart(cart) });
  } catch (error) { next(error); }
}

export async function removeCartItem(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter(entry => String(entry.product) !== String(req.params.productId));
    await cart.save();
    await cart.populate('items.product');
    res.json({ message: 'Item removed.', items: serializeCart(cart) });
  } catch (error) { next(error); }
}

export async function clearCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared.', items: [] });
  } catch (error) { next(error); }
}
