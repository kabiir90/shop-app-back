const Address = require('../models/Address');
const { validationResult } = require('express-validator');

// @route   GET /api/addresses
// @desc    Get all addresses (for current user or all for admin)
// @access  Private
exports.getAllAddresses = async (req, res, next) => {
  try {
    const query = req.user.role === 'ADMIN' ? {} : { user_id: req.user._id };
    const addresses = await Address.find(query).populate('user_id', 'email first_name last_name');
    res.json({ success: true, count: addresses.length, data: addresses });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/addresses/:id
// @desc    Get single address
// @access  Private
exports.getAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id).populate('user_id', 'email first_name last_name');
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Check if user owns this address or is admin
    if (address.user_id._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/addresses
// @desc    Create new address
// @access  Private
exports.createAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const addressData = {
      ...req.body,
      user_id: req.body.user_id || req.user._id
    };

    // Only admin can create address for other users
    if (req.body.user_id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const address = await Address.create(addressData);
    await address.populate('user_id', 'email first_name last_name');

    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/addresses/:id
// @desc    Update address
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Check if user owns this address or is admin
    if (address.user_id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'user_id' || req.user.role === 'ADMIN') {
        address[key] = req.body[key];
      }
    });

    await address.save();
    await address.populate('user_id', 'email first_name last_name');

    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/addresses/:id
// @desc    Delete address
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Check if user owns this address or is admin
    if (address.user_id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await address.deleteOne();
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};


