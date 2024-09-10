import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  // Create the connection to database
  const connection = await mysql.createConnection({
    host: process.env.RDS_MYSQL_HOST,
    database: process.env.RDS_MYSQL_DB_NAME,
    user: process.env.RDS_MYSQL_USERNAME,
    password: process.env.RDS_MYSQL_PASSWORD,
  });

  // A simple SELECT query
  try {
    const [results, fields] = await connection.query("SELECT * FROM `Employee`");

    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
  } catch (err) {
    console.log(err);
  }

  //   // Using placeholders
  //   try {
  //     const [results] = await connection.query("SELECT * FROM `table` WHERE `name` = ? AND `age` > ?", ["Page", 45]);

  //     console.log(results);
  //   } catch (err) {
  //     console.log(err);
  //   }
}

main();
