require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl:      { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,  // Railway needs up to 30s to wake
    idleTimeoutMillis:       60000,  // keep connections alive longer
    max:                     3,
    allowExitOnIdle:         false,
});

pool.on("error", (err) => {
    console.error("PostgreSQL pool error:", err.message);
});

// Retry startup connection up to 5 times — Railway can be slow to wake
async function connectWithRetry(attempts = 5, delay = 3000) {
    for (let i = 1; i <= attempts; i++) {
        try {
            const client = await pool.connect();
            console.log("✅ Connected to PostgreSQL database");
            client.release();
            return;
        } catch (err) {
            console.log(`⏳ DB connection attempt ${i}/${attempts} failed: ${err.message}`);
            if (i < attempts) await new Promise(r => setTimeout(r, delay));
        }
    }
    console.error("❌ Could not connect to PostgreSQL after", attempts, "attempts");
}

connectWithRetry();

// Retry wrapper for dropped connections mid-request
const RETRYABLE = [
    "Connection terminated",
    "ECONNRESET",
    "timeout exceeded",
    "connection timeout",
    "Client was closed",
];

async function retryQuery(text, params) {
    try {
        return await pool.query(text, params);
    } catch (err) {
        const shouldRetry = RETRYABLE.some(msg => err.message.includes(msg));
        if (shouldRetry) {
            console.log("🔄 Retrying query after connection drop...");
            await new Promise(r => setTimeout(r, 1000));
            return await pool.query(text, params);
        }
        throw err;
    }
}

const proxy = new Proxy(pool, {
    get(target, prop) {
        if (prop === "query") return retryQuery;
        const val = target[prop];
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = proxy;