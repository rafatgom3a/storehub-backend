import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewerName: { type: String, trim: true, default: 'Customer' },
  reviewerEmail: { type: String, trim: true, lowercase: true, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  comment: { type: String, trim: true, default: '' },
  date: { type: Date, default: Date.now }
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160, index: true },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  category: { type: String, required: true, trim: true, lowercase: true, index: true },
  price: { type: Number, required: true, min: 0 },
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  stock: { type: Number, default: 0, min: 0 },
  brand: { type: String, trim: true, default: '' },
  sku: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
  weight: { type: Number, default: 0, min: 0 },
  dimensions: {
    width: { type: Number, default: 0, min: 0 },
    height: { type: Number, default: 0, min: 0 },
    depth: { type: Number, default: 0, min: 0 }
  },
  warrantyInformation: { type: String, default: '' },
  shippingInformation: { type: String, default: '' },
  availabilityStatus: { type: String, default: 'In Stock' },
  returnPolicy: { type: String, default: '' },
  minimumOrderQuantity: { type: Number, default: 1, min: 1 },
  thumbnail: { type: String, default: '' },
  images: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  reviews: { type: [reviewSchema], default: [] },
  meta: {
    barcode: { type: String, default: '' },
    qrCode: { type: String, default: '' }
  },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('id').get(function () { return this._id.toString(); });
productSchema.index({ title: 'text', description: 'text', brand: 'text' });

export default mongoose.model('Product', productSchema);
