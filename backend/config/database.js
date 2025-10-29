import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Configuration DB analysée:');
console.log('   Host:', process.env.DB_HOST);
console.log('   User:', process.env.DB_USER);
console.log('   Database:', process.env.DB_NAME);
console.log('   Port:', process.env.DB_PORT);
console.log('   Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'non définie');

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'univ_mongo_app',
  password: process.env.DB_PASSWORD || 'azerty',
  database: process.env.DB_NAME || 'universite_mongo',
  port: parseInt(process.env.DB_PORT) || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  allowPublicKeyRetrieval: true,
  connectTimeout: 10000,
  charset: 'utf8mb4'
};

console.log('⚙️  Configuration pool créée');

const pool = mariadb.createPool(poolConfig);

export const testConnection = async () => {
  let conn;
  try {
    console.log('🔌 Tentative de connexion MariaDB...');
    conn = await pool.getConnection();
    console.log('✅ Connexion MariaDB réussie!');
    
    // Test plusieurs requêtes
    const version = await conn.query('SELECT VERSION() as version');
    console.log('📊 Version:', version[0].version);
    
    const tables = await conn.query('SHOW TABLES');
    console.log('🗂️  Tables disponibles:', tables.length);
    
    return true;
  } catch (err) {
    console.error('❌ Erreur détaillée de connexion:');
    console.error('   Message:', err.message);
    console.error('   Code:', err.code);
    console.error('   Errno:', err.errno);
    console.error('   SQL State:', err.sqlState);
    console.error('   Stack:', err.stack);
    return false;
  } finally {
    if (conn) {
      console.log('🔓 Connexion libérée');
      conn.release();
    }
  }
};

export default pool;