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

router.get("/subordinateHierarchy", async (req, res, next) => {
    try {
        const Staff_ID = req.query.Staff_ID;

        if (!Staff_ID) {
            return res.status(400).json({ error: "Staff_ID is required" });
        }

        console.log(`Fetching subordinate hierarchy for Staff_ID: ${Staff_ID}`);

        // Fetch all Manager_Subordinates records
        let [allManagerSubordinates] = await executeQuery(`SELECT * FROM Manager_Subordinates`);
        console.log(`Fetched ${allManagerSubordinates.length} records from Manager_Subordinates`);

        // Convert to a more usable format, ensuring all keys are strings and removing self-references
        const subordinatesMap = new Map(
            allManagerSubordinates.map(record => [
                String(record.Manager_ID), 
                record.Subordinates 
                    ? record.Subordinates.split(',')
                        .map(s => s.trim())
                        .filter(s => s !== String(record.Manager_ID)) // Remove self-reference
                    : []
            ])
        );

        console.log(`Subordinates map created with ${subordinatesMap.size} entries`);
        console.log(`All manager IDs in the map: ${[...subordinatesMap.keys()]}`);

        if (!subordinatesMap.has(String(Staff_ID))) {
            console.log(`Staff_ID ${Staff_ID} not found in Manager_Subordinates table`);
            return res.json({ 
                manager_id: Staff_ID,
                subordinates: [],
                message: `Staff_ID ${Staff_ID} does not manage anyone.`
            });
        }

        console.log(`Direct subordinates for ${Staff_ID}: ${JSON.stringify(subordinatesMap.get(String(Staff_ID)))}`);

        // Function to find all subordinates iteratively
        function findAllSubordinates(managerId) {
            const allSubordinates = new Set();
            const queue = [managerId];
            const visited = new Set();

            while (queue.length > 0) {
                const currentManager = queue.shift();
                if (visited.has(currentManager)) continue;
                visited.add(currentManager);

                const directSubordinates = subordinatesMap.get(String(currentManager)) || [];
                for (const subId of directSubordinates) {
                    if (subId === managerId) continue; // Skip if it's the original manager
                    allSubordinates.add(subId);
                    if (!visited.has(subId)) {
                        queue.push(subId);
                    }
                }
            }

            return [...allSubordinates];
        }

        // Get all subordinates
        const allSubordinateIds = findAllSubordinates(Staff_ID);
        console.log(`Final list of all subordinate IDs: ${allSubordinateIds}`);

        // Construct the response
        const response = {
            manager_id: Staff_ID,
            subordinates: allSubordinateIds
        };

        console.log(`Sending response: ${JSON.stringify(response)}`);
        res.json(response);
    } catch (error) {
        console.error(`Error in subordinateHierarchy: ${error.message}`);
        next(error);
    }
});
export default router;
