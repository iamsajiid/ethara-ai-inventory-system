# InvenTrack – Inventory & Order Management System

A full-stack inventory and order management system built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

---

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Backend       | Python 3.12, FastAPI, SQLAlchemy  |
| Frontend      | React 18, React Router, Axios     |
| Database      | PostgreSQL 16                     |
| Container     | Docker, Docker Compose            |

---

## Project Structure

```
inventory-system/
├── docker-compose.yml
├── .env
├── .gitignore
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── core/
│       │   └── database.py
│       ├── models/
│       │   └── models.py
│       ├── exceptions/
│       │   ├── __init__.py
│       │   ├── http_exceptions.py
│       ├── schemas/
│       │   ├── product_schema.py
│       │   ├── customer_schema.py
│       │   └── order_schema.py
│       ├── routers/
│       │   ├── products.py
│       │   ├── customers.py
│       │   ├── orders.py
│       │   └── dashboard.py
│       └── services/
│           ├── product_service.py
│           ├── customer_service.py
│           └── order_service.py
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── .env.example
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── services/
        │   └── api.js
        └── pages/
            ├── DashboardPage.js
            ├── ProductsPage.js
            ├── CustomersPage.js
            └── OrdersPage.js
```

---

## Running with Docker Compose (Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system

# 2. Create the environment file
cp .env.example .env

# 3. Build and start all services
docker compose up --build

# 4. Open the app
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
```

### Useful Docker commands

```bash
# Stop containers (keeps data)
docker compose down

# Stop and wipe the database volume
docker compose down -v

# Rebuild after code changes
docker compose up --build

# View logs
docker compose logs -f

# View logs for one service only
docker compose logs -f backend
```

---

## Running Locally Without Docker

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 16 running locally

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Create the database in PostgreSQL
psql -U postgres -c "CREATE DATABASE inventory_db;"

# Set environment variable
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
# Windows CMD: set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
# Windows PowerShell: $env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventory_db"

# Start the backend (tables are auto-created on startup)
uvicorn app.main:app --reload --port 8000
```

Backend → http://localhost:8000
Interactive docs → http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variable
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start the dev server
npm start
```

Frontend → http://localhost:3000

---

## API Endpoints

### Products
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| POST   | /products/                      | Create a product     |
| GET    | /products/                      | List all products    |
| GET    | /products/{id}                  | Get product by ID    |
| PUT    | /products/{id}                  | Update a product     |
| DELETE | /products/{id}                  | Delete a product     |
| GET    | /products/low-stock             | Get low stock items  |

### Customers
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| POST   | /customers/                     | Create a customer    |
| GET    | /customers/                     | List all customers   |
| GET    | /customers/{id}                 | Get customer by ID   |
| DELETE | /customers/{id}                 | Delete a customer    |

### Orders
| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| POST   | /orders/                        | Create order (deducts inventory)   |
| GET    | /orders/                        | List all orders (can filter by status)   |
| GET    | /orders/{id}                    | Get order with items               |
| DELETE | /orders/{id}                    | Cancel order (restores inventory, marks as cancelled)  |

### Dashboard
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | /dashboard/summary              | Totals + low stock   |

---

## Features

### Order Management

#### Order Filtering
- **All Filter**: Displays all orders regardless of status (pending, completed, cancelled, etc.)
- **Status Filters**: Filter orders by specific status (e.g., "Pending", "Cancelled", "Completed")
- Each filter tab dynamically shows order counts for that status

#### Order Cancellation
- **In-App Confirmation Modal**: When cancelling an order, users see a professional in-app confirmation dialog (not a browser dropdown)
- **Inventory Restoration**: Cancelling an order automatically restores the stock quantities for all items in that order
- **Status Update**: Cancelled orders are marked with a "Cancelled" status and appear immediately in the Cancelled filter
- **Seamless UX**: After cancellation confirmation, the order list updates in real-time to reflect the status change

#### Order Visibility
- Cancelled orders remain in the system and are visible when:
  - Viewing the "All" filter (shows all orders across all statuses)
  - Viewing the "Cancelled" status filter
- Cancelled orders are hidden from other status filters (e.g., "Pending", "Completed")

---

## Docker Hub – Push Backend Image

```bash
# Log in to Docker Hub
docker login

# Build the backend image
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

To use your published image instead of building locally, replace the `build` block in docker-compose.yml:

```yaml
backend:
  image: YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) and click **New → Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Dockerfile Path:** `./Dockerfile`
4. Add environment variable:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/inventory_db
   ```
   Use Render's managed PostgreSQL, or a free provider like [Neon](https://neon.tech) or [Supabase](https://supabase.com)
5. Click **Deploy** — note your backend URL e.g. `https://inventory-backend.onrender.com`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New → Project**
2. Import your GitHub repository
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://inventory-backend.onrender.com
   ```
5. Click **Deploy** — Vercel gives you a public URL automatically

> **Note:** After deploying, update `allow_origins` in `backend/app/main.py` to include your Vercel URL for production security instead of `"*"`.

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable             | Default                                               | Description                  |
|----------------------|-------------------------------------------------------|------------------------------|
| POSTGRES_USER        | postgres                                              | PostgreSQL username           |
| POSTGRES_PASSWORD    | postgres                                              | PostgreSQL password           |
| POSTGRES_DB          | inventory_db                                          | PostgreSQL database name      |
| DATABASE_URL         | postgresql://postgres:postgres@db:5432/inventory_db   | Full DB connection string     |
| REACT_APP_API_URL    | http://localhost:8000                                 | Backend URL for the frontend  |

---

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders cannot be placed if any product has insufficient stock
- Creating an order automatically deducts quantity from inventory
- Cancelling an order automatically restores inventory and marks the order as "Cancelled"
- Order total is always calculated server-side
- Products with quantity ≤ 10 are flagged as low stock
- Cancelled orders remain in the system and can be viewed via the "All" filter or "Cancelled" status filter

---