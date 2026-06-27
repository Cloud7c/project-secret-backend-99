import bcrypt from 'bcrypt';
import pool from './src/db.js';

const createAdmin = async () => {
    try {
        console.log('Adding is_admin column to users table if it does not exist...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
        `);

        const email = 'admin@zimautoagri.co.zw';
        const password = 'AdminPassword123!';
        
        console.log(`Checking if admin user ${email} exists...`);
        const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (existing.rows.length > 0) {
            console.log('Admin user already exists. Updating to ensure is_admin is true.');
            const password_hash = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE users SET is_admin = TRUE, password_hash = $1 WHERE email = $2',
                [password_hash, email]
            );
            console.log('Admin user updated successfully.');
        } else {
            console.log('Creating new admin user...');
            const password_hash = await bcrypt.hash(password, 10);
            
            await pool.query(
                `INSERT INTO users (full_name, email, password_hash, is_admin, is_verified) 
                 VALUES ($1, $2, $3, $4, $5)`,
                ['System Administrator', email, password_hash, true, true]
            );
            console.log('Admin user created successfully.');
        }
        
        console.log('\\n--- ADMIN CREDENTIALS ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-------------------------\\n');
        
    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        pool.end();
    }
};

createAdmin();
