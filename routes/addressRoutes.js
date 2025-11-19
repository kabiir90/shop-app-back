const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');
const { auth } = require('../middleware/auth');

// Validation rules
const addressValidation = [
  body('street').notEmpty().withMessage('Street is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('postal_code').notEmpty().withMessage('Postal code is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('type').isIn(['SHIPPING', 'BILLING']).withMessage('Type must be SHIPPING or BILLING')
];

router.use(auth);

router.get('/', getAllAddresses);
router.get('/:id', getAddress);
router.post('/', addressValidation, createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;


