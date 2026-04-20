# Jall Ride Booking

Full-stack ride booking system with an Express/PostgreSQL API, a Flutter mobile client, and GitHub Actions CI/CD.

## Architecture

```text
Flutter App (http + Provider)
        |
        v
Express REST API (port 5009, JWT auth)
        |
        v
PostgreSQL 15 (users, cars, bookings)
```

CI/CD runs the backend test suite in GitHub Actions, seeds PostgreSQL from `jall-api/src/db/schema.sql`, then deploys to EC2 and restarts the API with PM2.

## API Endpoints

| Method | Path         | Auth | Description              |
|--------|--------------|------|--------------------------|
| POST   | /auth/login  | No   | Login and return a JWT   |
| GET    | /cars        | No   | List available cars      |
| POST   | /bookings    | JWT  | Create a booking         |
| GET    | /bookings    | JWT  | List the user's bookings |

Authentication uses `Authorization: Bearer <token>`.

## Local Setup

### Prerequisites

- Node.js 20+
- Docker Desktop with Docker Compose
- Flutter 3.x SDK

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure and run the API

```bash
cd jall-api
npm install
npm run db:migrate
npm run dev
```

The API listens on `http://localhost:5009`.

### 3. Run backend tests

```bash
cd jall-api
npm test
```

### 4. Run the Flutter app

```bash
cd jall-flutter
flutter pub get
flutter run
```

The Flutter client defaults to `http://10.0.2.2:5009`, which is the Android emulator loopback to your host machine. Override it for other targets with `--dart-define=JALL_API_BASE_URL=http://localhost:5009` or your machine's LAN IP.

## GitHub Secrets Required for CI/CD

| Secret      | Description                          |
|-------------|--------------------------------------|
| EC2_HOST    | EC2 public IP or hostname            |
| EC2_USER    | SSH username such as `ubuntu`        |
| EC2_KEY     | Private SSH key in PEM format        |
| JWT_SECRET  | Production JWT secret                |

## Default Test Credentials

Email: `test@jall.com`  
Password: `password123`

---

## Admin Dashboard

Professional admin panel for managing rides, drivers, and fleet. Built with React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui.

### Architecture

```text
React Admin (S3 + CloudFront)
        |
        v
Express REST API (EC2 port 5009, JWT auth)
        |
        v
PostgreSQL 15 (users, cars, bookings, drivers)
```

### Live URL

Configure the CloudFront distribution URL here after deployment.

### Screens

| Screen   | Route       | Description                              |
|----------|-------------|------------------------------------------|
| Login    | /login      | JWT auth with admin credentials          |
| Overview | /           | Stats cards, bookings-per-day chart, recent bookings table |
| Bookings | /bookings   | Full table, search, status filter tabs, optimistic driver assignment + status update |
| Fleet    | /fleet      | All vehicles, color/seats, toggle availability |

### Running the Admin Locally

```bash
cd jall-admin
cp .env.example .env.local   # set VITE_API_URL=http://localhost:5009
npm install
npm run dev
# Visit http://localhost:5173
# Login: admin@jall.com / admin123
```

### GitHub Secrets for CI/CD (admin frontend)

| Secret                | Description                              |
|-----------------------|------------------------------------------|
| VITE_API_URL          | Production API URL                       |
| AWS_ACCESS_KEY_ID     | IAM key with S3 + CloudFront permissions |
| AWS_SECRET_ACCESS_KEY | IAM secret                               |
| AWS_REGION            | AWS region (e.g. eu-north-1)             |
| S3_BUCKET             | S3 bucket name                           |
| CF_DISTRIBUTION_ID    | CloudFront distribution ID               |

### Seed Data (demo)

```bash
cd jall-api
npm run seed
# Creates admin user, 4 drivers, 6 luxury cars, 15 Saudi bookings
```
