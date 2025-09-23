# Product Data Explorer API Documentation

## Base URL

http://localhost:3001/api

## Categories

### GET /categories

Get all categories with hierarchical structure.

**Response:**
[
{
"id": 1,
"name": "Fiction",
"slug": "fiction",
"description": "Fictional books and novels",
"children": [
{
"id": 2,
"name": "Science Fiction",
"slug": "science-fiction"
}
]
}
]

### GET /categories/:id

Get a specific category by ID.

**Parameters:**

- `id` (number): Category ID

### GET /categories/:id/products

Get products in a specific category.

**Parameters:**

- `id` (number): Category ID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 12)
- `search` (string, optional): Search term
- `sortBy` (string, optional): Sort field (date, price, rating, title)

## Products

### GET /products

Get all products with pagination.

### GET /products/:id

Get a specific product by ID.

## Scraping

### POST /scraping/categories

Scrape categories from World of Books.

### POST /scraping/products/:categoryId

Scrape products for a specific category.
