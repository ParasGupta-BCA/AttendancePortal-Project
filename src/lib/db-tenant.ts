import { Pool } from 'pg';

// We use the environment variable that Vercel generated with your custom prefix
// e.g., SUPABASE_POSTGRES_URL_NON_POOLING or however Vercel named it.
// We'll fall back to a standard SUPABASE_DATABASE_URL if you define it manually in .env.local

let connectionString = 
  process.env.SUPABASE__POSTGRES_URL_NON_POOLING || 
  process.env.SUPABASE_POSTGRES_URL_NON_POOLING || 
  process.env.SUPABASE_DATABASE_URL;

if (connectionString) {
  // Strip out sslmode from connection string 
  // so that pg doesn't get confused and override our explicit ssl config below
  connectionString = connectionString.replace(/([?&])sslmode=[^&]+/g, '');
  if (connectionString.endsWith('?')) {
     connectionString = connectionString.slice(0, -1);
  }
} else {
  console.error("Missing Supabase Database URL environment variable. Check Vercel settings.");
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
});

export default pool;

// Export a robust query wrapper exactly like the original Neon one
export const tenantQuery = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Uncomment for debugging
    // console.log('executed TENANT query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('TENANT QUERY ERROR:', text, params, error);
    throw error;
  }
};
