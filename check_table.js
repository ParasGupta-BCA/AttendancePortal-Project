const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function checkTable() {
    try {
        await client.connect();
        const res = await client.query("SELECT to_regclass('public.student_requests');");
        console.log('Table exists:', res.rows[0].to_regclass);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkTable();
