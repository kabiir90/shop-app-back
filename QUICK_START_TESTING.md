# Quick Start - Testing Your API

## 🚀 Quick Setup (3 Steps)

### 1. Start MongoDB
Make sure MongoDB is running:
```bash
# Windows (if installed as service, it should auto-start)
# Or start manually:
mongod
```

### 2. Install & Start API
```bash
npm install
npm run dev
```

You should see: `Server running on port 3000`

### 3. Import Postman Collection
- Open Postman
- Click **Import** button
- Select `POSTMAN_COLLECTION.json` file
- All requests are now ready to use!

---

## 📋 Testing Sequence (Copy & Paste Ready)

### Step 1: Health Check
```
GET http://localhost:3000/api/health
```

### Step 2: Register Customer
```
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "email": "customer@test.com",
  "password_hash": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "CUSTOMER"
}
```
**→ Copy the `token` from response!**

### Step 3: Register Admin
```
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "email": "admin@test.com",
  "password_hash": "admin123",
  "first_name": "Admin",
  "last_name": "User",
  "role": "ADMIN"
}
```
**→ Copy the admin `token` from response!**

### Step 4: Create Category (Use Admin Token)
```
POST http://localhost:3000/api/categories
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic products"
}
```
**→ Copy the category `_id` from response!**

### Step 5: Create Product (Use Admin Token & Category ID)
```
POST http://localhost:3000/api/products
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "category_id": "<CATEGORY_ID>",
  "name": "Laptop",
  "description": "High performance laptop",
  "price": 999.99,
  "stock_quantity": 50,
  "image_url": "https://example.com/laptop.jpg"
}
```
**→ Copy the product `_id` from response!**

### Step 6: Create Address (Use Customer Token)
```
POST http://localhost:3000/api/addresses
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "type": "SHIPPING"
}
```
**→ Copy the address `_id` from response!**

Create another for billing:
```
POST http://localhost:3000/api/addresses
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "type": "BILLING"
}
```

### Step 7: Add to Cart (Use Customer Token & Product ID)
```
POST http://localhost:3000/api/carts/items
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "product_id": "<PRODUCT_ID>",
  "quantity": 2
}
```

### Step 8: View Cart
```
GET http://localhost:3000/api/carts
Authorization: Bearer <CUSTOMER_TOKEN>
```

### Step 9: Create Order (Use Customer Token & Address IDs)
```
POST http://localhost:3000/api/orders
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "shipping_address_id": "<SHIPPING_ADDRESS_ID>",
  "billing_address_id": "<BILLING_ADDRESS_ID>"
}
```

### Step 10: View Orders
```
GET http://localhost:3000/api/orders
Authorization: Bearer <CUSTOMER_TOKEN>
```

### Step 11: Update Order Status (Admin Only)
```
PUT http://localhost:3000/api/orders/<ORDER_ID>/status
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "status": "PAID"
}
```

---

## 🛠️ Using Postman

1. **Import Collection**: File → Import → Select `POSTMAN_COLLECTION.json`

2. **Set Variables**:
   - After registering, the tokens are automatically saved
   - Or manually set in Collection Variables:
     - `customer_token`
     - `admin_token`
     - `base_url` (already set to `http://localhost:3000/api`)

3. **Test Flow**:
   - Run requests in order
   - Copy IDs from responses
   - Paste into subsequent requests

---

## 🧪 Using cURL (Command Line)

### Register Customer
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password_hash": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "CUSTOMER"
  }'
```

### Create Category (Replace TOKEN)
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Electronics",
    "description": "Electronic products"
  }'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

---

## 📱 Using Insomnia

1. **Import**: Create Request → Import → From File → Select `POSTMAN_COLLECTION.json`
2. **Set Environment Variables**:
   - `base_url`: `http://localhost:3000/api`
   - `customer_token`: (paste after registration)
   - `admin_token`: (paste after admin registration)

---

## ✅ Expected Results

- ✅ Health check returns `{"success": true, "message": "API is running"}`
- ✅ Registration returns user object + token
- ✅ Products can be created and retrieved
- ✅ Cart items can be added
- ✅ Orders can be created from cart
- ✅ Cart is cleared after order creation

---

## 🐛 Troubleshooting

**"MongoDB connection error"**
→ Start MongoDB: `mongod` or check if service is running

**"Unauthorized" or "No token"**
→ Add header: `Authorization: Bearer <your_token>`

**"Access denied"**
→ Check if you're using correct token (admin vs customer)

**Port already in use**
→ Change PORT in `.env` file or kill process on port 3000

---

## 📚 Full Documentation

See `API_TESTING_GUIDE.md` for detailed endpoint documentation and examples.

Happy Testing! 🎉


