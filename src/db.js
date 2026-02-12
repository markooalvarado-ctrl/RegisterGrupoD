const sql = require("mssql");

let pool;

/**
 * Crea/retorna un pool compartido
 */
async function getPool() {
  if (pool) return pool;

  const {
    DB_SERVER,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASS,
    DB_ENCRYPT,
    DB_TRUST_SERVER_CERT,
  } = process.env;

  const config = {
    server: DB_SERVER,
    port: DB_PORT ? parseInt(DB_PORT, 10) : 1433,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS,
    options: {
      encrypt: String(DB_ENCRYPT).toLowerCase() === "true",
      trustServerCertificate: String(DB_TRUST_SERVER_CERT).toLowerCase() === "true",
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  pool = await sql.connect(config);
  return pool;
}

module.exports = { sql, getPool };
