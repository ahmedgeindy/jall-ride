require('dotenv').config();
const { Pool }  = require('pg');
const bcrypt    = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM bookings');
    await client.query('DELETE FROM drivers');
    await client.query("DELETE FROM cars WHERE plate LIKE 'LX%'");
    await client.query("DELETE FROM users WHERE email LIKE '%-seed@jall.com' OR email = 'admin@jall.com'");

    const adminHash = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ('Admin', 'admin@jall.com', $1, 'admin')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', password = $1`,
      [adminHash]
    );

    const clientData = [
      { name: 'Ahmed Al-Qahtani',      email: 'ahmed-seed@jall.com' },
      { name: 'Mohammed Al-Otaibi',    email: 'mohammed-seed@jall.com' },
      { name: 'Khalid Al-Ghamdi',      email: 'khalid-seed@jall.com' },
      { name: 'Faisal Al-Harbi',       email: 'faisal-seed@jall.com' },
      { name: 'Omar Al-Shehri',        email: 'omar-seed@jall.com' },
    ];
    const clientHash = await bcrypt.hash('client123', 10);
    const clientIds  = [];
    for (const c of clientData) {
      const r = await client.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET name = $1
         RETURNING id`,
        [c.name, c.email, clientHash]
      );
      clientIds.push(r.rows[0].id);
    }

    const driverData = [
      { name: 'Mohammed Al-Omari',  phone: '+966-55-1001001' },
      { name: 'Abdullah Al-Saeed',  phone: '+966-55-2002002' },
      { name: 'Khaled Al-Harbi',    phone: '+966-55-3003003' },
      { name: 'Saad Al-Shahrani',   phone: '+966-55-4004004' },
    ];
    const driverIds = [];
    for (const d of driverData) {
      const r = await client.query(
        'INSERT INTO drivers (name, phone) VALUES ($1, $2) RETURNING id',
        [d.name, d.phone]
      );
      driverIds.push(r.rows[0].id);
    }

    const carData = [
      { make: 'Mercedes',    model: 'S-Class',      plate: 'LXS-001', seats: 4, color: 'Black',          available: true  },
      { make: 'BMW',         model: '7 Series',     plate: 'LXS-002', seats: 4, color: 'Silver',         available: true  },
      { make: 'Lexus',       model: 'LX 600',       plate: 'LXS-003', seats: 7, color: 'White',          available: false },
      { make: 'Cadillac',    model: 'Escalade',      plate: 'LXS-004', seats: 7, color: 'Black',          available: true  },
      { make: 'Range Rover', model: 'Autobiography', plate: 'LXS-005', seats: 5, color: 'Midnight Blue',  available: false },
      { make: 'Mercedes',    model: 'V-Class',       plate: 'LXS-006', seats: 7, color: 'Pearl White',    available: true  },
    ];
    const carIds = [];
    for (const c of carData) {
      const r = await client.query(
        `INSERT INTO cars (make, model, plate, seats, color, available)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (plate) DO UPDATE SET color = $5, available = $6
         RETURNING id`,
        [c.make, c.model, c.plate, c.seats, c.color, c.available]
      );
      carIds.push(r.rows[0].id);
    }

    const locations = [
      'King Fahd Road, Riyadh',
      'KAIA Airport, Terminal 1',
      'Riyadh Park Mall',
      'King Abdullah Financial District',
      'Al Olaya District, Riyadh',
      'Diplomatic Quarter',
      'Kingdom Centre Tower',
      'Granada Mall, Riyadh',
      'Al Nakheel Mall',
      'Tahlia Street, Riyadh',
    ];
    const statuses = ['pending', 'active', 'completed', 'completed', 'cancelled'];
    const prices   = [180, 320, 450, 275, 600, 155, 800, 390, 210, 520, 340, 700, 490, 165, 580];

    for (let i = 0; i < 15; i++) {
      const offsetDays = (i % 7) + 1;
      const rideDate   = new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      await client.query(
        `INSERT INTO bookings (user_id, car_id, pickup_location, destination, ride_date, status, price, driver_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          clientIds[i % clientIds.length],
          carIds[i % carIds.length],
          locations[i % locations.length],
          locations[(i + 4) % locations.length],
          rideDate,
          statuses[i % statuses.length],
          prices[i],
          i % 3 === 0 ? null : driverIds[i % driverIds.length],
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed complete');
    console.log('   Admin login: admin@jall.com / admin123');
    console.log(`   ${driverIds.length} drivers | ${carIds.length} luxury cars | 15 bookings`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
