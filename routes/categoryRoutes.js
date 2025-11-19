const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');

// Validation rules
const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required')
];

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', auth, adminAuth, categoryValidation, createCategory);
router.put('/:id', auth, adminAuth, updateCategory);
router.delete('/:id', auth, adminAuth, deleteCategory);

module.exports = router;


