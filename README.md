# InvenTrack - Inventory & Order Management System

Full-stack inventory management built with FastAPI, React, PostgreSQL, and Docker.

**Live:** https://ethara-ai-inventory-system.vercel.app

---

## Quick Start

```bash
# Local development with Docker
docker compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## Prerequisites

- **Docker & Docker Compose** (for containerized setup)

---

## Environment Setup

### Create `.env` files

**Root `.env` (for docker-compose):**
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory_db
DATABASE_URL=postgresql://postgres:postgres@db:5432/inventory_db
REACT_APP_API_URL=http://localhost:8000
```

**Backend `.env` (backend/ directory):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
```

**Frontend `.env` (frontend/ directory):**
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## Running Locally with Docker (Recommended)

```bash
# 1. Create root .env (see above)
# Create the .env file with the environment variables shown above

# 2. Build and start
docker compose up --build

# 3. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Docs: http://localhost:8000/docs
```

**Stop services:**
```bash
docker compose down        # Keeps data
docker compose down -v     # Removes data
```

---

## Running Locally Without Docker

### Backend

```bash
cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate          # Mac/Linux
venv\Scripts\activate             # Windows

# Setup
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

# Start
uvicorn app.main:app --reload --port 8000
```

Backend: http://localhost:8000

### Frontend

```bash
cd frontend

# Setup
npm install
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start
npm start
```

Frontend: http://localhost:3000

---

## Deployment

### Backend → Render → `https://ethara-ai-inventory-system.onrender.com`

### Frontend → Vercel → `https://ethara-ai-inventory-system.vercel.app`

### Docker Hub → Image → `iamsajiid/inventory-backend:latest`

---

## API Endpoints

**Products:** `POST/GET/PUT/DELETE /products/`
**Customers:** `POST/GET/DELETE /customers/`
**Orders:** `POST/GET/DELETE/PATCH /orders/`
**Dashboard:** `GET /dashboard/summary`

Full docs: `http://localhost:8000/docs`

---

## Tech Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy
- **Frontend:** React 18, React Router
- **Database:** PostgreSQL 16
- **Container:** Docker & Docker Compose

---

## Features

✅ Mobile-responsive design  
✅ In-app order confirmations  
✅ Order status filtering (All, Pending, Fulfilled, Cancelled)  
✅ Real-time inventory updates  
✅ REST API with auto-docs  

---

## Project Structure

```
.
├── README.md
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/ (FastAPI app)
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/ (React app)
```

---

## Commands Reference

```bash
# Docker
docker compose up --build
docker compose down
docker compose logs -f
docker compose logs -f backend

# Backend
python -m venv venv
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
npm install
npm start
npm run build

# Docker Hub
docker build -t iamsajiid/inventory-backend:latest ./backend
docker push iamsajiid/inventory-backend:latest
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000/8000 in use | Change port or stop other services |
| DB connection failed | Check DATABASE_URL format in .env |
| Frontend blank page | Check REACT_APP_API_URL in .env |
| CORS error | Verify CORS config in `backend/app/main.py` |

---