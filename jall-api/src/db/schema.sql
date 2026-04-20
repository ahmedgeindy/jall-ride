CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  make VARCHAR(80) NOT NULL,
  model VARCHAR(80) NOT NULL,
  plate VARCHAR(20) UNIQUE NOT NULL,
  seats INT NOT NULL DEFAULT 4,
  available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  ride_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO users (name, email, password) VALUES
  ('Test User', 'test@jall.com', '$2b$10$GMZ5mnaa/ldMTkV2/gU1AuDEPeTqubbpDMa/KQiWfFwTGeBhnSN.m')
ON CONFLICT DO NOTHING;

INSERT INTO cars (make, model, plate, seats, available) VALUES
  ('Toyota', 'Corolla', 'ABC-001', 4, TRUE),
  ('Honda', 'Civic', 'ABC-002', 4, TRUE),
  ('Hyundai', 'Elantra', 'ABC-003', 5, TRUE)
ON CONFLICT DO NOTHING;

-- ── Admin Dashboard Migration ──────────────────────────────────────────────

-- Users: add role column
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Cars: add color column
ALTER TABLE cars ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  phone       VARCHAR(20),
  available   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- Bookings: add status, price, driver reference
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status    VARCHAR(20)     NOT NULL DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price     NUMERIC(10,2)   NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS driver_id INT REFERENCES drivers(id) ON DELETE SET NULL;
