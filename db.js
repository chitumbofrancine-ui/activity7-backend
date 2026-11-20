const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to your .env file or your hosting settings.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Prevents an idle connection drop from crashing the server.
pool.on("error", error => {
  console.error("Unexpected database error:", error.message);
});

module.exports = pool;
