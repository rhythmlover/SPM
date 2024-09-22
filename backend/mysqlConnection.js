import mysql from 'mysql2/promise';

var connection = null;
try {
  // Create the connection to database
  connection = await mysql.createConnection({
    host: process.env.RDS_MYSQL_HOST,
    database: process.env.RDS_MYSQL_DB_NAME,
    user: process.env.RDS_MYSQL_USERNAME,
    password: process.env.RDS_MYSQL_PASSWORD,
    port: process.env.RDS_MYSQL_PORT,
  });
} catch (err) {
  console.log(err);
}

const executeQuery = async (query) => {
  if (!connection) [console.log('Connection is null! Aborting executeQuery().')];
  try {
    const [results, fields] = await connection.query(query);

    // console.log(results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available

    return [results, fields];
  } catch (err) {
    console.error(err);
  }

  return [];
};

export { executeQuery };
