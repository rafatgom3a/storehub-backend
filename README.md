# StoreHub Backend (starter)

Node.js + Express + MongoDB starter for the uploaded StoreHub React frontend.

## Included
- MongoDB connection with Mongoose
- `GET /api/health`
- `GET /api/products` and `GET /api/products/:id` (temporary server-side proxy to DummyJSON)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/contact` (stores contact messages in MongoDB)
- Basic security middleware: Helmet, CORS, rate limiting, password hashing, JWT authentication

## Requirements
- Node.js 20 LTS or newer
- MongoDB local service, or a MongoDB Atlas connection string

## Setup
1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` and replace `JWT_SECRET` with a long random secret.
3. Set `CLIENT_URL` to your Vite frontend origin (usually `http://localhost:5173`).
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:5000/api/health`.

## Test endpoints
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products?limit=10
curl http://localhost:5000/api/products/1
```

Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

Contact form:
```bash
curl -X POST http://localhost:5000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","message":"Hello StoreHub"}'
```

## Connect the React frontend
Create `VITE_API_URL=http://localhost:5000/api` in the frontend `.env` and use it as the base URL for Axios. Do not put database credentials or JWT secrets in the Vite environment; variables prefixed with `VITE_` are exposed to browsers.

The current frontend's cart still uses localStorage. The next implementation step is to add persistent carts and orders, then update `CartContext` to call authenticated backend endpoints. The products endpoint currently proxies DummyJSON so the existing UI can be migrated gradually; it is not yet a locally managed product catalog.
