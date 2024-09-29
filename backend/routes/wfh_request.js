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

router.post('/apply', async (req, res, next) => {
  try {
    const { Staff_ID, Request_Date, Request_Period, Reason, Approver_ID } = req.body;

    if (!Staff_ID || !Request_Date || !Request_Period || !Reason) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const requestDate = new Date(Request_Date);
    const currentDate = new Date();
    const threeMonthsForward = new Date();
    threeMonthsForward.setMonth(currentDate.getMonth() + 3);
    const twoMonthsBack = new Date();
    twoMonthsBack.setMonth(currentDate.getMonth() - 2);

    if (requestDate > threeMonthsForward || requestDate < twoMonthsBack) {
      return res
        .status(400)
        .json({ message: 'Request date must be within 3 months forward or 2 months back' });
    }

    const [existingRequests] = await executeQuery(
      `SELECT * FROM WFH_Request WHERE Staff_ID = ${Staff_ID} AND Request_Date = '${Request_Date}'`,
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({ message: 'You already have a request for this date' });
    }

    const [results] = await executeQuery(
      `INSERT INTO WFH_Request (Staff_ID, Request_Date, Request_Period, Reason, Status, Approver_ID) VALUES (${Staff_ID}, '${Request_Date}', '${Request_Period}', '${Reason}', 'Pending', ${Approver_ID})`,
    );

    if (!results) {
      return res
        .status(400)
        .json({ message: 'Application Submission Failed', error: 'Invalid Request' });
    }

    res.status(200).json({ message: 'Application Submitted Successfully', data: results });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Application Submission Failed', error: error.message });
  }
});

router.put('/request/status', async (req, res, next) => {
  const requestID = req.query.requestID;
  const newStatus = req.body.status;

  try {
    let [result] = await executeQuery(`UPDATE WFH_Request SET Status = '${newStatus}' WHERE Request_ID = ${requestID}`);

    if (result.affectedRows > 0) {
      res.json({ message: "Request status updated successfully", requestID, newStatus });
    } else {
      res.status(404).json({ message: "Request not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/request/getApprovedRequestsByApproverID', async (req, res, next) => {
  const Approver_ID = req.query.approverID;

  try {
    let [results] = await executeQuery(
      `SELECT * FROM WFH_Request WHERE Approver_ID = ${Approver_ID} AND Status = 'Approved'`,
    );
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

export default router;
