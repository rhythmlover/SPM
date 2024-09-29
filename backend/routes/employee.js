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
    let [results] = await executeQuery(`SELECT * FROM Employee WHERE Staff_ID = ${staffID}`);
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

router.get('/getStaffReportingManager', async (req, res, next) => {
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

router.get('/getStaffNameByID', async (req, res, next) => {
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

export default router;
