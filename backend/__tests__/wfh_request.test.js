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

  const createWFHRequestTable = `
    CREATE TABLE IF NOT EXISTS \`WFH_Request\` (
        \`Request_ID\` INT PRIMARY KEY AUTO_INCREMENT,
        \`Staff_ID\` INT,
        \`Request_Date\` DATE,
        \`Request_Period\` VARCHAR(5),
        \`Request_Reason\` TEXT CHARACTER SET utf8,
        \`Status\` VARCHAR(20) CHARACTER SET utf8,
        \`Approver_ID\` INT NULL,
        \`Comments\` TEXT CHARACTER SET utf8 NULL,
        \`WFH_Date\` DATE,
        \`Decision_Date\` DATE NULL,
        \`Recurring_Request_ID\` INT NULL
    );
  `;

  const createWFHRequestRecurringTable = `
    CREATE TABLE IF NOT EXISTS \`WFH_Request_Recurring\` (
        \`Request_ID\` INT PRIMARY KEY AUTO_INCREMENT,
        \`Staff_ID\` INT,
        \`WFH_Date_Start\` DATE,
        \`WFH_Date_End\` DATE,
        \`WFH_Day\` VARCHAR(10),
        \`Request_Period\` VARCHAR(10),
        \`Request_Date\` DATE, 
        \`Request_Reason\` VARCHAR(225),
        \`Status\` VARCHAR(20), 
        \`Approver_ID\` INT,
        \`Comments\` TEXT,
        \`Decision_Date\` DATE
    );
  `;

  const createWFHRequestWithdrawalTable = `
  CREATE TABLE IF NOT EXISTS \`WFH_Withdrawal\` (
      \`Withdrawal_ID\` INT PRIMARY KEY AUTO_INCREMENT,
      \`Request_ID\` INT,
      \`Staff_Name\` VARCHAR(50),
      \`Staff_Position\` VARCHAR(50),
      \`Request_Period\` VARCHAR(50),
      \`Request_Reason\` TEXT,
      \`Status\` VARCHAR(20),
      \`Approver_Name\` VARCHAR(50),
      \`WFH_Date\` VARCHAR(50), 
      \`Comments\` VARCHAR(45)
  );
`;

  const dropEmployeeTable = `DROP TABLE IF EXISTS \`Employee\`;`;
  const dropRoleTable = `DROP TABLE IF EXISTS \`Role\`;`;
  const dropDepartmentTable = `DROP TABLE IF EXISTS \`Department\`;`;
  const dropWFHRequestTable = `DROP TABLE IF EXISTS \`WFH_Request\`;`;
  const dropWFHRequestRecurringTable = `DROP TABLE IF EXISTS \`WFH_Request_Recurring\`;`;
  const dropWFHWithdrawalTable = `DROP TABLE IF EXISTS \`WFH_Withdrawal\`;`;

  // Drop tables first
  await client.query(dropEmployeeTable);
  await client.query(dropRoleTable);
  await client.query(dropDepartmentTable);
  await client.query(dropWFHRequestTable);
  await client.query(dropWFHRequestRecurringTable);
  await client.query(dropWFHWithdrawalTable);
  // Add data
  await client.query(createEmployeeTable);
  await client.query(createRoleTable);
  await client.query(createDepartmentTable);
  await client.query(createWFHRequestTable);
  await client.query(createWFHRequestRecurringTable);
  await client.query(createWFHRequestWithdrawalTable);
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

async function insertWFHRequest(client, request) {
  const sql = `
    INSERT INTO \`WFH_Request\` 
    (\`Request_ID\`, \`Staff_ID\`, \`Request_Date\`, \`Request_Period\`, \`Request_Reason\`, 
    \`Status\`, \`Approver_ID\`, \`Comments\`, \`WFH_Date\`, \`Decision_Date\`, \`Recurring_Request_ID\`) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    request.Request_ID,
    request.Staff_ID,
    request.Request_Date,
    request.Request_Period,
    request.Request_Reason,
    request.Status,
    request.Approver_ID,
    request.Comments,
    request.WFH_Date,
    request.Decision_Date,
    request.Recurring_Request_ID,
  ];

  await client.query(sql, values);
}

async function insertWFHRequestRecurring(client, recurringRequest) {
  const sql = `
    INSERT INTO \`WFH_Request_Recurring\` 
    (\`Request_ID\`, \`Staff_ID\`, \`WFH_Date_Start\`, \`WFH_Date_End\`, \`WFH_Day\`, 
    \`Request_Period\`, \`Request_Date\`, \`Request_Reason\`, \`Status\`, 
    \`Approver_ID\`, \`Comments\`, \`Decision_Date\`) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    recurringRequest.Request_ID,
    recurringRequest.Staff_ID,
    recurringRequest.WFH_Date_Start,
    recurringRequest.WFH_Date_End,
    recurringRequest.WFH_Day,
    recurringRequest.Request_Period,
    recurringRequest.Request_Date,
    recurringRequest.Request_Reason,
    recurringRequest.Status,
    recurringRequest.Approver_ID,
    recurringRequest.Comments,
    recurringRequest.Decision_Date,
  ];

  await client.query(sql, values);
}

async function insertWFHWithdrawal(client, withdrawal) {
  const sql = `
    INSERT INTO \`WFH_Withdrawal\` 
    (\`Withdrawal_ID\`, \`Request_ID\`, \`Staff_Name\`, \`Staff_Position\`, \`Request_Period\`, 
    \`Request_Reason\`, \`Status\`, \`Approver_Name\`, \`WFH_Date\`, \`Comments\`) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    withdrawal.Withdrawal_ID,
    withdrawal.Request_ID,
    withdrawal.Staff_Name,
    withdrawal.Staff_Position,
    withdrawal.Request_Period,
    withdrawal.Request_Reason,
    withdrawal.Status,
    withdrawal.Approver_Name,
    withdrawal.WFH_Date,
    withdrawal.Comments,
  ];

  await client.query(sql, values);
}

describe('WFH Endpoint', () => {
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
      .start();

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

  it('Test', async () => {
    expect(1 + 1).toBe(2);
  });
});
