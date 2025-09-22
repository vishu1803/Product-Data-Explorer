-- Sample seed data for Product Data Explorer

-- Insert sample categories
INSERT INTO categories (name, slug, description, isActive, displayOrder) VALUES
('Fiction', 'fiction', 'Fictional books and novels', true, 1),
('Non-Fiction', 'non-fiction', 'Educational and informational books', true, 2),
('Mystery & Thriller', 'mystery-thriller', 'Suspenseful and mysterious books', true, 3),
('Romance', 'romance', 'Love stories and romantic novels', true, 4),
('Science Fiction', 'science-fiction', 'Futuristic and sci-fi books', true, 5),
('Biography', 'biography', 'Life stories of notable people', true, 6);

-- Insert subcategories
INSERT INTO categories (name, slug, description, parentId, isActive, displayOrder) VALUES
('Classic Fiction', 'classic-fiction', 'Timeless fictional works', 1, true, 1),
('Modern Fiction', 'modern-fiction', 'Contemporary fictional works', 1, true, 2),
('Historical Fiction', 'historical-fiction', 'Fiction set in historical periods', 1, true, 3),
('Self-Help', 'self-help', 'Personal development books', 2, true, 1),
('Business', 'business', 'Business and entrepreneurship books', 2, true, 2);

-- Insert sample products
INSERT INTO products (title, author, description, price, rating, reviewCount, categoryId, isAvailable) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'A classic American novel about the Jazz Age', 12.99, 4.2, 1250, 7, true),
('To Kill a Mockingbird', 'Harper Lee', 'A novel about racial injustice in the American South', 14.50, 4.5, 2100, 7, true),
('1984', 'George Orwell', 'A dystopian social science fiction novel', 13.75, 4.4, 1800, 7, true),
('Pride and Prejudice', 'Jane Austen', 'A romantic novel of manners', 11.99, 4.3, 1650, 4, true),
('The Catcher in the Rye', 'J.D. Salinger', 'A controversial coming-of-age story', 13.25, 4.1, 1320, 8, true),
('Dune', 'Frank Herbert', 'A science fiction epic set in the distant future', 16.99, 4.6, 2250, 5, true),
('The Hobbit', 'J.R.R. Tolkien', 'A fantasy adventure tale', 15.50, 4.5, 1950, 1, true),
('Steve Jobs', 'Walter Isaacson', 'Biography of the Apple co-founder', 18.99, 4.3, 1100, 6, true);

-- Update sequences to prevent conflicts
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
