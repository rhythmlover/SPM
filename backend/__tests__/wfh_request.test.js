import { MySqlContainer } from '@testcontainers/mysql';
import { closeConnection } from '../mysqlConnection';
import mysql from 'mysql2/promise';
import request from 'supertest';
import app from '../server.js';
import dotenv from 'dotenv';

dotenv.config();

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

  const createManagerSubordinatesTable = `
    CREATE TABLE IF NOT EXISTS \`Manager_Subordinates\` (
      \`Manager_ID\` INT,
      \`Subordinates\` TEXT,
      PRIMARY KEY (\`Manager_ID\`)
    );
  `;

  const dropEmployeeTable = `DROP TABLE IF EXISTS \`Employee\`;`;
  const dropRoleTable = `DROP TABLE IF EXISTS \`Role\`;`;
  const dropDepartmentTable = `DROP TABLE IF EXISTS \`Department\`;`;
  const dropWFHRequestTable = `DROP TABLE IF EXISTS \`WFH_Request\`;`;
  const dropWFHRequestRecurringTable = `DROP TABLE IF EXISTS \`WFH_Request_Recurring\`;`;
  const dropWFHWithdrawalTable = `DROP TABLE IF EXISTS \`WFH_Withdrawal\`;`;
  const dropManagerSubordinatesTable = `DROP TABLE IF EXISTS \`Manager_Subordinates\`;`;

  // Drop tables first
  await client.query(dropEmployeeTable);
  await client.query(dropRoleTable);
  await client.query(dropDepartmentTable);
  await client.query(dropWFHRequestTable);
  await client.query(dropWFHRequestRecurringTable);
  await client.query(dropWFHWithdrawalTable);
  await client.query(dropManagerSubordinatesTable);
  // Add data
  await client.query(createEmployeeTable);
  await client.query(createRoleTable);
  await client.query(createDepartmentTable);
  await client.query(createWFHRequestTable);
  await client.query(createWFHRequestRecurringTable);
  await client.query(createWFHRequestWithdrawalTable);
  await client.query(createManagerSubordinatesTable);
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
    await insertRole(mysqlClient, { Role_ID: 1, Role_Name: 'Manager' });
    await insertDepartment(mysqlClient, {
      Dept_ID: 1,
      Dept_Name: 'Engineering',
    });
    await insertManagerSubordinates(mysqlClient, {
      Manager_ID: 1,
      Subordinates: '2, 3',
    });
    await insertEmployee(mysqlClient, {
      Staff_ID: 1,
      Staff_FName: 'John',
      Staff_LName: 'Doe',
      Dept_ID: 1,
      Position: 'Developer',
      Country: 'USA',
      Email: 'john.doe@example.com',
      Reporting_Manager: 2,
      Role_ID: 1,
    });
    await insertEmployee(mysqlClient, {
      Staff_ID: 2,
      Staff_FName: 'Jane',
      Staff_LName: 'Smith',
      Dept_ID: 1,
      Position: 'Manager',
      Country: 'USA',
      Email: 'jane.smith@example.com',
      Reporting_Manager: null,
      Role_ID: 2,
    });
    await insertWFHRequest(mysqlClient, {
      Request_ID: 1,
      Staff_ID: 1,
      Request_Date: '2024-09-01',
      Request_Period: 'AM',
      Request_Reason: 'Meeting',
      Status: 'Approved',
      Approver_ID: 2,
      Comments: 'Approved',
      WFH_Date: '2024-10-05',
      Decision_Date: '2024-09-02',
      Recurring_Request_ID: null,
    });
    await insertWFHRequestRecurring(mysqlClient, {
      Request_ID: 6,
      Staff_ID: 1,
      WFH_Date_Start: '2024-10-01',
      WFH_Date_End: '2024-10-31',
      WFH_Day: '1',
      Request_Period: 'AM',
      Request_Date: '2024-09-01',
      Request_Reason: 'Personal',
      Status: 'Approved',
      Approver_ID: 2,
      Comments: 'Recurring Approved',
      Decision_Date: '2024-09-02',
    });
  });

  afterAll(async () => {
    await closeConnection();
    await mysqlClient.end();
    await mysqlContainer.stop();
  });

  it('Test', async () => {
    expect(1 + 1).toBe(2);
  });

  it('GET /wfh-request/user › should return empty array if user has no WFH requests', async () => {
    const response = await request(app)
      .get('/wfh-request/user')
      .query({ staffID: 3 })
      .expect(200);
    expect(response.body.results).toHaveLength(0);
  });

  it('GET /wfh-request/user/non-recurring-dates › should retrieve non-recurring WFH dates for a user', async () => {
    const response = await request(app)
      .get('/wfh-request/user/non-recurring-dates')
      .query({ staffID: 1, status: 'Approved' })
      .expect(200);
    expect(response.body.results).toEqual([['2024-10-05', 'AM']]);
  });

  it('GET /wfh-request/user/non-recurring-dates › should return empty array if no non-recurring WFH dates', async () => {
    const response = await request(app)
      .get('/wfh-request/user/non-recurring-dates')
      .query({ staffID: 2, status: 'Approved' })
      .expect(200);
    expect(response.body.results).toEqual([]);
  });

  it('GET /wfh-request/user/recurring-dates › should return empty array if no recurring WFH dates', async () => {
    const response = await request(app)
      .get('/wfh-request/user/recurring-dates')
      .query({ staffID: 2, status: 'Approved' })
      .expect(200);
    expect(response.body.recurringDates).toEqual([]);
  });

  it('POST /wfh-request/apply › should apply for WFH successfully', async () => {
    const newWFHRequest = {
      Staff_ID: 1,
      Request_Date: '2024-10-05',
      Request_Period: 'AM',
      Request_Reason: 'Meeting',
      Status: 'Pending',
      Approver_ID: 2,
      Comments: '',
      WFH_Date: '2024-10-05',
      Decision_Date: null,
      Recurring_Request_ID: null,
    };

    const response = await request(app)
      .post('/wfh-request/apply')
      .send(newWFHRequest)
      .expect(200);
    expect(response.body.message).toBe('Request Submitted Successfully');
    expect(response.body.data).toHaveProperty('insertId');
  });

  it('POST /wfh-request/apply › should fail to apply if required fields are missing', async () => {
    const incompleteWFHRequest = {
      Staff_ID: 1,
      // Missing Request_Date
      Request_Period: 'AM',
      Request_Reason: 'Meeting',
      Status: 'Pending',
      Approver_ID: 2,
      Comments: '',
      WFH_Date: '2024-10-05',
      Decision_Date: null,
      Recurring_Request_ID: null,
    };

    const response = await request(app)
      .post('/wfh-request/apply')
      .send(incompleteWFHRequest)
      .expect(400);
    expect(response.body.message).toBe('Request Submission Failed');
  });

  it('POST /wfh-request/apply › should fail to apply if WFH date is out of range', async () => {
    const outOfRangeWFHRequest = {
      Staff_ID: 1,
      Request_Date: '2024-01-01',
      Request_Period: 'AM',
      Request_Reason: 'Vacation',
      Approver_ID: 2,
      WFH_Date: '2023-01-01', // Out of range
    };
    const response = await request(app)
      .post('/wfh-request/apply')
      .send(outOfRangeWFHRequest)
      .expect(400);
    expect(response.body.message).toBe(
      'Applied WFH date must be within 3 months forward or 2 months back',
    );
  });

  it('DELETE /wfh-request/request/delete/id › should delete a WFH request successfully', async () => {
    const response = await request(app)
      .delete('/wfh-request/request/delete/id')
      .query({ requestID: 1 })
      .expect(200);
    expect(response.body.message).toBe('Request 1 deleted successfully.');

    // Verify deletion
    const verifyResponse = await request(app)
      .get('/wfh-request/user')
      .query({ staffID: 1 })
      .expect(200);
    expect(verifyResponse.body.results).toHaveLength(0);
  });

  it('DELETE /wfh-request/request/delete/id › should return 200 even if the request does not exist', async () => {
    const response = await request(app)
      .delete('/wfh-request/request/delete/id')
      .query({ requestID: 999 })
      .expect(200);
    expect(response.body.message).toBe('Request 999 deleted successfully.');
  });

  it('PUT /wfh-request/request/status › should update the status of a WFH request', async () => {
    // Insert WFH request
    await insertWFHRequest(mysqlClient, {
      Request_ID: 2,
      Staff_ID: 1,
      Request_Date: '2024-10-06',
      Request_Period: 'PM',
      Request_Reason: 'Workshop',
      Status: 'Pending',
      Approver_ID: 2,
      Comments: '',
      WFH_Date: '2024-10-06',
      Decision_Date: null,
      Recurring_Request_ID: null,
    });

    const response = await request(app)
      .put('/wfh-request/request/status')
      .query({ requestID: 2 })
      .send({ status: 'Approved' })
      .expect(200);
    expect(response.body).toHaveProperty(
      'message',
      'Request status updated successfully',
    );
  });

  it('PUT /wfh-request/request/status › should handle non-existent request ID', async () => {
    const response = await request(app)
      .put('/wfh-request/request/status')
      .query({ requestID: 999 })
      .send({ status: 'Approved' })
      .expect(404);
    expect(response.body.message).toBe('Request not found');
  });

  it('POST /wfh-request/recurring-request/insert-approved-recurring-dates › should insert approved recurring dates successfully', async () => {
    const newRecurringRequest = {
      Staff_ID: 1,
      WFH_Date: '2024-11-01',
      Request_Period: 'AM',
      Request_Date: '2024-10-15',
      Request_Reason: 'Weekly meetings',
      Status: 'Approved',
      Approver_ID: 2,
      Comments: 'Approved for November',
      Decision_Date: '2024-10-16',
      Recurring_Request_ID: 2,
    };

    const response = await request(app)
      .post('/wfh-request/recurring-request/insert-approved-recurring-dates')
      .send(newRecurringRequest)
      .expect(200);
    expect(response.body.message).toBe(
      'Approved Recurring Dates Inserted Successfully',
    );
  });

  it('POST /wfh-request/apply-recurring › should apply for recurring WFH successfully', async () => {
    const recurringRequest = {
      Staff_ID: 1,
      WFH_Date_Start: '2024-12-01',
      WFH_Date_End: '2024-12-31',
      WFH_Day: '5',
      Request_Period: 'PM',
      Request_Date: '2024-11-20',
      Request_Reason: 'End of year tasks',
      Approver_ID: 2,
    };

    const response = await request(app)
      .post('/wfh-request/apply-recurring')
      .send(recurringRequest)
      .expect(200);
    expect(response.body.message).toBe('Request Submitted Successfully');

    // Verify in database
    const dbResponse = await mysqlClient.query(
      'SELECT * FROM `WFH_Request_Recurring` WHERE `Staff_ID` = ?',
      [1],
    );
    expect(dbResponse[0].length).toBeGreaterThan(0);
  });

  it('POST /wfh-request/apply-recurring › should fail to apply recurring WFH if required fields are missing', async () => {
    const incompleteRecurringRequest = {
      Staff_ID: 1,
      // Missing WFH_Date_Start
      WFH_Date_End: '2024-12-31',
      WFH_Day: '5',
      Request_Period: 'PM',
      Request_Date: '2024-11-20',
      Request_Reason: 'End of year tasks',
      Status: 'Pending',
      Approver_ID: 2,
      Comments: '',
      Decision_Date: null,
    };

    const response = await request(app)
      .post('/wfh-request/apply-recurring')
      .send(incompleteRecurringRequest)
      .expect(400);
    expect(response.body.message).toBe('Please fill in all fields');
  });

  it('POST /wfh-request/apply-recurring › should fail to apply recurring WFH if dates are out of range', async () => {
    const outOfRangeRecurringRequest = {
      Staff_ID: 1,
      WFH_Date_Start: '2022-01-01', // Out of range
      WFH_Date_End: '2022-01-31',
      WFH_Day: '1',
      Request_Period: 'AM',
      Request_Date: '2024-09-01',
      Request_Reason: 'Personal',
      Approver_ID: 2,
    };
    const response = await request(app)
      .post('/wfh-request/apply-recurring')
      .send(outOfRangeRecurringRequest)
      .expect(400);
    expect(response.body.message).toBe(
      'Applied WFH start and end date must be within 3 months forward or 2 months back',
    );
  });

  it('GET /wfh-request/recurring-request/dates › should retrieve recurring dates for a request ID', async () => {
    const response = await request(app)
      .get('/wfh-request/recurring-request/dates')
      .query({ requestID: 6 });
    expect(response.body).toMatchObject({
      WFH_Date_Start: '2024-10-01T00:00:00.000Z',
      WFH_Date_End: '2024-10-31T00:00:00.000Z',
      WFH_Day: '1',
      Request_Period: 'AM',
    });
  });

  it('GET /wfh-request/recurring-request/dates › should return error if recurring request does not exist', async () => {
    const response = await request(app)
      .get('/wfh-request/recurring-request/dates')
      .query({ requestID: 999 })
      .expect(404);
    expect(response.body.message).toBe('Request not found');
  });

  it('GET /wfh-request/withdrawal/get-request-reason-of-request-id › should retrieve request reason by withdrawal request ID', async () => {
    // Insert withdrawal request
    await insertWFHWithdrawal(mysqlClient, {
      Withdrawal_ID: 3,
      Request_ID: 1,
      Staff_Name: 'John Doe',
      Staff_Position: 'Developer',
      Request_Period: 'AM',
      Request_Reason: 'Change of plans',
      Status: 'Rejected',
      Approver_Name: 'Jane Smith',
      WFH_Date: '2024-10-05',
      Comments: 'Not feasible',
    });

    const response = await request(app)
      .get('/wfh-request/withdrawal/get-request-reason-of-request-id')
      .query({ requestID: 1 })
      .expect(200);
    expect(response.body).toHaveProperty('request_reason', 'Change of plans');
  });

  it('GET /wfh-request/withdrawal/get-request-reason-of-request-id › should return error if withdrawal request ID does not exist', async () => {
    const response = await request(app)
      .get('/wfh-request/withdrawal/get-request-reason-of-request-id')
      .query({ requestID: 999 })
      .expect(500);
    expect(response.body.message).toBe(
      "Cannot read properties of undefined (reading 'Request_Reason')",
    );
  });

  it('POST /wfh-request/withdraw/post/id › should submit a withdrawal request successfully', async () => {
    const withdrawalRequest = {
      Request_ID: 1,
      Staff_Name: 'John Doe',
      Staff_Position: 'Developer',
      Request_Period: 'AM',
      Request_Reason: 'Change of plans',
      Status: 'Pending',
      Approver_Name: 'Jane Smith',
      WFH_Date: '2024-10-05',
      Comments: '',
    };

    const response = await request(app)
      .post('/wfh-request/withdraw/post/id')
      .send(withdrawalRequest)
      .expect(200);
    expect(response.body.message).toBe(
      'Withdrawal Request Submitted Successfully',
    );
  });

  it('POST /wfh-request/withdraw/post/id › should fail to submit withdrawal if Request_Reason is missing', async () => {
    const incompleteWithdrawalRequest = {
      Request_ID: 1,
      Staff_Name: 'John Doe',
      Staff_Position: 'Developer',
      Request_Period: 'AM',
      // Missing Request_Reason
      Status: 'Pending',
      Approver_Name: 'Jane Smith',
      WFH_Date: '2024-10-05',
      Comments: '',
    };

    const response = await request(app)
      .post('/wfh-request/withdraw/post/id')
      .send(incompleteWithdrawalRequest)
      .expect(400);
    expect(response.body.message).toBe('Please fill in all fields');
  });

  it('PUT /wfh-request/removeExpiredRequests › should remove expired requests successfully', async () => {
    // Insert expired request
    await insertWFHRequest(mysqlClient, {
      Request_ID: 8,
      Staff_ID: 1,
      Request_Date: '2023-01-01',
      Request_Period: 'AM',
      Request_Reason: 'Old request',
      Status: 'Expired',
      Approver_ID: 2,
      Comments: '',
      WFH_Date: '2023-01-01',
      Decision_Date: '2023-01-02',
      Recurring_Request_ID: null,
    });

    const response = await request(app)
      .put('/wfh-request/removeExpiredRequests')
      .send({ staffID: 1 })
      .expect(200);
    expect(response.body.message).toBe(
      'Expired requests for staffID 1 rejected successfully and comments updated.',
    );
  });

  it('PUT /wfh-request/withdrawal/status › should update withdrawal status to Rejected', async () => {
    // Insert withdrawal request
    await insertWFHWithdrawal(mysqlClient, {
      Withdrawal_ID: 2,
      Request_ID: 2,
      Staff_Name: 'Jane Doe',
      Staff_Position: 'Designer',
      Request_Period: 'PM',
      Request_Reason: 'Personal reasons',
      Status: 'Pending',
      Approver_Name: 'John Smith',
      WFH_Date: '2024-10-06',
      Comments: '',
    });

    const response = await request(app)
      .put('/wfh-request/withdrawal/status')
      .query({ requestID: 2 })
      .send({ status: 'Rejected' })
      .expect(200);
    expect(response.body.message).toBe('Request status updated successfully');
  });

  it('PUT /wfh-request/withdrawal/status › should update withdrawal status to Withdrawn', async () => {
    // Insert withdrawal request
    await insertWFHWithdrawal(mysqlClient, {
      Withdrawal_ID: 3,
      Request_ID: 3,
      Staff_Name: 'Alice Brown',
      Staff_Position: 'Tester',
      Request_Period: 'AM',
      Request_Reason: 'Change of plans',
      Status: 'Pending',
      Approver_Name: 'Bob Green',
      WFH_Date: '2024-10-07',
      Comments: '',
    });

    const response = await request(app)
      .put('/wfh-request/withdrawal/status')
      .query({ requestID: 3 })
      .send({ status: 'Withdrawn' })
      .expect(200);
    expect(response.body.message).toBe('Request status updated successfully');
  });

  it('PUT /wfh-request/withdrawal/status › should handle non-existent withdrawal request', async () => {
    const response = await request(app)
      .put('/wfh-request/withdrawal/status')
      .query({ requestID: 999 })
      .send({ status: 'Rejected' })
      .expect(404);
    expect(response.body.message).toBe('Request not found');
  });

  it('PUT /wfh-request/request/updateComments › should update comments of a WFH request', async () => {
    // Insert WFH request
    await insertWFHRequest(mysqlClient, {
      Request_ID: 4,
      Staff_ID: 1,
      Request_Date: '2024-10-08',
      Request_Period: 'PM',
      Request_Reason: 'Team meeting',
      Status: 'Pending',
      Approver_ID: 2,
      Comments: '',
      WFH_Date: '2024-10-08',
      Decision_Date: null,
      Recurring_Request_ID: null,
    });

    const response = await request(app)
      .put('/wfh-request/request/updateComments')
      .query({ requestID: 4 })
      .send({ comments: 'Updated comment' })
      .expect(200);
    expect(response.body.message).toBe('Request comments updated successfully');
  });

  it('PUT /wfh-request/request/updateComments › should handle updating comments for non-existent request', async () => {
    const response = await request(app)
      .put('/wfh-request/request/updateComments')
      .query({ requestID: 999 })
      .send({ comments: 'No such request' })
      .expect(404);
    expect(response.body.message).toBe('Request not found');
  });

  it('PUT /wfh-request/recurring-request/update-comments › should update comments of a recurring WFH request', async () => {
    // Insert recurring request
    await insertWFHRequestRecurring(mysqlClient, {
      Request_ID: 5,
      Staff_ID: 1,
      WFH_Date_Start: '2024-12-01',
      WFH_Date_End: '2024-12-31',
      WFH_Day: '5',
      Request_Period: 'PM',
      Request_Date: '2024-11-25',
      Request_Reason: 'Monthly review',
      Status: 'Approved',
      Approver_ID: 2,
      Comments: '',
      Decision_Date: '2024-11-26',
    });

    const response = await request(app)
      .put('/wfh-request/recurring-request/update-comments')
      .query({ requestID: 5 })
      .send({ comments: 'Needs approval' })
      .expect(200);
    expect(response.body.message).toBe('Request comments updated successfully');
  });

  it('PUT /wfh-request/recurring-request/update-comments › should handle updating comments for non-existent recurring request', async () => {
    const response = await request(app)
      .put('/wfh-request/recurring-request/update-comments')
      .query({ requestID: 999 })
      .send({ comments: 'No such recurring request' })
      .expect(404);
    expect(response.body.message).toBe('Request not found');
  });

  it('PUT /wfh-request/recurring-request/update-decision-date › should update decision date of a recurring WFH request', async () => {
    const response = await request(app)
      .put('/wfh-request/recurring-request/update-decision-date')
      .query({ requestID: 6 })
      .send({ Decision_Date: '2024-12-01' })
      .expect(200);
    expect(response.body.message).toBe(
      'Request decision date updated successfully',
    );
  });

  it('PUT /wfh-request/recurring-request/update-decision-date › should handle updating decision date for non-existent recurring request', async () => {
    const response = await request(app)
      .put('/wfh-request/recurring-request/update-decision-date')
      .query({ requestID: 999 })
      .send({ Decision_Date: '2024-12-01' })
      .expect(404);
    expect(response.body.message).toBe('Request not found');
  });

  it('GET /wfh-request/getStaffWFHDateByID › should retrieve WFH date by request ID', async () => {
    // Insert WFH request
    await insertWFHRequest(mysqlClient, {
      Request_ID: 7,
      Staff_ID: 1,
      Request_Date: '2024-12-05',
      Request_Period: 'PM',
      Request_Reason: 'Finalizing reports',
      Status: 'Approved',
      Approver_ID: 2,
      Comments: 'Completed',
      WFH_Date: '2024-12-05',
      Decision_Date: '2024-12-01',
      Recurring_Request_ID: null,
    });

    const response = await request(app)
      .get('/wfh-request/getStaffWFHDateByID')
      .query({ requestID: 7 })
      .expect(200);
    expect(response.body).toHaveProperty(
      'wfh_date',
      '2024-12-05T00:00:00.000Z',
    );
  });

  it('GET /wfh-request/getStaffWFHDateByID › should return error if request ID does not exist', async () => {
    const response = await request(app)
      .get('/wfh-request/getStaffWFHDateByID')
      .query({ requestID: 999 })
      .expect(500);
    expect(response.body.message).toBe(
      "Cannot read properties of undefined (reading 'WFH_Date')",
    );
  });
});

// Helper function to insert manager subordinates
async function insertManagerSubordinates(client, managerSubordinates) {
  const sql = `
    INSERT INTO \`Manager_Subordinates\`
    (\`Manager_ID\`, \`Subordinates\`)
    VALUES (?, ?);
  `;
  const values = [
    managerSubordinates.Manager_ID,
    managerSubordinates.Subordinates,
  ];
  await client.query(sql, values);
}
