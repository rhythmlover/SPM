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

    // Attach other info into request
    for (let r of results) {
      // Query Staff_ID and Approver_ID for more info on Employee
      let [approverresults] = await executeQuery(
        `SELECT * FROM Employee WHERE Staff_ID = ${r['Approver_ID']}`,
      );
      r['Staff'] = currstaffresults[0];
      r['Approver'] = approverresults[0];
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.delete('/request/delete/id', async (req, res, next) => {
  const requestID = req.query.requestID;

  try {
    // Delete the WFH request
    await executeQuery(`DELETE FROM WFH_Request WHERE Request_ID = ${requestID}`);

    // Optionally, delete associated dates or related records
    await executeQuery(`DELETE FROM WFH_Request_Dates WHERE Request_ID = ${requestID}`);

    res.status(200).json({ message: `Request ${requestID} deleted successfully.` });
  } catch (error) {
    next(error);
  }
});

router.post('/apply', async (req, res, next) => {
  try {
    const { Staff_ID, Request_Date, Request_Period, Request_Reason, Approver_ID, WFH_Date } =
      req.body;

    if (!Staff_ID || !WFH_Date || !Request_Period || !Request_Reason) {
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
      `SELECT * FROM WFH_Request WHERE Staff_ID = ${Staff_ID} AND WFH_Date = '${WFH_Date}'`,
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({ message: 'You already have a request for this date' });
    }

    const [results] = await executeQuery(
      `INSERT INTO WFH_Request (Staff_ID, Request_Date, Request_Period, Request_Reason, Status, Approver_ID, WFH_Date) VALUES (${Staff_ID}, '${Request_Date}', '${Request_Period}', '${Request_Reason}', 'Pending', ${Approver_ID}, '${WFH_Date}')`,
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
    let [result] = await executeQuery(
      `UPDATE WFH_Request SET Status = '${newStatus}' WHERE Request_ID = ${requestID}`,
    );

    if (result.affectedRows > 0) {
      res.json({ message: 'Request status updated successfully', requestID, newStatus });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/get-approved-requests-by-approver-id', async (req, res, next) => {
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

router.put('/request/updateApprovalComments', async (req, res, next) => {
  const requestID = req.query.requestID;
  const comments = req.body.comments;

  try {
    let [result] = await executeQuery(
      `UPDATE WFH_Request SET Approval_Comments = '${comments}' WHERE Request_ID = ${requestID}`,
    );

    if (result.affectedRows > 0) {
      res.json({ message: 'Approval comments updated successfully', requestID, comments });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/getStaffWFHDateByID', async (req, res, next) => {
  const requestID = req.query.requestID;
  try {
    let [results] = await executeQuery(
      `SELECT WFH_Date FROM WFH_Request WHERE Request_ID = ${requestID}`,
    );
    let wfh_date = results[0]['WFH_Date'];
    res.json({ wfh_date });
  } catch (error) {
    next(error);
  }
});

export default router;
