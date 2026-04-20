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
