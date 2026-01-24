import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Get password and remove quotes if present
let password = process.env.DB_PASSWORD || '';
if (password.startsWith('"') && password.endsWith('"')) {
  password = password.slice(1, -1);
}
if (password.startsWith("'") && password.endsWith("'")) {
  password = password.slice(1, -1);
}

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: password,
  database: process.env.DB_NAME || 'farm2market',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection and verify database
pool.getConnection()
  .then(async (connection) => {
    console.log('✅ MySQL connected successfully');
    
    // Verify database exists
    try {
      const [databases] = await connection.query('SHOW DATABASES LIKE ?', [process.env.DB_NAME || 'farm2market']);
      if (databases.length === 0) {
        console.warn('⚠️  WARNING: Database does not exist! Run: npm run init-db');
      } else {
        // Check tables
        await connection.query(`USE ${process.env.DB_NAME || 'farm2market'}`);
        const [tables] = await connection.query('SHOW TABLES');
        if (tables.length === 0) {
          console.warn('⚠️  WARNING: No tables found! Run: npm run init-db');
        } else {
          console.log(`📊 Database has ${tables.length} tables`);
        }
      }
    } catch (err) {
      console.warn('⚠️  Could not verify database:', err.message);
    }
    
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Check your MySQL credentials in .env file');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   → Make sure MySQL server is running');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('   → Database does not exist. Run: npm run init-db');
    }
  });

export default pool;
