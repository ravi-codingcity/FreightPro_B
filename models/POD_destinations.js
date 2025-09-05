const mongoose = require('mongoose');

// Shipping Line subdocument schema
const shippingLineSchema = new mongoose.Schema({
  lineName: {
    type: String,
    required: [true, 'Shipping line name is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Main POD Destination schema
const podDestinationSchema = new mongoose.Schema({
  destinationName: {
    type: String,
    required: [true, 'POD destination name is required'],
    trim: true,
    unique: true,
    index: true
  },
  shippingLines: [shippingLineSchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
podDestinationSchema.index({ destinationName: 'text' });
podDestinationSchema.index({ 'shippingLines.lineName': 1 });

// Virtual for active shipping lines count
podDestinationSchema.virtual('activeShippingLinesCount').get(function() {
  return this.shippingLines ? this.shippingLines.filter(line => line.isActive).length : 0;
});

// Instance method to add shipping line
podDestinationSchema.methods.addShippingLine = function(shippingLineData) {
  // Check if shipping line with same name already exists
  const existingLine = this.shippingLines.find(line => 
    line.lineName.toLowerCase() === shippingLineData.lineName.toLowerCase()
  );
  
  if (existingLine) {
    throw new Error('Shipping line with this name already exists for this destination');
  }
  
  this.shippingLines.push(shippingLineData);
  return this.save();
};

// Instance method to remove shipping line
podDestinationSchema.methods.removeShippingLine = function(shippingLineId) {
  this.shippingLines.pull(shippingLineId);
  return this.save();
};

// Instance method to update shipping line
podDestinationSchema.methods.updateShippingLine = function(shippingLineId, updateData) {
  const shippingLine = this.shippingLines.id(shippingLineId);
  if (!shippingLine) {
    throw new Error('Shipping line not found');
  }
  
  Object.assign(shippingLine, updateData);
  return this.save();
};

// Static method to find destinations by shipping line
podDestinationSchema.statics.findByShippingLine = function(lineName) {
  return this.find({
    'shippingLines.lineName': { $regex: lineName, $options: 'i' },
    'shippingLines.isActive': true,
    isActive: true
  });
};

// Static method to get all active destinations
podDestinationSchema.statics.getActiveDestinations = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('POD_destination', podDestinationSchema);