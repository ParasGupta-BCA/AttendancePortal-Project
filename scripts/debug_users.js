const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        await client.connect();

        console.log("--- Debugging Users and Students ---");

        // 1. Count users with role 'student'
        const resRole = await client.query("SELECT count(*) FROM users WHERE role = 'student'");
        console.log(`Users with role='student': ${resRole.rows[0].count}`);

        // 2. Count students in students table
        const resStudents = await client.query("SELECT count(*) FROM students");
        console.log(`Rows in students table: ${resStudents.rows[0].count}`);

        // 3. Count intersection
        const resJoin = await client.query("SELECT count(*) FROM users u JOIN students s ON u.id = s.user_id");
        console.log(`Users joined with Students: ${resJoin.rows[0].count}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}
main();
