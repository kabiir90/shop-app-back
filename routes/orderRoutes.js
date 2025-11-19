const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

router.use(auth);

router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id/status', adminAuth, updateOrderStatus);
router.delete('/:id', adminAuth, deleteOrder);

module.exports = router;


