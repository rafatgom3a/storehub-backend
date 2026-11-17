# StoreHub Backend

Node.js + Express + MongoDB REST API for StoreHub.

## Setup
1. Install Node.js LTS and MongoDB (local or Atlas).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.
4. Run `npm run dev`.
5. Health check: `GET http://localhost:5000/api/health`.

## Product API
- `GET /api/products` — list products. Query parameters: `page`, `limit`, `search`, `category` (comma-separated slugs), `minPrice`, `maxPrice`, `minRating`, `sort` (`priceLow`, `priceHigh`, `ratingHigh`, `newest`), `featured=true`.
- `GET /api/products/:id` — product details.
- `POST /api/products` — create (admin only).
- `PUT/PATCH /api/products/:id` — update (admin only).
- `DELETE /api/products/:id` — delete (admin only).

Product JSON fields include `title`, `description`, `category` (category slug), `price`, `discountPercentage`, `rating`, `stock`, `thumbnail`, `images`, `brand`, `sku`, `weight`, `dimensions`, `warrantyInformation`, `shippingInformation`, `availabilityStatus`, `returnPolicy`, `minimumOrderQuantity`, `reviews`, `meta`, `isFeatured`, and `isActive`.

## Category API
- `GET /api/categories` — list active categories.
- `GET /api/categories/:idOrSlug` — category details.
- `POST /api/categories` — create (admin only). Body: `{ "name": "Electronics", "description": "...", "image": "https://..." }`. Slug is generated from the name unless supplied.
- `PUT/PATCH /api/categories/:id` — update (admin only).
- `DELETE /api/categories/:id` — delete (admin only); deletion is blocked while products use the category.

## Admin access
Write operations are protected. Register a normal account using `/api/auth/register`, then promote that account once in MongoDB Compass or mongosh:

```js
use storehub
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Log in with that account and send `Authorization: Bearer YOUR_JWT_TOKEN` for product/category write requests. Never expose the token or `.env` values.

## React frontend
The companion `frontend/src` folder in the full-stack update ZIP is wired to this API. In your existing Vite frontend, set `VITE_API_URL=http://localhost:5000/api`, install/retain `axios`, then copy the provided `frontend/src` folder over your existing `src` folder.

The API starts with an empty product/category collection. Create categories first, then products using their category slugs. DummyJSON is no longer used.
