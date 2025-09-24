FROM postgres:15-alpine

# Copy initialization script
COPY ./backend/init.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432
