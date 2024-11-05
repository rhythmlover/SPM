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

        // Fetch all Manager_Subordinates records
        let [allManagerSubordinates] = await executeQuery(`SELECT * FROM Manager_Subordinates`);

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

        if (!subordinatesMap.has(String(Staff_ID))) {
            console.log(`Staff_ID ${Staff_ID} not found in Manager_Subordinates table`);
            return res.json({ 
                manager_id: Staff_ID,
                subordinates: [],
                message: `Staff_ID ${Staff_ID} does not manage anyone.`
            });
        }


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
        // Get own requests as well
        allSubordinateIds.push(Staff_ID);

        // Fetch detailed information for all subordinates
        const subordinatesDetails = await Promise.all(allSubordinateIds.map(async (subId) => {
            try {
                
                // Fetch employee details
                const [employeeDetails] = await executeQuery(
                    `SELECT Staff_ID, Staff_FName, Staff_LName, position 
                    FROM Employee 
                    WHERE Staff_ID = ${subId}`
                );

                // Fetch WFH requests for this employee
                const [wfhRequests] = await executeQuery(
                    `SELECT * 
                    FROM WFH_Request 
                    WHERE Staff_ID = ${subId}`
                );

                return {
                    ...employeeDetails[0],
                    wfhRequests
                };
            } catch (error) {
                console.error(`Error fetching details for subordinate ${subId}:`, error);
                return {
                    Staff_ID: subId,
                    error: `Failed to fetch details: ${error.message}`
                };
            }
        }));

        // Construct the response
        const response = {
            manager_id: Staff_ID,
            subordinates: subordinatesDetails
        };
        res.json(response);
    } catch (error) {
        console.error(`Error in subordinateHierarchy: ${error.message}`);
        next(error);
    }
});

router.get("/managerSubordinates", async (req, res, next) => {
    try {
        const Staff_ID = req.query.Staff_ID;

        if (!Staff_ID) {
            return res.status(400).json({ error: "Staff_ID is required" });
        }

        // Fetch all Manager_Subordinates records
        let [allManagerSubordinates] = await executeQuery(`SELECT * FROM Manager_Subordinates`);

        // Create a map of manager IDs to their subordinates, excluding self-references
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

        // Function to build the hierarchical structure
        async function buildHierarchy(managerId, visited = new Set()) {
            // Prevent infinite loops by checking if we've already visited this manager
            if (visited.has(String(managerId))) {
                return null;
            }
            visited.add(String(managerId));

            const subordinates = subordinatesMap.get(String(managerId)) || [];
            const [managerDetails] = await executeQuery(
                `SELECT Staff_ID, Staff_FName, Staff_LName FROM Employee WHERE Staff_ID = ${managerId}`
            );

            const manager = {
                Staff_ID: managerId,
                Staff_FName: managerDetails[0]?.Staff_FName,
                Staff_LName: managerDetails[0]?.Staff_LName,
                subordinates: []
            };

            for (const subId of subordinates) {
                if (subordinatesMap.has(String(subId))) {
                    // This subordinate is also a manager
                    const subManager = await buildHierarchy(subId, new Set(visited));
                    if (subManager) {
                        manager.subordinates.push(subManager);
                    }
                } else {
                    // This is a regular employee
                    const [employeeDetails] = await executeQuery(
                        `SELECT Staff_ID, Staff_FName, Staff_LName FROM Employee WHERE Staff_ID = ${subId}`
                    );
                    manager.subordinates.push({
                        Staff_ID: subId,
                        Staff_FName: employeeDetails[0]?.Staff_FName,
                        Staff_LName: employeeDetails[0]?.Staff_LName
                    });
                }
            }

            return manager;
        }

        // Build the hierarchy starting from the requested Staff_ID
        const hierarchy = await buildHierarchy(Staff_ID);

        res.json(hierarchy);
    } catch (error) {
        console.error(`Error in managerSubordinates: ${error.message}`);
        next(error);
    }
});
export default router;
