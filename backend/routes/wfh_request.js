import express from 'express';
import { executeQuery } from '../mysqlConnection.js';

const router = express.Router();

router.get('/all', async (req, res, next) => {
  try {
    let [results, _] = await executeQuery('SELECT * FROM `WFH_Request`');
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.get('/user', async (req, res, next) => {
  const staffID = req.query.staffID;

  try {
    // Fetch current staff information
    let [currstaffresults] = await executeQuery(
      `SELECT * FROM Employee WHERE Staff_ID = ${staffID}`,
    );

    // Fetch requests
    let [results, _] = await executeQuery(`SELECT * FROM WFH_Request WHERE Staff_ID = ${staffID}`);

    // Fetch dates of those requests
    for (let r of results) {
      let rid = r['Request_ID'];
      let [datesresults, _] = await executeQuery(
        `SELECT * FROM WFH_Request_Dates WHERE Request_ID = ${rid}`,
      );
      // Add to WFH_Request
      r['Dates'] = datesresults;

      // Query Staff_ID and Approver_ID for more info on Employee
      r['Staff'] = currstaffresults[0];
      let [approverresults] = await executeQuery(
        `SELECT * FROM Employee WHERE Staff_ID = ${r['Approver_ID']}`,
      );
      r['Approver'] = approverresults[0];
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

export default router;
