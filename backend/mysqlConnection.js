import mysql from 'mysql2/promise';

let connection = null;

async function initializeConnection() {
  if (!connection) {
    try {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DB_NAME,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT,
      });
    } catch (err) {
      console.error('Database connection error:', err);
    }
  }
  return connection;
}

const executeQuery = async (query) => {
  const conn = await initializeConnection();
  if (!conn) {
    console.log('Connection is null! Aborting executeQuery().');
    return [];
  }
  try {
    const [results, fields] = await conn.query(query);
    return [results, fields];
  } catch (err) {
    console.error(err);
  }
  return [];
};

// Close the connection gracefully
const closeConnection = async () => {
  if (connection) {
    await connection.end();
    connection = null; // Reset connection for future requests
    console.log('Database connection closed.');
  }
};

export { executeQuery, closeConnection };
