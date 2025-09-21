# ��� Product Data Explorer

A full-stack web application for scraping and exploring product data from World of Books.

## ��� Project Overview

This is a comprehensive web application that demonstrates:
- Full-stack development with NestJS and Next.js
- Web scraping capabilities using Crawlee and Playwright
- Modern database design with PostgreSQL
- Advanced frontend features with search, filtering, and sorting
- Responsive UI design with Tailwind CSS

## ✨ Features

### Core Functionality
- ��� **Web Scraping**: Automated data collection from World of Books
- ��� **Product Catalog**: Browse books organized by categories
- ��� **Advanced Search**: Real-time search across titles, authors, and categories
- ��� **Responsive Design**: Works on all devices and screen sizes
- ⚡ **Performance**: Fast loading with pagination and optimized queries

### Advanced Features
- ��� **Modern UI**: Professional design with Tailwind CSS v4
- ��� **Sort & Filter**: Multiple sorting options and filtering capabilities
- ��� **View Modes**: Toggle between grid and list layouts
- ��� **Animations**: Smooth transitions and loading states
- ��� **Smart Search**: Intelligent search with result highlighting

## ��� Technology Stack

### Backend
- **NestJS**: Modern Node.js framework with TypeScript
- **PostgreSQL**: Robust relational database
- **TypeORM**: Object-Relational Mapping for database operations
- **Crawlee + Playwright**: Web scraping and automation

### Frontend
- **Next.js 13+**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS v4**: Modern utility-first CSS framework
- **Lucide React**: Beautiful icon library

## ��� Getting Started

### Prerequisites
- Node.js 18 or higher
- Docker and Docker Compose
- Git

### Installation Steps

1. **Clone the repository**
git clone <repository-url>
cd product-data-explorer
2. **Start the database**
docker-compose up -d
3. **Setup Backend**
cd backend
npm install
npm run start:dev

4. **Setup Frontend** (open new terminal)
cd frontend
npm install
npm run dev
5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## ��� Usage Guide

1. **Initialize Data**: Visit home page and click "Scrape Categories"
2. **Browse Categories**: Navigate to Categories page to explore different genres
3. **View Products**: Click any category to see products within that category
4. **Scrape Products**: Use "Scrape Products" button to populate product data
5. **Search & Filter**: Use the search bar and filters to find specific items
Structure of project
product-data-explorer/
├── .git/                 # Git repository (only here!)
├── .gitignore           # Root gitignore
├── README.md            # Project documentation
├── docker-compose.yml   # Database setup
├── backend/             # NestJS backend
│   ├── src/
│   ├── package.json
│   ├── .gitignore      # Backend gitignore
│   └── .env.example    # Backend env example
└── frontend/           # Next.js frontend
    ├── src/
    ├── package.json
    ├── .gitignore      # Frontend gitignore
    └── .env.local.example


## ��� Key Features Showcase

- **Professional UI**: Modern, clean interface design
- **Real-time Search**: Instant search results as you type
- **Responsive Layout**: Perfect on desktop, tablet, and mobile
- **Advanced Filtering**: Sort by price, rating, date, or alphabetically
- **Smooth Animations**: Professional loading states and transitions

## ��� Assignment Requirements Met

✅ Full-stack application (NestJS + Next.js)  
✅ Database integration (PostgreSQL)  
✅ Web scraping implementation  
✅ Responsive frontend design  
✅ API communication between frontend and backend  
✅ Modern development practices and clean code  

## ���‍��� Developer

Built as part of a Full-Stack Web Development assignment to demonstrate:
- Modern web development skills
- Full-stack architecture understanding
- Database design and implementation
- Web scraping and data management
- Professional UI/UX design

---

**⭐ This project showcases production-ready code quality and modern web development practices.**
