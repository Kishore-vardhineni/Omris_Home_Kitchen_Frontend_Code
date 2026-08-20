import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  weight: { type: String },
  packing: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    guestInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String },
      name:     { type: String },
      street:   { type: String },
      address:  { type: String },
      state:    { type: String },
      phone:    { type: String },
      landmark: { type: String },
      remarks:  { type: String },
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paymentMethod: {
      type: String,
      enum: ['WhatsApp', 'Online', 'Cash on Delivery', 'PhonePe / UPI', 'UPI'],
      default: 'WhatsApp',
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
    },
    status: {
      type: String,
      enum: ['Pending', 'Payment Pending', 'Awaiting Confirmation', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Awaiting Confirmation',
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
