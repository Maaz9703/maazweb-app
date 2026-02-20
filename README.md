# Ecommerce Full-Stack App

Full-stack e-commerce application with Backend (Node.js + Express), Mobile App (React Native + Expo), and Admin Panel (React + Vite).

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Stripe (optional)
- **Mobile:** React Native, Expo, React Navigation, Reanimated, Lottie, Context API
- **Admin:** React, Vite, Chart.js, React Router

## Project Structure

```
ecommerce-app/
├── backend/          # Express API
├── mobile-app/       # React Native Expo app
└── admin-panel/      # React Vite admin dashboard
```

## Getting Started

### 1. Backend

```bash
cd backend
cp env.example .env   # Edit .env with your MongoDB URI and JWT_SECRET
npm install
npm run dev
```

Create admin user:
```bash
node scripts/seedAdmin.js
# Admin: admin@example.com / admin123
```

Seed sample products:
```bash
node scripts/seedProducts.js
```

### 2. Mobile App

```bash
cd mobile-app
npm install
# Update API_URL in src/config/api.js to your backend URL (e.g., your machine's IP)
npm start
```

### 3. Admin Panel

```bash
cd admin-panel
npm install
# Create .env with VITE_API_URL=http://localhost:5000/api (or use proxy)
npm run dev
```

Login with admin credentials at http://localhost:3001

## API Endpoints

- **Auth:** POST /api/auth/register, /api/auth/login, GET /api/auth/me
- **Products:** GET/POST /api/products, GET/PUT/DELETE /api/products/:id
- **Orders:** GET/POST /api/orders, GET /api/orders/admin/all (admin)
- **Addresses:** CRUD /api/addresses
- **Wishlist:** GET/POST /api/wishlist, DELETE /api/wishlist/:productId
- **Reviews:** GET /api/reviews/product/:id, POST /api/reviews
- **Coupons:** POST /api/coupons/validate, Admin CRUD
- **Stripe:** POST /api/orders/create-payment-intent

## Features

- User registration/login (JWT)
- Product listing, search, category filter
- Cart, Checkout (COD + Stripe ready)
- Order management (admin)
- Address management
- Wishlist
- Product reviews
- Coupons
- Dark mode (mobile)
- Order tracking timeline
- Revenue charts (admin)
