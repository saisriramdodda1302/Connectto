import pg from "pg";
import env from "dotenv";

env.config();

//neon(and Render Postgres)require SSL.
const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool(
  connectionString
    ? {
        connectionString,
        ssl: { rejectUnauthorized: false }, // required by Neon
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
    : {
        // local development fallback
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
        max: 10,
      }
);
//'error' event, which terminates the process.
pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client:", err.message);
});

export default pool;