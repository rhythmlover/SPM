import mysql from "mysql2/promise";

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
  if (!connection) [console.log("Connection is null! Aborting executeQuery().")];
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

// async function main() {
//   // A simple SELECT query
//   try {
//     // Create the connection to database
//     const connection = await mysql.createConnection({
//       host: process.env.RDS_MYSQL_HOST,
//       database: process.env.RDS_MYSQL_DB_NAME,
//       user: process.env.RDS_MYSQL_USERNAME,
//       password: process.env.RDS_MYSQL_PASSWORD,
//       port: process.env.RDS_MYSQL_PORT,
//     });

//     const [results, fields] = await connection.query("SELECT * FROM `Employee`");

//     console.log(results); // results contains rows returned by server
//     console.log(fields); // fields contains extra meta data about results, if available
//   } catch (err) {
//     console.log(err);
//   }

//   //   // Using placeholders
//   //   try {
//   //     const [results] = await connection.query("SELECT * FROM `table` WHERE `name` = ? AND `age` > ?", ["Page", 45]);

//   //     console.log(results);
//   //   } catch (err) {
//   //     console.log(err);
//   //   }
// }
