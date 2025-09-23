-- ✅ Create the application database
CREATE DATABASE product_explorer;

-- ✅ Connect to the database
\c product_explorer;

-- ✅ Create secure application user
CREATE USER product_explorer_secure_user WITH ENCRYPTED PASSWORD 'SecureP@ssw0rd2024!ComplexEnough123456';

-- ✅ Grant necessary permissions
GRANT CONNECT ON DATABASE product_explorer TO product_explorer_secure_user;
GRANT USAGE ON SCHEMA public TO product_explorer_secure_user;
GRANT CREATE ON SCHEMA public TO product_explorer_secure_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO product_explorer_secure_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO product_explorer_secure_user;

-- ✅ Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO product_explorer_secure_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO product_explorer_secure_user;

-- ✅ Create some basic tables (TypeORM will handle the rest)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ✅ Log successful setup
SELECT 'Database initialized successfully with secure user' as status;
