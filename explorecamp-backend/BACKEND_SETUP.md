# ExploreCamp Backend Setup Guide

This document explains how to set up and run the ExploreCamp backend server.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

#### Install PostgreSQL (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

#### Start PostgreSQL:
```bash
# On systems with systemd:
sudo systemctl start postgresql
sudo systemctl enable postgresql

# On systems without systemd:
sudo pg_ctlcluster 17 main start
```

#### Create Database and User:
```bash
# Switch to postgres user and create database
sudo -u postgres createdb explorecamp

# Create user with password
sudo -u postgres psql -c "CREATE USER explorecamp WITH PASSWORD 'explorecamp123';"

# Grant permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE explorecamp TO explorecamp;"
sudo -u postgres psql -c "ALTER USER explorecamp CREATEDB;"
sudo -u postgres psql -d explorecamp -c "GRANT ALL ON SCHEMA public TO explorecamp;"
```

### 3. Configure Environment Variables

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Edit `.env` file with your specific configuration:
- `JWT_SECRET`: Use a strong, unique secret for production
- `ETHEREAL_USER` and `ETHEREAL_PASS`: Get from https://ethereal.email/ for testing
- `DATABASE_URL`: Update with your database credentials

### 4. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 5. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm run start
```

The server will start on `http://localhost:5000` by default.

## Testing the Setup

Once the server is running, you can test it:

```bash
curl http://localhost:5000
```

You should see: `ExploreCamp API is running!`

## Common Issues and Solutions

### Issue: Server exits immediately after starting

**Symptoms:**
- Server starts but then exits without staying running
- No error messages or brief error messages

**Causes:**
1. Missing dependencies
2. Missing environment variables
3. Database connection issues
4. Missing Prisma client

**Solutions:**
1. Install dependencies: `npm install`
2. Create `.env` file with all required variables
3. Set up PostgreSQL database and verify connection
4. Generate Prisma client: `npx prisma generate`
5. Run database migrations: `npx prisma migrate dev`

### Issue: Database connection errors

**Symptoms:**
- `Error: P3014` - Shadow database creation errors
- Permission denied errors
- Connection refused errors

**Solutions:**
1. Ensure PostgreSQL is running
2. Verify database credentials in `.env`
3. Grant proper permissions to the database user
4. Check if the database exists

### Issue: Missing environment variables

**Symptoms:**
- Server starts but APIs fail
- JWT token errors
- Email sending failures

**Solutions:**
1. Copy `.env.example` to `.env`
2. Fill in all required environment variables
3. Use strong, unique secrets for production

## API Endpoints

The backend provides the following main endpoints:

- `GET /` - Health check
- `/users/*` - User management
- `/products/*` - Product/campsite management
- `/bookings/*` - Booking management
- `/admin/*` - Admin operations
- `/reviews/*` - Review management
- `/collections/*` - Collection management

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Database Operations

```bash
# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `5000` |
| `JWT_SECRET` | JWT signing secret | Yes | `your_secure_secret_here` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@localhost:5432/db` |
| `ETHEREAL_USER` | SMTP username for emails | Yes | `ethereal_username` |
| `ETHEREAL_PASS` | SMTP password for emails | Yes | `ethereal_password` |

## Troubleshooting

If you encounter issues:

1. Check that all prerequisites are installed
2. Verify PostgreSQL is running: `sudo pg_ctlcluster 17 main status`
3. Test database connection: `psql -h localhost -U explorecamp -d explorecamp`
4. Check logs for specific error messages
5. Ensure all environment variables are set correctly

For additional help, check the application logs or contact the development team.