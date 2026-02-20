const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please add full name'],
    },
    address: {
      type: String,
      required: [true, 'Please add address'],
    },
    city: {
      type: String,
      required: [true, 'Please add city'],
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
    },
    zipCode: {
      type: String,
      required: [true, 'Please add zip code'],
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure only one default address per user
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('Address', addressSchema);
