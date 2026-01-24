import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  let connection;
  
  try {
    // Get password and remove quotes if present
    let password = process.env.DB_PASSWORD || '';
    if (password.startsWith('"') && password.endsWith('"')) {
      password = password.slice(1, -1);
    }
    if (password.startsWith("'") && password.endsWith("'")) {
      password = password.slice(1, -1);
    }

    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: password,
    });

    console.log('📦 Reading schema file...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Remove comments and split by semicolons
    const statements = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('delimiter'));

    console.log(`📝 Found ${statements.length} SQL statements`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0 && !statement.toLowerCase().includes('delimiter')) {
        try {
          await connection.query(statement);
          successCount++;
          if (i < 10 || i % 10 === 0) {
            console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
          }
        } catch (err) {
          // Ignore "already exists" errors
          if (err.code === 'ER_DB_CREATE_EXISTS' || 
              err.code === 'ER_TABLE_EXISTS_ERROR' ||
              err.code === 'ER_DUP_ENTRY' ||
              err.message.includes('already exists')) {
            skipCount++;
          } else {
            errorCount++;
            console.error(`❌ Error in statement ${i + 1}:`, err.message);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }

    console.log('\n📊 Execution Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    console.log('\n✅ Database initialization complete!');
    
    // Verify tables
    await connection.query('USE farm2market');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n📊 Database contains ${tables.length} tables:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
    });

    if (tables.length === 0) {
      console.warn('\n⚠️  WARNING: No tables found! Please check the schema file.');
    }

  } catch (err) {
    console.error('\n❌ Database initialization failed:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Check your MySQL credentials in .env file');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   → Make sure MySQL server is running');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
