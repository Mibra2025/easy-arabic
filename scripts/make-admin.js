const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_xsu3wHM4aboY@ep-plain-mountain-agopdv9p-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function makeUserAdmin() {
  try {
    const email = 'Mibra2025@yahoo.com'; // Your email
    
    // Update user role to admin (role_id = 1)
    const result = await query(
      'UPDATE users SET role_id = 1, updated_at = CURRENT_TIMESTAMP WHERE email = $1 RETURNING id, name, email',
      [email]
    );

    if (result.rows.length > 0) {
      console.log(`Successfully updated user ${result.rows[0].name} (${result.rows[0].email}) to admin role`);
    } else {
      console.log(`User with email ${email} not found`);
    }

    // Verify the update
    const verifyResult = await query(`
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `, [email]);

    console.log('Updated user info:', verifyResult.rows[0]);
    
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await pool.end();
  }
}

makeUserAdmin().catch(console.error);
