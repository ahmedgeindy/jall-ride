const fs = require('fs');
const path = require('path');

require('dotenv').config();

const pool = require('../src/config/db');

async function main() {
  const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(sql);
    console.log(`Applied schema from ${schemaPath}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed to apply schema');
  console.error(err);
  process.exit(1);
});
