# e-ecommerce

# Ecommerce Backend – Node.js + Express + PostgreSQL + Knex + Stripe

## Overview
Production-ready backend implementing flexible product model (JSONB attributes), full-text search (Postgres tsvector), multi-faceted filtering with dynamic facet counts, pagination & sorting. Includes Stripe Checkout test flow and webhook to record paid orders. Mock seeding generates 1000 diverse products.

## Quick Start
1. **Prereqs**: Node 18+, PostgreSQL 14+ with `uuid-ossp` or `pgcrypto` (for `gen_random_uuid()`), and Stripe account (test keys).
2. **Create DB**: `createdb ecommerce`
3. **Configure**: Copy `.env.example` to `.env` and fill.
4. **Install**: `npm i`
5. **Migrate & Seed**: `npm run db:migrate && npm run db:seed`
6. **Run**: `npm run dev`

## Key Endpoints
- `GET /api/v1/products?q=iphone&categories=Phones,Electronics&brands=Apple,Samsung&minPrice=100&maxPrice=1500&attrs=Storage:256 GB,Wireless:Yes&sort_by=price&sort_order=asc&page=1&pageSize=24`
  - Returns: `{ items: Product[], total: number, facets: { brands: [{value,count}], categories: [...], attributes: { [key]: [{value,count}] } } }`
- `POST /api/v1/checkout/create-session`
  - Body: `{ items: [{ productId, quantity }], customer_email? }`
  - Returns Stripe Checkout `{ id, url }` (use test cards: 4242 4242 4242 4242).
- `POST /api/v1/webhooks/stripe` – Configure Stripe webhook with signing secret.

## Data Model
- `products` (JSONB `attributes`, GIN index) with `product_search` tsvector (GIN index) and trigger to keep it updated. Many-to-many `product_categories`. Optional `stock_level`, `avg_rating`.
- `brands`, `categories`, `orders`, `order_items`.

## Indexing Strategy
- B-tree on price, brand_id. GIN on `attributes` and `product_search` for fast filtering & search.

## Facet Counts
- Query builds a filtered CTE, then aggregates facets (`brands`, `categories`, dynamic `attributes`) over that CTE so counts always reflect the currently filtered set.

## Notes
- For production: add input validation (Joi schemas), rate limiting, caching (e.g., Redis) for facet-heavy queries, and fetch Stripe line items in webhook to persist `order_items`.


# React + Vite

