const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// @route   GET /api/carts
// @desc    Get user's cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user_id: req.user._id });
    }

    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate('product_id', 'name price image_url stock_quantity');

    let total = 0;
    cartItems.forEach(item => {
      total += item.product_id.price * item.quantity;
    });

    res.json({
      success: true,
      data: {
        cart,
        items: cartItems,
        total: total.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/carts/items
// @desc    Add item to cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check stock
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user._id });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({ cart_id: cart._id, product_id });
    if (cartItem) {
      cartItem.quantity += quantity;
      if (product.stock_quantity < cartItem.quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cart_id: cart._id,
        product_id,
        quantity
      });
    }

    await cartItem.populate('product_id', 'name price image_url');

    res.status(201).json({ success: true, data: cartItem });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/carts/items/:id
// @desc    Update cart item quantity
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findById(req.params.id).populate('cart_id', 'user_id');

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    // Check ownership
    if (cartItem.cart_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check stock
    const product = await Product.findById(cartItem.product_id);
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    await cartItem.populate('product_id', 'name price image_url');

    res.json({ success: true, data: cartItem });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/carts/items/:id
// @desc    Remove item from cart
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cartItem = await CartItem.findById(req.params.id).populate('cart_id', 'user_id');

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    // Check ownership
    if (cartItem.cart_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await cartItem.deleteOne();
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/carts
// @desc    Clear cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (cart) {
      await CartItem.deleteMany({ cart_id: cart._id });
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};


