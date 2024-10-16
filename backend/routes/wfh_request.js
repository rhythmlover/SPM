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
    let [results, _] = await executeQuery(
      `SELECT * FROM WFH_Request WHERE Staff_ID = ${staffID}`,
    );

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

router.get('/user/non-recurring-dates', async (req, res, next) => {
  const staffID = req.query.staffID;

  try {
    let [results] = await executeQuery(
      `SELECT WFH_Date FROM WFH_Request WHERE Staff_ID = ${staffID} AND Status IN ('Approved', 'Pending', 'Withdrawal Pending')`,
    );

    results = results.map((result) => {
      let date = new Date(result['WFH_Date']);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().split('T')[0];
    });

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.get('/user/recurring-dates', async (req, res, next) => {
  const staffID = req.query.staffID;

  try {
    let [results] = await executeQuery(
      `SELECT * FROM WFH_Request_Recurring WHERE Staff_ID = ${staffID} AND Status IN ('Pending', 'Withdrawal Pending')`,
    );

    let recurringDates = [];

    for (let request of results) {
      const wfhDateStart = new Date(request['WFH_Date_Start']);
      const wfhDateEnd = new Date(request['WFH_Date_End']);
      const wfhDay = parseInt(request['WFH_Day']);

      for (
        let d = new Date(wfhDateStart);
        d <= wfhDateEnd;
        d.setDate(d.getDate() + 1)
      ) {
        if (d.getDay() === wfhDay) {
          let adjustedDate = new Date(d);
          adjustedDate.setMinutes(
            adjustedDate.getMinutes() - adjustedDate.getTimezoneOffset(),
          );
          recurringDates.push(adjustedDate.toISOString().split('T')[0]);
        }
      }
    }

    res.json({ recurringDates });
  } catch (error) {
    next(error);
  }
});

router.delete('/request/delete/id', async (req, res, next) => {
  const requestID = req.query.requestID;

  try {
    // Delete the WFH request
    await executeQuery(
      `DELETE FROM WFH_Request WHERE Request_ID = ${requestID}`,
    );

    // Optionally, delete associated dates or related records
    await executeQuery(
      `DELETE FROM WFH_Request_Dates WHERE Request_ID = ${requestID}`,
    );

    res
      .status(200)
      .json({ message: `Request ${requestID} deleted successfully.` });
  } catch (error) {
    next(error);
  }
});

router.post('/apply', async (req, res, next) => {
  try {
    const {
      Staff_ID,
      Request_Date,
      Request_Period,
      Request_Reason,
      Approver_ID,
      WFH_Date,
    } = req.body;

    if (!WFH_Date || !Request_Period || !Request_Reason) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const wfhDate = new Date(WFH_Date);
    const currentDate = new Date();
    const threeMonthsForward = new Date();
    threeMonthsForward.setMonth(currentDate.getMonth() + 3);
    const twoMonthsBack = new Date();
    twoMonthsBack.setMonth(currentDate.getMonth() - 2);

    if (wfhDate > threeMonthsForward || wfhDate < twoMonthsBack) {
      return res.status(400).json({
        message:
          'Applied WFH date must be within 3 months forward or 2 months back',
      });
    }

    const [results] = await executeQuery(
      `INSERT INTO WFH_Request (Staff_ID, Request_Date, Request_Period, Request_Reason, Status, Approver_ID, WFH_Date) VALUES (${Staff_ID}, '${Request_Date}', '${Request_Period}', '${Request_Reason}', 'Pending', ${Approver_ID}, '${WFH_Date}')`,
    );

    if (!results) {
      return res.status(400).json({
        message: 'Application Submission Failed',
        error: 'Invalid Request',
      });
    }

    res
      .status(200)
      .json({ message: 'Application Submitted Successfully', data: results });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .json({ message: 'Application Submission Failed', error: error.message });
  }
});

router.post('/apply-recurring', async (req, res, next) => {
  try {
    const {
      Staff_ID,
      WFH_Date_Start,
      WFH_Date_End,
      WFH_Day,
      Request_Period,
      Request_Date,
      Request_Reason,
      Approver_ID,
    } = req.body;

    if (
      !WFH_Date_Start ||
      !WFH_Date_End ||
      !WFH_Day ||
      !Request_Period ||
      !Request_Reason
    ) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const wfhDateStart = new Date(WFH_Date_Start);
    const wfhDateEnd = new Date(WFH_Date_End);
    const currentDate = new Date();
    const threeMonthsForward = new Date();
    threeMonthsForward.setMonth(currentDate.getMonth() + 3);
    const twoMonthsBack = new Date();
    twoMonthsBack.setMonth(currentDate.getMonth() - 2);

    if (
      wfhDateStart > threeMonthsForward ||
      wfhDateStart < twoMonthsBack ||
      wfhDateEnd > threeMonthsForward ||
      wfhDateEnd < twoMonthsBack
    ) {
      return res.status(400).json({
        message:
          'Applied WFH start and end date must be within 3 months forward or 2 months back',
      });
    }

    let wfhDates = [];
    for (
      let d = new Date(wfhDateStart);
      d <= wfhDateEnd;
      d.setDate(d.getDate() + 1)
    ) {
      if (d.getDay() === parseInt(WFH_Day)) {
        wfhDates.push(new Date(d));
      }
    }

    if (wfhDates.length === 0) {
      return res.status(400).json({
        message: 'No WFH dates found within the specified range',
      });
    }

    try {
      const [results] = await executeQuery(
        `INSERT INTO WFH_Request_Recurring (Staff_ID, WFH_Date_Start, WFH_Date_End, WFH_Day, Request_Period, Request_Date, Request_Reason, Status, Approver_ID) VALUES (${Staff_ID}, '${WFH_Date_Start}', '${WFH_Date_End}', '${WFH_Day}', '${Request_Period}', '${Request_Date}', '${Request_Reason}', 'Pending', ${Approver_ID})`,
      );

      if (!results) {
        return res.status(400).json({
          message: 'Application Submission Failed',
          error: 'Invalid Request',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        message: 'Application Submission Failed',
        error: error.message,
      });
    }

    res.status(200).json({ message: 'Application Submitted Successfully' });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .json({ message: 'Application Submission Failed', error: error.message });
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
      res.json({
        message: 'Request status updated successfully',
        requestID,
        newStatus,
      });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    next(error);
  }
});

router.put('/withdrawal/status', async (req, res, next) => {
  const requestID = req.query.requestID;
  const newStatus = req.body.status;

  try {
    let result;

    if (newStatus === "Rejected") {
      // If newStatus is "Approved", update Status to "Rejected"
      [result] = await executeQuery(
        `UPDATE WFH_Withdrawal SET Status = 'Rejected' WHERE Request_ID = ${requestID}`
      );
    }  
    if (newStatus === "Withdrawn") {
      // If newStatus is "Withdrawn", update Status to "Approved"
      [result] = await executeQuery(
        `UPDATE WFH_Withdrawal SET Status = 'Approved' WHERE Request_ID = ${requestID}`
      );
    } 

    // Check if the update affected any rows
    if (result.affectedRows > 0) {
      res.json({
        message: 'Request status updated successfully',
        requestID,
        newStatus,
      });
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

router.put('/request/updateComments', async (req, res, next) => {
  const requestID = req.query.requestID;
  const comments = req.body.comments;

  try {
    let [result] = await executeQuery(
      `UPDATE WFH_Request SET Comments = '${comments}' WHERE Request_ID = ${requestID}`,
    );

    if (result.affectedRows > 0) {
      res.json({
        message: 'Request comments updated successfully',
        requestID,
        comments,
      });
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

router.put('/withdrawal/updateComments', async (req, res, next) => {
  const requestID = req.query.requestID;
  const comments = req.body.comments;

  try {
    let [result] = await executeQuery(
      `UPDATE WFH_Withdrawal SET Comments = '${comments}' WHERE Request_ID = ${requestID}`,
    );

    if (result.affectedRows > 0) {
      res.json({
        message: 'Request comments updated successfully',
        requestID,
        comments,
      });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    next(error);
  }
});



router.get('/my-subordinate-and-me-requests', async (req, res, next) => {
  const staffID = req.query.staffID;

  try {
    // Fetch my subordinate IDs
    let [subordinateIDs] = await executeQuery(
      `SELECT * FROM Manager_Subordinates WHERE Manager_ID = ${staffID}`,
    );
    subordinateIDs = subordinateIDs[0]['Subordinates'].split(', ');
    subordinateIDs.push(staffID); // Add myself also to fetch my requests as well

    // Fetch all requests of all IDs
    let results = [];
    for (let currStaffID of subordinateIDs) {
      // Fetch current staff information
      let [currstaffInfo] = await executeQuery(
        `SELECT * FROM Employee WHERE Staff_ID = ${currStaffID}`,
      );

      // Fetch request of currStaffID
      let [requestResults, _] = await executeQuery(
        `SELECT * FROM WFH_Request WHERE Staff_ID = ${currStaffID}`,
      );

      // Attach other info into request
      for (let r of requestResults) {
        if (r['Approver_ID'] == null) {
          // Query Staff_ID and Approver_ID for more info on Employee
          let [approverInfo] = await executeQuery(
            `SELECT * FROM Employee WHERE Staff_ID = ${r['Approver_ID']}`,
          );
          r['Approver'] = approverInfo[0];
        }

        r['Staff'] = currstaffInfo[0];
      }

      // Add to results
      results = results.concat(requestResults);
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.post('/withdraw/post/id', async (req, res, next) => {
  const { Request_ID, Staff_Name, Staff_Position, Request_Period, Request_Reason, Approver_Name, WFH_Date } = req.body;

  // Check for missing fields
  if (!Request_Reason) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    // Insert the withdrawal request into the database
    const [results] = await executeQuery(
      `INSERT INTO WFH_Withdrawal (Request_ID, Staff_Name, Staff_Position, Request_Period, Request_Reason, Status, Approver_Name, WFH_Date) 
      VALUES (${Request_ID}, '${Staff_Name}', '${Staff_Position}', '${Request_Period}', '${Request_Reason}', 'Pending', '${Approver_Name}', '${WFH_Date}')`
    );

    if (!results) {
      return res.status(400).json({ message: 'Withdrawal Application Submission Failed', error: 'Invalid Request' });
    }

    // Update the Status in the wfh_request table
    const [updateResults] = await executeQuery(
      `UPDATE WFH_Request 
       SET Status = 'Withdrawal Pending' 
       WHERE Request_ID = ${Request_ID}`
    );

    if (!updateResults) {
      return res.status(400).json({ message: 'Failed to update the WFH request status' });
    }

    res.status(200).json({ message: 'Withdrawal Application Submitted Successfully', data: results });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Withdrawal Application Submission Failed', error: error.message });
  }
});

router.put('/removeExpiredRequests', async (req, res, next) => {
  try {
    const { staffID } = req.body; 
    console.log("Received staffID:", staffID); 

    if (!staffID) {
      return res.status(400).json({ error: 'staffID is required' });
    }

    const result = await executeQuery(
      `UPDATE WFH_Request 
       SET Status = 'Rejected', 
           Comments = 'Expired more than 2 months ago',
           Decision_Date = CURDATE()
       WHERE WFH_Date < DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
       AND Staff_ID = ${staffID}`
    );
    res.json({ message: `Expired requests for staffID ${staffID} rejected successfully and comments updated.` });
  } catch (error) {
    console.error("Error occurred:", error); // Log any errors that occur
    next(error);
  }
});

export default router;
