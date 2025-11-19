const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// @route   GET /api/orders
// @desc    Get all orders (user's orders or all for admin)
// @access  Private
exports.getAllOrders = async (req, res, next) => {
  try {
    const query = req.user.role === 'ADMIN' ? {} : { user_id: req.user._id };
    const orders = await Order.find(query)
      .populate('user_id', 'email first_name last_name')
      .populate('shipping_address_id')
      .populate('billing_address_id')
      .sort({ created_at: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user_id', 'email first_name last_name')
      .populate('shipping_address_id')
      .populate('billing_address_id');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership
    if (order.user_id._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('product_id', 'name image_url');

    res.json({
      success: true,
      data: {
        order,
        items: orderItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shipping_address_id, billing_address_id } = req.body;

    if (!shipping_address_id || !billing_address_id) {
      return res.status(400).json({ success: false, message: 'Shipping and billing addresses are required' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Calculate total and validate stock
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.product_id.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product_id.name}`
        });
      }
      totalAmount += item.product_id.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      user_id: req.user._id,
      shipping_address_id,
      billing_address_id,
      total_amount: totalAmount,
      status: 'PENDING'
    });

    // Create order items and update stock
    for (const item of cartItems) {
      await OrderItem.create({
        order_id: order._id,
        product_id: item.product_id._id,
        quantity: item.quantity,
        price_at_purchase: item.product_id.price
      });

      // Update product stock
      item.product_id.stock_quantity -= item.quantity;
      await item.product_id.save();
    }

    // Clear cart
    await CartItem.deleteMany({ cart_id: cart._id });

    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('product_id', 'name image_url');

    await order.populate('shipping_address_id');
    await order.populate('billing_address_id');

    res.status(201).json({
      success: true,
      data: {
        order,
        items: orderItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('user_id', 'email first_name last_name')
      .populate('shipping_address_id')
      .populate('billing_address_id');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Delete order items
    await OrderItem.deleteMany({ order_id: order._id });
    await order.deleteOne();

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};

