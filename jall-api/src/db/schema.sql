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
  ('Test User', 'test@jall.com', '$2b$10$KIX8Jm5LMrz0Y6K9FvKkCOxHd4YJnSFUuqoVXJXvqDfKK4LKMHXmG')
ON CONFLICT DO NOTHING;

INSERT INTO cars (make, model, plate, seats, available) VALUES
  ('Toyota', 'Corolla', 'ABC-001', 4, TRUE),
  ('Honda', 'Civic', 'ABC-002', 4, TRUE),
  ('Hyundai', 'Elantra', 'ABC-003', 5, TRUE)
ON CONFLICT DO NOTHING;
