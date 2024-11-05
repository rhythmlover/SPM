import express from 'express';
import { executeQuery } from '../mysqlConnection.js';

const router = express.Router();

// // middleware that is specific to this router
// const timeLog = (req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// }
// router.use(timeLog)

router.get('/error', async (req, res, next) => {
  try {
    throw new Error('Employee table error!');
  } catch (error) {
    next(error);
  }
});

router.get('/login', async (req, res, next) => {
  const staffID = req.query.staffID;
  try {
    // Fetch employee information
    let [results] = await executeQuery(
      `SELECT * FROM Employee WHERE Staff_ID = ${staffID}`,
    );
    let employee = results[0];
    // console.log('results', results, 'employee:', employee);

    // Fetch other info
    let [deptresults] = await executeQuery(
      `SELECT * FROM Department WHERE Dept_ID = ${employee['Dept_ID']}`,
    );
    let [roleresults] = await executeQuery(
      `SELECT * FROM Role WHERE Role_ID = ${employee['Role_ID']}`,
    );

    employee['Dept'] = deptresults[0];
    employee['Role'] = roleresults[0];

    res.json({ ...employee });
  } catch (error) {
    next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    let [results] = await executeQuery('SELECT * FROM `Employee`');
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.get('/department-count', async (req, res, next) => {
  const departmentName = req.query.departmentName;
  try {
    // Retrieve employees
    let [employeeresults] = await executeQuery('SELECT * FROM `Employee`');
    // Getting all or just 1 department ?
    if (departmentName == 'All') {
      res.json({ total: employeeresults.length });
      return;
    }
    // Retrieve department info
    let [departmentresults] = await executeQuery(
      `SELECT * FROM Department WHERE Dept_Name = '${departmentName}'`,
    );
    departmentresults = departmentresults[0];

    // Filter to only provided department
    let results = [];
    for (let r of employeeresults) {
      if (r['Dept_ID'] != departmentresults['Dept_ID']) continue;
      r['Department'] = departmentresults;
      results.push(r);
    }

    // return results
    res.json({ total: results.length });
  } catch (error) {
    next(error);
  }
});

router.get('/get-staff-reporting-manager', async (req, res, next) => {
  const staffID = req.query.staffID;
  try {
    let [results] = await executeQuery(
      `SELECT Reporting_Manager FROM Employee WHERE Staff_ID = ${staffID}`,
    );
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.get('/get-staff-under-reporting-manager', async (req, res, next) => {
  const reportingManagerID = req.query.reportingManagerID;

  if (!reportingManagerID) {
    return res.status(400).json({ error: 'reportingManagerID is required' });
  }

  try {
    let [results] = await executeQuery(
      `SELECT Staff_ID FROM Employee WHERE Reporting_Manager = ${reportingManagerID}`,
    );
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.get('/get-staff-name-by-id', async (req, res, next) => {
  const staffID = req.query.staffID;
  try {
    let [results] = await executeQuery(
      `SELECT Staff_FName, Staff_LName FROM Employee WHERE Staff_ID = ${staffID}`,
    );
    let name = results[0]['Staff_FName'] + ' ' + results[0]['Staff_LName'];
    res.json({ name });
  } catch (error) {
    next(error);
  }
});

router.get('/getStaffPositionByID', async (req, res, next) => {
  const staffID = req.query.staffID;
  try {
    let [results] = await executeQuery(
      `SELECT Position FROM Employee WHERE Staff_ID = ${staffID}`,
    );
    let position = results[0]['Position'];
    res.json({ position });
  } catch (error) {
    next(error);
  }
});

export default router;
