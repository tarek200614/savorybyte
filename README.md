# SavoryByte — Production SaaS Restaurant Reservation & Management System

> **A real-world, enterprise-grade Restaurant Reservation and Operational Management SaaS platform built with Clean Architecture, Domain-Driven Design, and modern Full-Stack engineering practices.**

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-blue.svg)](.github/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.111-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![SQLAlchemy 2.0](https://img.shields.io/badge/ORM-SQLAlchemy_2.0_Async-red.svg)](https://docs.sqlalchemy.org)
[![React 18](https://img.shields.io/badge/Frontend-React_18_+_TypeScript-61DAFB.svg?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-336791.svg?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/DevOps-Docker_&_Compose-2496ED.svg?logo=docker)](https://www.docker.com)

---

## 🏛️ System Architecture

SavoryByte is engineered following **Clean Architecture** principles, strictly decoupling business logic from external frameworks, persistence mechanisms, and user interfaces.

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 18 + TypeScript)"]
        CP[Customer Portal\n• Booking Wizard\n• Digital Menu & Cart\n• Order History]
        SP[Staff Portal\n• Reservation Manager\n• Kitchen Display KDS]
        AP[Admin Suite\n• Analytics Dashboard\n• Table & Menu Config]
    end

    subgraph API ["FastAPI 0.111 Asynchronous Application"]
        Auth[OAuth2 & JWT Auth\nRole-Based Access Control]
        Router[REST Routers v1\n/tables, /reservations, /menu, /orders, /admin]
        Deps[Dependency Injection\nget_db, require_role, current_user]
    end

    subgraph Core ["Domain Core & Business Rules"]
        Algo[Overlap Prevention Engine\nDouble-booking Check]
        CRUD[Asynchronous CRUD Repositories\nOptimized Eager Loading]
        Schemas[Pydantic v2 Schemas\nStrict Data Validation]
    end

    subgraph Persistence ["Persistence Layer"]
        ORM[SQLAlchemy 2.0 Async ORM]
        Alembic[Alembic Async Migrations]
        PG[(PostgreSQL 16 Database\n3NF Normalized)]
    end

    Client -->|Bearer JWT HTTP Requests| API
    API --> Deps
    Deps --> Auth
    API --> Router
    Router --> Core
    Core --> ORM
    ORM --> PG
```

---

## ✨ Key Features & Capabilities

### 1. 🍽️ Customer Dining Experience
* **Interactive Table Booking Wizard**: Real-time table selection by dining location (`Main Hall`, `Terrace`, `Private Room`, `Bar`) and guest capacity.
* **Overlap Prevention Algorithm**: Backend guarantees zero double-bookings using mathematically sound interval collision checks ($A_{\text{start}} < B_{\text{end}} \land A_{\text{end}} > B_{\text{start}}$) with immediate `409 Conflict` feedback.
* **Digital Gourmet Menu & Cart**: Filter dishes by category, view dietary badges (`Vegetarian`, `Gluten-Free`, preparation times), search items, and submit live food orders.
* **Self-Service Customer Portal**: View live booking statuses (`PENDING`, `CONFIRMED`, `SEATED`, `COMPLETED`, `CANCELLED`) and cancel bookings directly.

### 2. 👨‍🍳 Staff Operational Command
* **Real-Time Reservation Manager**: Manage all bookings with 15-second automatic polling, status filtering, and one-click state transitions (*Confirm*, *Seat Guest*, *Complete*, *Cancel*, *No Show*).
* **Live Kitchen Display System (KDS)**: Kanban-style order board (`Pending` → `Preparing` → `Ready` → `Served`) with live elapsed time counters and 10-second automatic queue refresh.

### 3. 👑 Executive Admin Control Center
* **Live SaaS Analytics Dashboard**: Real-time KPIs tracking **Total Paid Revenue**, **Today's Active Reservations**, **Active Table Count**, and **Registered Customer Base**.
* **Table Management**: Add, configure, activate, and remove dining tables across zones.
* **Menu Management**: Create menu categories and publish gourmet dishes with prices, preparation times, and dietary restrictions.

### 4. 🔒 Enterprise Security & RBAC
* **Password Security**: Native `bcrypt` salted password hashing (truncated to 72 bytes for maximum compatibility).
* **Token Management**: Dual JWT token system (Short-lived Access Token + Persistent Refresh Token) with automatic Authorization header injection.
* **Hierarchical Role Guards**: Reusable FastAPI `Depends(require_role([UserRole.ADMIN, ...]))` securing every sensitive endpoint.

---

## 📊 Database Schema (3NF Normalized)

```mermaid
erDiagram
    USERS ||--o{ RESERVATIONS : "places"
    USERS ||--o{ ORDERS : "orders"
    RESTAURANT_TABLES ||--o{ RESERVATIONS : "allocated"
    RESTAURANT_TABLES ||--o{ ORDERS : "seated_at"
    CATEGORIES ||--o{ MENU_ITEMS : "contains"
    ORDERS ||--|{ ORDER_ITEMS : "includes"
    MENU_ITEMS ||--o{ ORDER_ITEMS : "ordered_as"
    RESERVATIONS ||--o{ ORDERS : "linked_to"

    USERS {
        uuid id PK
        string email UK
        string hashed_password
        string full_name
        string role "CUSTOMER | STAFF | ADMIN"
        boolean is_active
        timestamp created_at
    }

    RESTAURANT_TABLES {
        uuid id PK
        string table_number UK
        int capacity
        string location "MAIN_HALL | TERRACE | PRIVATE_ROOM | BAR"
        string status "AVAILABLE | RESERVED | OCCUPIED"
        boolean is_active
    }

    RESERVATIONS {
        uuid id PK
        uuid customer_id FK
        uuid table_id FK
        date reservation_date
        time start_time
        time end_time
        int party_size
        string status "PENDING | CONFIRMED | SEATED | COMPLETED | CANCELLED"
        string special_requests
    }

    CATEGORIES {
        uuid id PK
        string name UK
        string slug UK
        int display_order
        boolean is_active
    }

    MENU_ITEMS {
        uuid id PK
        uuid category_id FK
        string name
        decimal price
        boolean is_vegetarian
        boolean is_gluten_free
        int preparation_time_mins
        boolean is_available
    }

    ORDERS {
        uuid id PK
        uuid customer_id FK
        uuid table_id FK
        uuid reservation_id FK
        string order_number UK
        string status "PENDING | PREPARING | READY | SERVED | PAID"
        decimal total_amount
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid menu_item_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }
```

---

## ⚡ Quickstart Guide

### Option A: 1-Command Docker Compose (Recommended)

Run the entire production stack (PostgreSQL, Backend API, Frontend App) with one command:

```bash
# Clone the repository
git clone https://github.com/your-org/savorybyte.git
cd savorybyte

# Build and start all services
docker compose up --build
```

Access the applications:
* **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
* **Backend API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Option B: Local Development Setup

#### 1. Backend Setup (FastAPI + PostgreSQL)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial database records (Users, Tables, Menu, Orders)
python scripts/seed_db.py

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (React + Vite + TypeScript)

```bash
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```

---

## 🔑 Default Test Credentials

The database seeder (`backend/scripts/seed_db.py`) creates three pre-configured accounts:

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **👑 Executive Admin** | `admin@savorybyte.com` | `AdminSecret123!` | Full System, Executive Dashboard, Table/Menu CRUD |
| **👔 Staff / Maitre D'** | `staff@savorybyte.com` | `StaffSecret123!` | Reservation Manager, Live Kitchen Display (KDS) |
| **🥂 Customer / VIP** | `customer@savorybyte.com` | `CustomerSecret123!` | Table Booking Wizard, Digital Menu, Order History |

---

## 🧪 Testing & Verification

### Backend Automated Test Suite (Pytest)
```bash
cd backend
.\venv\Scripts\pytest.exe -v
# Output: 15 passed in 5.83s (100% test pass rate)
```

### Backend Linter & Formatter (Ruff)
```bash
cd backend
.\venv\Scripts\ruff.exe check app
# Output: All checks passed!
```

### Frontend Type-Checking & Production Build
```bash
cd frontend
npm run lint
npm run build
# Output: 0 errors, 0 warnings. Built cleanly in 3.10s.
```

---

## 📁 Repository Structure

```
restaurant-reservation-system/
├── .github/
│   └── workflows/ci.yml         # Automated GitHub Actions CI pipeline
├── backend/
│   ├── alembic/                 # Async database schema migrations
│   ├── app/
│   │   ├── api/v1/              # REST API domain routers (auth, tables, reservations, menu, orders, admin)
│   │   ├── core/                # Config, async database engine, security, RBAC dependencies
│   │   ├── crud/                # Domain CRUD repositories & collision prevention logic
│   │   ├── models/              # SQLAlchemy 2.0 async ORM database entities
│   │   ├── schemas/             # Pydantic v2 request/response schemas
│   │   └── tests/               # Pytest async test suite (15 integration/unit tests)
│   ├── scripts/
│   │   └── seed_db.py           # Database seeder (Admin, Staff, Tables, Menu, Reservations)
│   ├── Dockerfile               # Production multi-stage Docker build
│   └── requirements.txt         # Pinned backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI primitives (Button, Card, Badge, Modal, Navbar, Footer)
│   │   ├── pages/
│   │   │   ├── admin/           # AdminDashboard, ManageTables, ManageMenu
│   │   │   ├── customer/        # BookTable, DigitalMenu, MyReservations, MyOrders
│   │   │   ├── public/          # Login, Register
│   │   │   └── staff/           # StaffDashboard, KitchenDisplay
│   │   ├── services/            # Typed API client with JWT bearer interceptor
│   │   ├── store/               # AuthContext & useAuth custom hooks
│   │   └── types/               # TypeScript domain interfaces matching backend models
│   ├── Dockerfile               # Frontend Nginx container
│   └── package.json             # Frontend dependencies & scripts
├── docker-compose.yml           # Multi-container orchestration
└── README.md                    # Project documentation
```

---

## 💼 Portfolio Highlights & Architecture Decisions

1. **Async-First Python Architecture**: Utilized Python 3.12+ `async/await` across all database I/O using SQLAlchemy 2.0 Async and AsyncPG, preventing thread blocking under high concurrency.
2. **Double-Booking Mathematical Guarantee**: Prevented race conditions and reservation overlaps at the database query level with interval arithmetic ($A_{\text{start}} < B_{\text{end}} \land A_{\text{end}} > B_{\text{start}}$).
3. **Lazy-Loading Mitigation**: Handled async relationship queries with explicit `selectinload` chains to eliminate `MissingGreenlet` exceptions during Pydantic schema serialization.
4. **Resilient Frontend State Management**: Integrated TanStack Query for background caching, query deduplication, and automated polling intervals (10s for Kitchen KDS, 15s for Maitre D' dashboard, 30s for Admin KPIs).
5. **Strict Type Safety**: End-to-end type parity between Pydantic v2 schemas and TypeScript interfaces with runtime Zod form validation.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
