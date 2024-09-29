import { MySqlContainer } from '@testcontainers/mysql';
import { closeConnection } from '../mysqlConnection';
import mysql from 'mysql2/promise';
import request from 'supertest';
import app from '../server.js';

async function createTables(client) {
  const createEmployeeTable = `
    CREATE TABLE IF NOT EXISTS \`Employee\` (
      \`Staff_ID\` INT PRIMARY KEY AUTO_INCREMENT,
      \`Staff_FName\` VARCHAR(50) CHARACTER SET utf8,
      \`Staff_LName\` VARCHAR(50) CHARACTER SET utf8,
      \`Dept_ID\` INT,
      \`Position\` VARCHAR(50) CHARACTER SET utf8,
      \`Country\` VARCHAR(50) CHARACTER SET utf8,
      \`Email\` VARCHAR(100) CHARACTER SET utf8,
      \`Reporting_Manager\` INT DEFAULT NULL,
      \`Role_ID\` INT
    );
  `;

  const createRoleTable = `
    CREATE TABLE IF NOT EXISTS \`Role\` (
      \`Role_ID\` INT PRIMARY KEY AUTO_INCREMENT,
      \`Role_Name\` VARCHAR(50) CHARACTER SET utf8
    );
  `;

  const createDepartmentTable = `
    CREATE TABLE IF NOT EXISTS \`Department\` (
      \`Dept_ID\` INT PRIMARY KEY AUTO_INCREMENT,
      \`Dept_Name\` VARCHAR(50) CHARACTER SET utf8
    );
  `;

  const dropEmployeeTable = `DROP TABLE IF EXISTS \`Employee\`;`;
  const dropRoleTable = `DROP TABLE IF EXISTS \`Role\`;`;
  const dropDepartmentTable = `DROP TABLE IF EXISTS \`Department\`;`;

  // Drop tables first
  await client.query(dropEmployeeTable);
  await client.query(dropRoleTable);
  await client.query(dropDepartmentTable);
  // Add data
  await client.query(createEmployeeTable);
  await client.query(createRoleTable);
  await client.query(createDepartmentTable);
}

async function insertEmployee(client, employee) {
  const sql = `
    INSERT INTO \`Employee\` 
    (\`Staff_ID\`, \`Staff_FName\`, \`Staff_LName\`, \`Dept_ID\`, \`Position\`, \`Country\`, \`Email\`, \`Reporting_Manager\`, \`Role_ID\`) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    employee.Staff_ID,
    employee.Staff_FName,
    employee.Staff_LName,
    employee.Dept_ID,
    employee.Position,
    employee.Country,
    employee.Email,
    employee.Reporting_Manager,
    employee.Role_ID,
  ];

  await client.query(sql, values);
}
async function insertRole(client, role) {
  const sql = `
    INSERT INTO \`Role\` 
    (\`Role_ID\`, \`Role_Name\`) 
    VALUES (?, ?);
  `;

  const values = [role.Role_ID, role.Role_Name];

  await client.query(sql, values);
}
async function insertDepartment(client, department) {
  const sql = `
    INSERT INTO \`Department\` 
    (\`Dept_ID\`, \`Dept_Name\`) 
    VALUES (?, ?);
  `;

  const values = [department.Dept_ID, department.Dept_Name];

  await client.query(sql, values);
}

async function queryMySQL(client, query) {
  const [results, fields] = await client.query(query);
  return results;
}

describe('Employee Endpoint', () => {
  jest.setTimeout(60000);

  let mysqlContainer;
  let mysqlClient;

  beforeAll(async () => {
    // const network = await new Network().start();
    mysqlContainer = await new MySqlContainer('mysql:8')
      .withName('test_mysql')
      .withRootPassword(process.env.MYSQL_PASSWORD)
      .withUsername(process.env.MYSQL_USERNAME)
      .withUserPassword(process.env.MYSQL_PASSWORD)
      .withDatabase(process.env.MYSQL_DB_NAME)
      .withEnvironment({
        MYSQL_ROOT_PASSWORD: process.env.MYSQL_PASSWORD,
        MYSQL_DB: process.env.MYSQL_DB_NAME,
      })
      .withExposedPorts(parseInt(process.env.MYSQL_PORT))
      // .withNetwork(network)
      .start();
    // console.log('MySQL host: ', mysqlContainer.getHost());
    // console.log('MySQL port: ', mysqlContainer.getPort());

    // Create the connection to database
    mysqlClient = await mysql.createConnection({
      host: mysqlContainer.getHost(),
      database: process.env.MYSQL_DB_NAME,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      port: mysqlContainer.getPort(),
    });
    // Change the port based on Docker
    process.env.MYSQL_PORT = mysqlContainer.getPort();
  });

  beforeEach(async () => {
    // Recreate the various tables for each test in the test suite
    await createTables(mysqlClient);
  });

  afterAll(async () => {
    await closeConnection();
    await mysqlClient.end();
    await mysqlContainer.stop();
  });

  it('Get All (With Employee)', async () => {
    let newEmployee = {
      Staff_ID: 130000,
      Staff_FName: 'Alice',
      Staff_LName: 'Johnson',
      Dept_ID: 2,
      Position: 'Developer',
      Country: 'Singapore',
      Email: 'alice.johnson@allinone.com.sg',
      Reporting_Manager: 130002,
      Role_ID: 1,
    };
    await insertEmployee(mysqlClient, newEmployee);
    await insertDepartment(mysqlClient, { Dept_ID: 2, Dept_Name: 'Test Dept Name' });
    await insertRole(mysqlClient, { Role_ID: 1, Role_Name: 'Test Role Name' });

    const response = await request(app).get('/employee/all');

    expect(response.status).toBe(200);
    expect(response.body.results).toEqual(expect.arrayContaining([newEmployee]));
  });

  it('Login Valid User', async () => {
    let newEmployee = {
      Staff_ID: 130000,
      Staff_FName: 'Alice',
      Staff_LName: 'Johnson',
      Dept_ID: 2,
      Position: 'Developer',
      Country: 'Singapore',
      Email: 'alice.johnson@allinone.com.sg',
      Reporting_Manager: 130002,
      Role_ID: 1,
    };
    await insertEmployee(mysqlClient, newEmployee);
    await insertDepartment(mysqlClient, { Dept_ID: 2, Dept_Name: 'Test Dept Name' });
    await insertRole(mysqlClient, { Role_ID: 1, Role_Name: 'Test Role Name' });

    // let selres = await queryMySQL(mysqlClient, 'Select * from Employee');
    // console.log(selres);
    // selres = await queryMySQL(mysqlClient, 'Select * from Department');
    // console.log(selres);
    // selres = await queryMySQL(mysqlClient, 'Select * from Role');
    // console.log(selres);

    const response = await request(app)
      .get('/employee/login')
      .query({ staffID: newEmployee['Staff_ID'] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining(newEmployee));
  });

  it('Login Invalid User', async () => {
    const response = await request(app).get('/employee/login').query({ staffID: 1 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual(expect.objectContaining({ error: true }));
  });
});
