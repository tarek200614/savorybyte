# 🍽️ SavoryByte — Production Restaurant Reservation & Management System

[![CI Pipeline](https://github.com/your-org/savorybyte/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/savorybyte/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18.0+-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com/)

**SavoryByte** is a enterprise-ready SaaS application designed for modern restaurant operations. It features real-time table management, customer reservation scheduling, food ordering, staff kitchen display systems (KDS), and executive revenue analytics.

---

## 🏗️ Architecture & Technology Stack

```
                                  +---------------------------------------+
                                  |         React 18 + TypeScript        |
                                  |    Vite + Tailwind CSS + TanStack     |
                                  +-------------------+-------------------+
                                                      |
                                                 REST / JSON
                                                (JWT Bearer)
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |          FastAPI App (Python)         |
                                  |  Clean Layered Architecture + Async   |
                                  +-------------------+-------------------+
                                                      |
                                              SQLAlchemy 2.0
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |       PostgreSQL 16 Database          |
                                  +---------------------------------------+
```

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Custom Dark/Luxury Theme)
- **State & Data Fetching:** TanStack Query (React Query) v5
- **Form Handling:** React Hook Form + Zod schema validation
- **Routing:** React Router v6

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM & DB:** SQLAlchemy 2.0 (Async engine) + Alembic migrations + PostgreSQL 16
- **Validation:** Pydantic v2
- **Authentication:** JWT (Short-lived access tokens + HttpOnly refresh cookies) & Bcrypt
- **Testing & Quality:** Pytest, Ruff, Black, isort

### DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions

---

## ⚡ Quick Start (Docker Development Environment)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24.0+)
- [Git](https://git-scm.com/)

### Running locally with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/savorybyte.git
   cd savorybyte
   ```

2. **Setup environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Start services:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - **Frontend App:** [http://localhost:5173](http://localhost:5173)
   - **FastAPI Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health Check Endpoint:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 Testing & Code Quality

### Backend (Python)
```bash
# Run tests
docker-compose exec backend pytest

# Check linting & formatting
docker-compose exec backend ruff check .
docker-compose exec backend black --check .
```

### Frontend (TypeScript)
```bash
# Type check & lint
docker-compose exec frontend npm run lint
docker-compose exec frontend npm run build
```

---

## 📂 Project Structure

See detailed architecture documentation in [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
