const mongoose = require('mongoose');

const customerOrderSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'US' },
    product: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    createdBy: { type: String, default: 'demo' },
  },
  { timestamps: true }
);

// Auto-calculate totalAmount before save
customerOrderSchema.pre('save', function (next) {
  this.totalAmount = this.quantity * this.unitPrice;
  next();
});

customerOrderSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.quantity !== undefined || update.unitPrice !== undefined) {
    // Will be handled in route
  }
  next();
});

module.exports = mongoose.model('CustomerOrder', customerOrderSchema);
