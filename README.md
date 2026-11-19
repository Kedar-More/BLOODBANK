# Blood Bank Management System

Full-stack Blood Bank project based on the provided ER diagram.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL

## Project Structure
- `database/schema.sql` - complete MySQL schema from ERD entities
- `backend` - REST API with CRUD endpoints
- `frontend` - web UI connected to backend APIs

## Setup

### 1) Create Database
Run the SQL schema in MySQL:

```sql
SOURCE /absolute/path/to/BLOODBANK/database/schema.sql;
```

Or open `database/schema.sql` in MySQL Workbench and execute it.

### 1.1) Add Sample Data (Optional)
Run this after schema creation:

```sql
SOURCE /absolute/path/to/BLOODBANK/database/seed.sql;
```

This inserts demo donors, blood banks, recipients, donations, inventory, and requests.

### 2) Configure Backend

```bash
cd backend
cp .env.example .env
```

Update `.env` with your MySQL credentials.

### 3) Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 4) Configure and Start Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Main API Endpoints
- `/api/health`
- `/api/dashboard`
- `/api/donors`
- `/api/bloodbanks`
- `/api/hospitals`
- `/api/recipients`
- `/api/donations`
- `/api/requests`
- `/api/inventory`
- `/api/screenings`
- `/api/tests`

Each resource supports `GET`, `GET by id`, `POST`, `PUT`, and `DELETE`.
