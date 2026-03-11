import { Pool } from 'pg';

// We use the environment variable that Vercel generated with your custom prefix
// e.g., SUPABASE_POSTGRES_URL_NON_POOLING or however Vercel named it.
// We'll fall back to a standard SUPABASE_DATABASE_URL if you define it manually in .env.local

const connectionString = 
  process.env.SUPABASE_POSTGRES_URL_NON_POOLING || 
  process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  console.error("Missing Supabase Database URL environment variable. Check Vercel settings.");
}

const pool = new Pool({
  connectionString: connectionString,
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
