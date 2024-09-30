import express from "express";
import { executeQuery } from "../mysqlConnection.js";

const router = express.Router();

// Endpoint for handling errors
router.get("/error", async (req, res, next) => {
    try {
        throw new Error("Team list table error!");
    } catch (error) {
        next(error);
    }
});

router.get("/byReportingManager", async (req, res, next) => {
    try {
        const Staff_ID = req.query.Staff_ID;

        if (!Staff_ID) {
            return res.status(400).json({ error: "Staff_ID is required" });
        }

        // Find the reporting manager's ID        
        let [managerResult] = await executeQuery(`SELECT * FROM Employee WHERE Staff_ID = ${Staff_ID}`);

        if (!managerResult || !managerResult[0]) {
            return res.status(404).json({ error: "Employee not found" });
        }

        const reportingManagerId = managerResult[0].Reporting_Manager;

        // Retrieve employees with the same reporting manager
        let [employeeResults] = await executeQuery(`SELECT Staff_ID, Staff_FName, Staff_LName, position FROM Employee WHERE Reporting_Manager = ${reportingManagerId}`);

        if (!employeeResults || employeeResults.length === 0) {
            return res.status(404).json({ error: "No employees found reporting to this manager" });
        }

        // Iterate through all employees and get their WFH Requests
        const employeeRequests = [];
        for (const employee of employeeResults) {
            const { Staff_ID: employeeStaffId } = employee;

            // Query the WFH_Request table for this employee's requests
            let [wfhResults] = await executeQuery(`SELECT * FROM WFH_Request WHERE Staff_ID = ${employeeStaffId}`);

            employeeRequests.push({
                employee: {
                    Staff_ID: employeeStaffId,
                    Staff_FName: employee.Staff_FName,
                    Staff_LName: employee.Staff_LName,
                    position: employee.position
                },
                wfhRequests: wfhResults
            });
        }

        res.json({ employeeRequests });
    } catch (error) {
        next(error);
    }
});

export default router;
