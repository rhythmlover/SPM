-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;
-- Clear table first
TRUNCATE TABLE WFH_Request;
-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert dummy data
INSERT INTO `WFH_Request` (Staff_ID, Request_Date, Request_Period, Request_Reason, Status, WFH_Date, Approver_ID, Approval_Comments, Approval_Date)
VALUES 
(140002, '2024-10-15', 'FULL', 'Family emergency', 'Pending', '2024-10-25', NULL, NULL, NULL),
(140003, '2024-10-15', 'AM', 'Doctor appointment', 'Pending', '2024-10-25', NULL, NULL, NULL),
(140004, '2024-10-16', 'PM', 'Child appointment', 'Pending', '2024-10-22', NULL, NULL, NULL),
(140115, '2024-10-13', 'FULL', 'Appointment', 'Pending', '2024-10-19', NULL, NULL, NULL);

SELECT * from WFH_Request;