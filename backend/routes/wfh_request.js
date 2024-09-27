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

router.get('/wfh-dates', async (req, res, next) => {
  try {
    let [results, _] = await executeQuery('SELECT * FROM `WFH_Request_Dates`');
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.get('/user', async (req, res, next) => {
  const userID = req.query.userID;
  try {
    // Fetch requests
    let [results, _] = await executeQuery(`SELECT * FROM WFH_Request WHERE Staff_ID = ${userID}`);

    // Fetch dates of those requests
    for (let r of results) {
      let rid = r['Request_ID'];
      let [datesresults, _] = await executeQuery(
        `SELECT * FROM WFH_Request_Dates WHERE Request_ID = ${rid}`,
      );

      // Add to WFH_Request
      r['Dates'] = datesresults;
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

export default router;
