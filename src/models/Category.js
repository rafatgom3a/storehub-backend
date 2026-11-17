import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  image: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

categorySchema.virtual('id').get(function () { return this._id.toString(); });
export default mongoose.model('Category', categorySchema);
