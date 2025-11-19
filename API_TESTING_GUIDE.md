# API Testing Guide

This guide will help you test all API endpoints using Postman, Insomnia, or any API testing tool.

## Prerequisites

1. **Start MongoDB**
   - Make sure MongoDB is running on `localhost:27017`
   - If not installed, download from https://www.mongodb.com/try/download/community

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```
   You should see: `Server running on port 3000`

## Base URL
```
http://localhost:3000/api
```

---

## Step-by-Step Testing Guide

### Step 1: Health Check
**GET** `http://localhost:3000/api/health`

**Expected Response:**
```json
{
  "success": true,
  "message": "API is running"
}
```

---

### Step 2: Register a User

**POST** `http://localhost:3000/api/users/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "customer@example.com",
  "password_hash": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "CUSTOMER"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "customer@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` from the response - you'll need it for authenticated requests!

---

### Step 3: Register an Admin User

**POST** `http://localhost:3000/api/users/register`

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password_hash": "admin123",
  "first_name": "Admin",
  "last_name": "User",
  "role": "ADMIN"
}
```

**Copy the admin token as well!**

---

### Step 4: Login (Alternative to Register)

**POST** `http://localhost:3000/api/users/login`

**Body (JSON):**
```json
{
  "email": "customer@example.com",
  "password_hash": "password123"
}
```

---

### Step 5: Create a Category (Admin Only)

**POST** `http://localhost:3000/api/categories`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>
```

**Body (JSON):**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and gadgets"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Electronics",
    "description": "Electronic devices and gadgets"
  }
}
```

**Create more categories:**
```json
{
  "name": "Clothing",
  "description": "Apparel and fashion items"
}
```

```json
{
  "name": "Books",
  "description": "Books and literature"
}
```

**⚠️ Copy the category `_id` from the response!**

---

### Step 6: Create Products (Admin Only)

**POST** `http://localhost:3000/api/products`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>
```

**Body (JSON):** (Replace `<CATEGORY_ID>` with actual ID from Step 5)
```json
{
  "category_id": "<CATEGORY_ID>",
  "name": "Laptop",
  "description": "High performance laptop",
  "price": 999.99,
  "stock_quantity": 50,
  "image_url": "https://example.com/laptop.jpg"
}
```

**Create more products:**
```json
{
  "category_id": "<CATEGORY_ID>",
  "name": "Smartphone",
  "description": "Latest smartphone model",
  "price": 699.99,
  "stock_quantity": 100,
  "image_url": "https://example.com/phone.jpg"
}
```

**⚠️ Copy the product `_id` from the response!**

---

### Step 7: Get All Products (Public - No Auth Required)

**GET** `http://localhost:3000/api/products`

**Query Parameters (Optional):**
- `category=<CATEGORY_ID>` - Filter by category
- `search=laptop` - Search in name/description
- `minPrice=500` - Minimum price
- `maxPrice=1000` - Maximum price

**Example:**
```
GET http://localhost:3000/api/products?search=laptop&minPrice=500
```

---

### Step 8: Create Address (Customer)

**POST** `http://localhost:3000/api/addresses`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Body (JSON):**
```json
{
  "street": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "type": "SHIPPING"
}
```

**Create billing address:**
```json
{
  "street": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "type": "BILLING"
}
```

**⚠️ Copy both address `_id` values!**

---

### Step 9: Add Items to Cart

**POST** `http://localhost:3000/api/carts/items`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Body (JSON):** (Replace `<PRODUCT_ID>` with actual ID)
```json
{
  "product_id": "<PRODUCT_ID>",
  "quantity": 2
}
```

**Add another item:**
```json
{
  "product_id": "<ANOTHER_PRODUCT_ID>",
  "quantity": 1
}
```

---

### Step 10: View Cart

**GET** `http://localhost:3000/api/carts`

**Headers:**
```
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "...",
      "user_id": "...",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "items": [
      {
        "_id": "...",
        "product_id": {
          "_id": "...",
          "name": "Laptop",
          "price": 999.99,
          "image_url": "..."
        },
        "quantity": 2
      }
    ],
    "total": "1999.98"
  }
}
```

---

### Step 11: Update Cart Item Quantity

**PUT** `http://localhost:3000/api/carts/items/<CART_ITEM_ID>`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Body (JSON):**
```json
{
  "quantity": 3
}
```

---

### Step 12: Create Order from Cart

**POST** `http://localhost:3000/api/orders`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Body (JSON):** (Use address IDs from Step 8)
```json
{
  "shipping_address_id": "<SHIPPING_ADDRESS_ID>",
  "billing_address_id": "<BILLING_ADDRESS_ID>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "user_id": "...",
      "total_amount": 1999.98,
      "status": "PENDING",
      "created_at": "..."
    },
    "items": [
      {
        "_id": "...",
        "product_id": {
          "name": "Laptop",
          "image_url": "..."
        },
        "quantity": 2,
        "price_at_purchase": 999.99
      }
    ]
  }
}
```

**Note:** After creating an order, the cart will be automatically cleared!

---

### Step 13: Get All Orders

**GET** `http://localhost:3000/api/orders`

**Headers:**
```
Authorization: Bearer <CUSTOMER_TOKEN>
```

**For Admin:** This will show all orders
**For Customer:** This will show only their orders

---

### Step 14: Get Single Order

**GET** `http://localhost:3000/api/orders/<ORDER_ID>`

**Headers:**
```
Authorization: Bearer <CUSTOMER_TOKEN>
```

---

### Step 15: Update Order Status (Admin Only)

**PUT** `http://localhost:3000/api/orders/<ORDER_ID>/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>
```

**Body (JSON):**
```json
{
  "status": "PAID"
}
```

**Valid statuses:** `PENDING`, `PAID`, `SHIPPED`

---

## Additional Endpoints to Test

### Get All Categories (Public)
**GET** `http://localhost:3000/api/categories`

### Get Single Category (Public)
**GET** `http://localhost:3000/api/categories/<CATEGORY_ID>`

### Get All Addresses
**GET** `http://localhost:3000/api/addresses`
**Headers:** `Authorization: Bearer <CUSTOMER_TOKEN>`

### Update Address
**PUT** `http://localhost:3000/api/addresses/<ADDRESS_ID>`
**Headers:** `Authorization: Bearer <CUSTOMER_TOKEN>`
**Body:**
```json
{
  "city": "Los Angeles"
}
```

### Remove Item from Cart
**DELETE** `http://localhost:3000/api/carts/items/<CART_ITEM_ID>`
**Headers:** `Authorization: Bearer <CUSTOMER_TOKEN>`

### Clear Cart
**DELETE** `http://localhost:3000/api/carts`
**Headers:** `Authorization: Bearer <CUSTOMER_TOKEN>`

### Get User Profile
**GET** `http://localhost:3000/api/users/<USER_ID>`
**Headers:** `Authorization: Bearer <CUSTOMER_TOKEN>`

### Update User
**PUT** `http://localhost:3000/api/users/<USER_ID>`
**Headers:** `Authorization: Bearer <CUSTOMER_TOKEN>`
**Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

---

## Testing Tips

1. **Save Tokens:** Create environment variables in Postman/Insomnia:
   - `customer_token` - Token from customer registration
   - `admin_token` - Token from admin registration
   - `base_url` - `http://localhost:3000/api`

2. **Use Collections:** Organize requests into folders:
   - Authentication
   - Users
   - Categories
   - Products
   - Addresses
   - Cart
   - Orders

3. **Test Error Cases:**
   - Try accessing protected routes without token
   - Try accessing admin routes with customer token
   - Try creating products with invalid category_id
   - Try adding out-of-stock items to cart

4. **Check Database:**
   - Connect to MongoDB and verify data:
   ```bash
   mongosh
   use ecommerce_db
   show collections
   db.users.find()
   db.products.find()
   ```

---

## Common Issues

**Issue:** "MongoDB connection error"
- **Solution:** Make sure MongoDB is running on `localhost:27017`

**Issue:** "Unauthorized" or "No token"
- **Solution:** Make sure you're including the `Authorization: Bearer <token>` header

**Issue:** "Access denied"
- **Solution:** Check if you're using the correct token (admin vs customer)

**Issue:** "Validation error"
- **Solution:** Check that all required fields are provided and have correct format

---

## Quick Test Sequence

1. Health check → ✅
2. Register customer → Get token
3. Register admin → Get admin token
4. Create category (admin) → Get category ID
5. Create product (admin) → Get product ID
6. Create address (customer) → Get address IDs
7. Add to cart (customer)
8. View cart (customer)
9. Create order (customer)
10. View orders (customer)
11. Update order status (admin)

Happy Testing! 🚀

