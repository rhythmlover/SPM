-- Clear table first
-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE WFH_Request;
TRUNCATE TABLE WFH_Request_Dates;
-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert dummy data
INSERT INTO `WFH_Request` (Staff_ID, Request_Date, Reason, `Status`, Approver_ID) VALUES (171015,'2024-10-15','Some comments here','Approved',171018);
INSERT INTO `WFH_Request_Dates` (Request_ID, WFH_Date, WFH_Time) VALUES (1,'2024-10-15', '10:00-12:00,12:00-18:00');

SELECT * from WFH_Request;
SELECT * from WFH_Request_Dates;