
# Product Data Explorer

A full-stack web application that scrapes and displays book data from World of Books, built with NestJS backend and Next.js frontend.

## 🚀 Live Demo

- **Frontend:** [https://product-explorer-frontend-qp3m.onrender.com](https://product-explorer-frontend-qp3m.onrender.com)
- **Backend API:** [https://product-explorer-backend-eaj3.onrender.com/api](https://product-explorer-backend-eaj3.onrender.com/api)
- **API Documentation:** [https://product-explorer-backend-eaj3.onrender.com/api/docs](https://product-explorer-backend-eaj3.onrender.com/api/docs)

## 📋 Features

### Backend (NestJS)
- **Real-time Web Scraping:** Scrapes categories and products from World of Books using Playwright + Cheerio fallback
- **RESTful API:** Complete CRUD operations for categories and products
- **Database Integration:** PostgreSQL with TypeORM for data persistence
- **Caching:** Redis integration for improved performance
- **Rate Limiting:** Protection against excessive API calls
- **API Documentation:** Swagger/OpenAPI documentation
- **Docker Support:** Containerized deployment ready

### Frontend (Next.js)
- **Modern UI:** Responsive design with Tailwind CSS
- **Server-Side Rendering:** Optimized performance with Next.js
- **Real-time Data:** Live scraping integration with backend
- **Product Browsing:** Category-based product exploration
- **Search & Filter:** Advanced product filtering capabilities
- **Image Optimization:** Next.js Image component for optimized loading

### Key Functionality
- **Category Management:** Browse book categories scraped from World of Books
- **Product Discovery:** View detailed product information including prices, authors, and descriptions
- **Real-time Scraping:** On-demand data scraping with caching for performance
- **Review System:** Product reviews and ratings display
- **Responsive Design:** Mobile-first approach with modern UI

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Caching:** Redis
- **Web Scraping:** Playwright + Cheerio
- **Validation:** Class-validator
- **Documentation:** Swagger/OpenAPI
- **Containerization:** Docker

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Image Optimization:** Next.js Image
- **Deployment:** Docker + Static Export

### Infrastructure
- **Hosting:** Render
- **Database:** PostgreSQL (Render)
- **Cache:** Redis (Render)
- **CI/CD:** Git-based deployment

## 🏗️ Architecture

```

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │    NestJS       │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│
▼
┌─────────────────┐
│     Redis       │
│     Cache       │
└─────────────────┘
│
▼
┌─────────────────┐
│  World of Books │
│   (Scraping)    │
└─────────────────┘

```

## 📦 Installation

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Local Development Setup

1. **Clone the repository:**
```

git clone <your-repo-url>
cd product-data-explorer

```

2. **Backend Setup:**
```

cd backend
npm install
cp .env.example .env

# Edit .env with your database credentials

npm run start:dev

```

3. **Frontend Setup:**
```

cd frontend
npm install
cp .env.local.example .env.local

# Edit .env.local with your backend URL

npm run dev

```

4. **Database Setup:**
```


# The application will auto-create tables on first run

# Or run migrations manually:

npm run migration:run

```

### Docker Development

1. **Start all services:**
```

docker-compose up -d

```

2. **Access the application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## 🚀 Deployment

### Render Deployment (Recommended)

The application is configured for automatic deployment on Render using Docker.

1. **Fork this repository**

2. **Create Render services:**
   - PostgreSQL database
   - Redis cache
   - Backend web service (Docker)
   - Frontend web service (Docker)

3. **Configure environment variables** (see Environment Variables section)

4. **Deploy** using Git-based deployment

### Environment Variables

#### Backend (.env)
```

NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
FRONTEND_URL=https://your-frontend-url
ALLOWED_ORIGINS=https://your-frontend-url

```

#### Frontend (.env.local)
```

NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-url/api
NEXT_PUBLIC_BASE_URL=https://your-frontend-url

```

## 📚 API Documentation

### REST Endpoints

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/products` - Get products in category

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search` - Search products

#### Scraping
- `POST /api/scraping/categories` - Scrape categories from World of Books
- `POST /api/scraping/products/:categoryId` - Scrape products for category
- `POST /api/scraping/product-details/:productId` - Get detailed product info

### Response Format
```

{
"success": true,
"data": [...],
"message": "Success",
"pagination": {
"page": 1,
"limit": 10,
"total": 100
}
}

```

## 🧪 Testing

### Backend Testing
```

cd backend
npm run test
npm run test:e2e

```

### Frontend Testing
```

cd frontend
npm run test
npm run test:e2e

```

## 🔧 Development

### Project Structure
```

product-data-explorer/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── categories/
│   │   │   ├── products/
│   │   │   └── scraping/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md

```

### Key Features Implementation

#### Web Scraping
- **Dual Strategy:** Playwright (primary) + Cheerio (fallback)
- **Caching:** 5-minute cache for scraped data
- **Error Handling:** Graceful fallback between scraping methods
- **Rate Limiting:** Prevents excessive scraping

#### Database Schema
- **Categories:** id, name, slug, description, worldOfBooksUrl
- **Products:** id, title, author, price, description, categoryId, etc.
- **Reviews:** id, productId, rating, reviewText, reviewerName, etc.

#### Performance Optimizations
- **Caching:** Redis for frequently accessed data
- **Database:** Optimized queries with TypeORM
- **Frontend:** Next.js static generation and image optimization
- **Docker:** Multi-stage builds for smaller images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request



## 🐛 Known Issues

- **Browser Dependencies:** Playwright requires additional system dependencies in production
- **Memory Limits:** Optimized for free-tier hosting with 512MB RAM limit
- **Rate Limiting:** World of Books scraping is rate-limited to prevent blocking

## 🔮 Future Enhancements

- [ ] User authentication and favorites
- [ ] Advanced search with filters
- [ ] Price tracking and alerts
- [ ] Book recommendations
- [ ] Mobile app (React Native)
- [ ] GraphQL API
- [ ] Elasticsearch integration
- [ ] Advanced analytics dashboard



## 🙏 Acknowledgments

- **World of Books** for providing book data

