import mysql from 'mysql2/promise';

let connection = null;

async function initializeConnection() {
  if (!connection || connection.connection.state === 'disconnected') {
    try {
      connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DB_NAME,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT,
      });

      // Handle connection errors and reconnection
      connection.on('error', async (err) => {
        console.error('MySQL Connection Error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          connection = null;
          await initializeConnection();
        } else {
          throw err;
        }
      });
    } catch (err) {
      console.error('Database connection error:', err);
      throw err; // Propagate error
    }
  }
  return connection;
}

const executeQuery = async (query) => {
  const conn = await initializeConnection();
  if (!conn) {
    console.error('Connection is null! Aborting executeQuery().');
    return [];
  }
  try {
    const [results, fields] = await conn.query(query);
    return [results, fields];
  } catch (err) {
    console.error('Query Error:', err);
    throw err; // Propagate error
  }
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
