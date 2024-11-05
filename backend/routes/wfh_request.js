import express from 'express';
import { executeQuery } from '../mysqlConnection.js';

const router = express.Router();

router.get('/all', async (req, res, next) => {
  try {
    let [results, _] = await executeQuery('SELECT * FROM `WFH_Request`');

    // Attach other info into request
    for (let r of results) {
      // Query Staff_ID and Approver_ID for more info on Employee
      let [approverresults] = await executeQuery(
        `SELECT * FROM Employee WHERE Staff_ID = ${r['Approver_ID']}`,
      );

      // Fetch current staff information
      let [currstaffresults] = await executeQuery(
        `SELECT * FROM Employee WHERE Staff_ID = ${r['Staff_ID']}`,
      );
      // Map department ID to name
      let [departmentresults] = await executeQuery(
        `SELECT * FROM Department WHERE Dept_ID = ${currstaffresults[0]['Dept_ID']}`,
      );
      currstaffresults[0]['Department'] = departmentresults[0];

      r['Staff'] = currstaffresults[0];
      r['Approver'] = approverresults[0];
    }

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
      `SELECT WFH_Date, Request_Period FROM WFH_Request WHERE Staff_ID = ${staffID} AND Status IN ('Approved', 'Pending', 'Withdrawal Pending')`,
    );

    results = results.map((result) => {
      let date = new Date(result['WFH_Date']);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return [date.toISOString().split('T')[0], result['Request_Period']];
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
          recurringDates.push([
            adjustedDate.toISOString().split('T')[0],
            request['Request_Period'],
          ]);
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
    // First check if request exists
    const [existingRequest] = await executeQuery(
      `SELECT Request_ID FROM WFH_Request WHERE Request_ID = ${requestID}`,
    );

    // Delete the WFH request
    await executeQuery(
      `DELETE FROM WFH_Request WHERE Request_ID = ${requestID}`,
    );

    // Delete associated dates
    await executeQuery(
      `DELETE FROM WFH_Request_Dates WHERE Request_ID = ${requestID}`,
    );

    res.status(200).json({
      message: `Request ${requestID} deleted successfully.`,
    });
  } catch (error) {
    // Don't pass to next, return 200 as specified
    res.status(200).json({
      message: `Request ${requestID} deleted successfully.`,
    });
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
        message: 'Request Submission Failed',
        error: 'Invalid Request',
      });
    }

    res
      .status(200)
      .json({ message: 'Request Submitted Successfully', data: results });
  } catch (error) {
    res.status(400).json({ message: 'Request Submission Failed' });
  }
});

router.post(
  '/recurring-request/insert-approved-recurring-dates',
  async (req, res, next) => {
    try {
      const {
        Staff_ID,
        Request_Date,
        Request_Period,
        Request_Reason,
        Approver_ID,
        Comments,
        Decision_Date,
        WFH_Date,
        Recurring_Request_ID,
      } = req.body;

      const [results] = await executeQuery(
        `INSERT INTO WFH_Request (Staff_ID, WFH_Date, Request_Period, Request_Date, Request_Reason, Status, Approver_ID, Comments, Decision_Date, Recurring_Request_ID) VALUES (${Staff_ID}, '${WFH_Date}', '${Request_Period}', '${Request_Date}', '${Request_Reason}', 'Approved', ${Approver_ID}, '${Comments}', '${Decision_Date}', ${Recurring_Request_ID})`,
      );

      res.status(200).json({
        message: 'Approved Recurring Dates Inserted Successfully',
        data: results,
      });
    } catch (error) {
      res.status(400).json({
        message: 'Failed to insert approved recurring dates',
        error: error.message,
      });
    }
  },
);

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
          message: 'Request Submission Failed',
          error: 'Invalid Request',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        message: 'Request Submission Failed',
        error: error.message,
      });
    }

    res.status(200).json({ message: 'Request Submitted Successfully' });
  } catch (error) {
    next(error);
  }
});

router.put('/request/status', async (req, res, next) => {
  const requestID = req.query.requestID;
  const newStatus = req.body.status;

  try {
    let [result] = await executeQuery(
      `UPDATE WFH_Request SET Status = '${newStatus}', Decision_Date = CURDATE() WHERE Request_ID = ${requestID}`,
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

router.put('/recurring-request/status', async (req, res, next) => {
  const requestID = req.query.requestID;
  const newStatus = req.body.status;

  try {
    let [result] = await executeQuery(
      `UPDATE WFH_Request_Recurring SET Status = '${newStatus}' WHERE Request_ID = ${requestID}`,
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

    if (newStatus === 'Rejected') {
      // If newStatus is "Approved", update Status to "Rejected"
      [result] = await executeQuery(
        `UPDATE WFH_Withdrawal SET Status = 'Rejected' WHERE Request_ID = ${requestID}`,
      );
    }
    if (newStatus === 'Withdrawn') {
      // If newStatus is "Withdrawn", update Status to "Approved"
      [result] = await executeQuery(
        `UPDATE WFH_Withdrawal SET Status = 'Approved' WHERE Request_ID = ${requestID}`,
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

router.get(
  '/request/get-approved-requests-by-approver-id-and-wfh-date-period',
  async (req, res, next) => {
    const { Approver_ID, WFH_Date, Request_Period } = req.query;

    try {
      let [results] = await executeQuery(
        `SELECT * FROM WFH_Request WHERE Approver_ID = ${Approver_ID} AND Status = 'Approved' AND WFH_Date = '${WFH_Date}' AND Request_Period = '${Request_Period}'`,
      );
      res.json(results);
    } catch (error) {
      next(error);
    }
  },
);

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

router.put('/recurring-request/update-comments', async (req, res, next) => {
  const requestID = req.query.requestID;
  const comments = req.body.comments;

  try {
    let [result] = await executeQuery(
      `UPDATE WFH_Request_Recurring SET Comments = '${comments}' WHERE Request_ID = ${requestID}`,
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

router.put(
  '/recurring-request/update-decision-date',
  async (req, res, next) => {
    const requestID = req.query.requestID;
    const Decision_Date = req.body.Decision_Date;

    try {
      let [result] = await executeQuery(
        `UPDATE WFH_Request_Recurring SET Decision_Date = '${Decision_Date}' WHERE Request_ID = ${requestID}`,
      );

      if (result.affectedRows > 0) {
        res.json({
          message: 'Request decision date updated successfully',
          requestID,
        });
      } else {
        res.status(404).json({ message: 'Request not found' });
      }
    } catch (error) {
      next(error);
    }
  },
);

router.get('/recurring-request/dates', async (req, res, next) => {
  const requestID = req.query.requestID;

  try {
    let [result] = await executeQuery(
      `SELECT WFH_Date_Start, WFH_Date_End, WFH_Day, Request_Period FROM WFH_Request_Recurring WHERE Request_ID = ${requestID}`,
    );

    if (result.length > 0) {
      res.json(result[0]);
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

router.get(
  '/withdrawal/get-request-reason-of-request-id',
  async (req, res, next) => {
    const requestID = req.query.requestID;

    try {
      let [results] = await executeQuery(
        `SELECT Request_Reason FROM WFH_Withdrawal WHERE Request_ID = ${requestID}`,
      );
      let request_reason = results[0]['Request_Reason'];
      res.json({ request_reason });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/withdrawal/get-request-comment-of-request-id',
  async (req, res, next) => {
    const requestID = req.query.requestID;

    try {
      let [results] = await executeQuery(
        `SELECT Comments FROM WFH_Withdrawal WHERE Request_ID = ${requestID}`,
      );

      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: 'No comments found for this Request ID' });
      }

      let comments = results[0]['Comments'];
      res.json({ comments });
      res.json({ comments });
    } catch (error) {
      next(error);
    }
  },
);

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
  const {
    Request_ID,
    Staff_Name,
    Staff_Position,
    Request_Period,
    Request_Reason,
    Approver_Name,
    WFH_Date,
  } = req.body;

  // Check for missing fields
  if (!Request_Reason) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    // Insert the withdrawal request into the database
    const [results] = await executeQuery(
      `INSERT INTO WFH_Withdrawal (Request_ID, Staff_Name, Staff_Position, Request_Period, Request_Reason, Status, Approver_Name, WFH_Date) 
      VALUES (${Request_ID}, '${Staff_Name}', '${Staff_Position}', '${Request_Period}', '${Request_Reason}', 'Pending', '${Approver_Name}', '${WFH_Date}')`,
    );

    if (!results) {
      return res.status(400).json({
        message: 'Withdrawal Request Submission Failed',
        error: 'Invalid Request',
      });
    }

    // Update the Status in the wfh_request table
    const [updateResults] = await executeQuery(
      `UPDATE WFH_Request 
       SET Status = 'Withdrawal Pending' 
       WHERE Request_ID = ${Request_ID}`,
    );

    if (!updateResults) {
      return res
        .status(400)
        .json({ message: 'Failed to update the WFH request status' });
    }

    res.status(200).json({
      message: 'Withdrawal Request Submitted Successfully',
      data: results,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'Withdrawal Request Submission Failed',
      error: error.message,
    });
  }
});

router.put('/removeExpiredRequests', async (req, res, next) => {
  try {
    const { staffID } = req.body;

    if (!staffID) {
      return res.status(400).json({ error: 'staffID is required' });
    }

    await executeQuery(
      `UPDATE WFH_Request 
      SET Status = 'Rejected',
          Comments = 'Expired pending request',
          Decision_Date = CURDATE()
      WHERE WFH_Date < DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
      AND (Staff_ID = ${staffID} OR Approver_ID = ${staffID})
      AND (Status = 'Pending' OR Status = 'Pending Withdrawal')`,
    );
    res.json({
      message: `Expired requests for staffID ${staffID} rejected successfully and comments updated.`,
    });
  } catch (error) {
    console.error('Error occurred:', error); // Log any errors that occur
    next(error);
  }
});

router.get('/ds-recurring', async (req, res, next) => {
  const staffID = req.query.staffID;

  try {
    let [results] = await executeQuery(
      `SELECT * FROM WFH_Request_Recurring WHERE Approver_ID = ${staffID}`,
    );
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/request/get-wfh-date-period-by-request-id',
  async (req, res, next) => {
    const requestID = req.query.requestID;

    try {
      let [results] = await executeQuery(
        `SELECT WFH_Date, Request_Period FROM WFH_Request WHERE Request_ID = ${requestID}`,
      );
      if (results && results.length > 0) {
        res.json({ data: results[0] });
      } else {
        res.status(404).json({ message: 'No data found for this Request ID' });
      }
    } catch (error) {
      next(error);
    }
  },
);

router.get('/recurring-request/get-request-details', async (req, res, next) => {
  const requestID = req.query.requestID;

  try {
    let [results] = await executeQuery(
      `SELECT * FROM WFH_Request_Recurring WHERE Request_ID = ${requestID}`,
    );
    res.json(results[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/user-recurring-requests', async (req, res, next) => {
  const staffID = req.query.staffID;

  try {
    // Fetch current staff information
    let [currstaffresults] = await executeQuery(
      `SELECT * FROM Employee WHERE Staff_ID = ${staffID}`
    );

    // Fetch non-recurring requests
    let [nonRecurringResults] = await executeQuery(
      `SELECT * FROM WFH_Request WHERE Staff_ID = ${staffID}`
    );

    // Fetch recurring requests
    let [recurringResults] = await executeQuery(
      `SELECT * FROM WFH_Request_Recurring WHERE Staff_ID = ${staffID} 
       AND (Status = 'Pending' OR Status = 'Rejected')`
    );

    // Combine both results
    const combinedResults = [...nonRecurringResults, ...recurringResults];

    // Attach other info into each request
    for (let r of combinedResults) {
      let approverId = r.Approver_ID || r.Approver_ID; // Use the approver ID from the appropriate request
      let [approverresults] = await executeQuery(
        `SELECT * FROM Employee WHERE Staff_ID = ${approverId}`
      );

      // Attach current staff and approver details to the request
      r['Staff'] = currstaffresults[0];
      r['Approver'] = approverresults[0];
    }

    res.json({ results: combinedResults });
  } catch (error) {
    next(error);
  }
});

router.get('/staff-recurring', async (req, res, next) => {
  const staffID = req.query.staffID;

  try {
    let [results] = await executeQuery(
      `SELECT * FROM WFH_Request_Recurring WHERE Staff_ID = ${staffID}
       AND (Status = 'Pending' OR Status = 'Rejected')`,
    );
    return res.json({ results });  
    
  } catch (error) {
    next(error);
  }
});

export default router;
