-- Drop existing tables if they exist
DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `Access_Log`;
DROP TABLE IF EXISTS `WFH_Approval`;
DROP TABLE IF EXISTS `WFH_Request`;
DROP TABLE IF EXISTS `Employee`;
DROP TABLE IF EXISTS `Department`;
DROP TABLE IF EXISTS `Role`;
DROP TABLE IF EXISTS `Temp_Employee`;

CREATE TABLE IF NOT EXISTS `Employee` (
    `Staff_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `Staff_FName` VARCHAR(50) CHARACTER SET utf8,
    `Staff_LName` VARCHAR(50) CHARACTER SET utf8,
    `Dept_ID` INT,
    `Position` VARCHAR(50) CHARACTER SET utf8,
    `Country` VARCHAR(50) CHARACTER SET utf8,
    `Email` VARCHAR(100) CHARACTER SET utf8,
    `Reporting_Manager` INT DEFAULT NULL,
    `Role_ID` INT
);

CREATE TABLE IF NOT EXISTS `Role` (
    `Role_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `Role_Name` VARCHAR(50) CHARACTER SET utf8
);

CREATE TABLE IF NOT EXISTS `Department` (
    `Dept_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `Dept_Name` VARCHAR(50) CHARACTER SET utf8
);

CREATE TABLE IF NOT EXISTS `WFH_Request` (
    `Request_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `Staff_ID` INT,
    `Request_Date` DATE, 						-- The date when the request was made
    `Request_Period` VARCHAR(5), 				-- AM, PM, FULL
    `Request_Reason` TEXT CHARACTER SET utf8,
    `Status` VARCHAR(20) CHARACTER SET utf8,	-- Pending, Approved, Rejected
    `WFH_Date` DATE,							-- The WFH date that this request is requesting
    `Approver_ID` INT NULL,
    `Approval_Comments` TEXT CHARACTER SET utf8 NULL,
	`Approval_Date` DATE NULL,					-- The date when the request was approved
);

CREATE TABLE IF NOT EXISTS `Access_Log` (
    `Log_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `Accessed_By` INT,
    `Accessed_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `Accessed_Data` TEXT CHARACTER SET utf8
);

CREATE TABLE IF NOT EXISTS `Notification` (
    `Notification_ID` INT PRIMARY KEY AUTO_INCREMENT,
    `Recipient_ID` INT,
    `Request_ID` INT,
    `Notification_Type` VARCHAR(20) CHARACTER SET utf8,
    `Message` TEXT CHARACTER SET utf8,
    `Date_Sent` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Foreign keys for Employee table
ALTER TABLE `Employee` 
ADD CONSTRAINT `fk_employee_department` FOREIGN KEY (`Dept_ID`) REFERENCES `Department`(`Dept_ID`),
ADD CONSTRAINT `fk_employee_role` FOREIGN KEY (`Role_ID`) REFERENCES `Role`(`Role_ID`),
ADD CONSTRAINT `fk_employee_manager` FOREIGN KEY (`Reporting_Manager`) REFERENCES `Employee`(`Staff_ID`);

-- Foreign keys for WFH_Request table
ALTER TABLE `WFH_Request`
ADD CONSTRAINT `fk_wfh_request_staff` FOREIGN KEY (`Staff_ID`) REFERENCES `Employee`(`Staff_ID`),
ADD CONSTRAINT `fk_wfh_request_approver` FOREIGN KEY (`Approver_ID`) REFERENCES `Employee`(`Staff_ID`);

-- Foreign key for Access_Log table
ALTER TABLE `Access_Log`
ADD CONSTRAINT `fk_access_log_employee` FOREIGN KEY (`Accessed_By`) REFERENCES `Employee`(`Staff_ID`);

-- Foreign keys for Notification table
ALTER TABLE `Notification`
ADD CONSTRAINT `fk_notification_recipient` FOREIGN KEY (`Recipient_ID`) REFERENCES `Employee`(`Staff_ID`),
ADD CONSTRAINT `fk_notification_request` FOREIGN KEY (`Request_ID`) REFERENCES `WFH_Request`(`Request_ID`);

CREATE TABLE IF NOT EXISTS Temp_Employee (
    Staff_ID INT PRIMARY KEY,
    Staff_FName VARCHAR(50),
    Staff_LName VARCHAR(50),
    Dept VARCHAR(50),
    `Position` VARCHAR(50),
    Country VARCHAR(50),
    Email VARCHAR(100),
    Reporting_Manager INT,
    Role INT
);


INSERT INTO `Temp_Employee` VALUES (130002,'Jack','Sim','CEO','MD','Singapore','jack.sim@allinone.com.sg',130002,1),
	(140001,'Derek','Tan','Sales','Director','Singapore','Derek.Tan@allinone.com.sg',130002,1),
	(150008,'Eric','Loh','Solutioning','Director','Singapore','Eric.Loh@allinone.com.sg',130002,1),
	(151408,'Philip','Lee','Engineering','Director','Singapore','Philip.Lee@allinone.com.sg',130002,1),
	(140894,'Rahim','Khalid','Sales','Sales Manager','Singapore','Rahim.Khalid@allinone.com.sg',140001,3),
	(140002,'Susan','Goh','Sales','Account Manager','Singapore','Susan.Goh@allinone.com.sg',140894,2),
	(140003,'Janice','Chan','Sales','Account Manager','Singapore','Janice.Chan@allinone.com.sg',140894,2),
	(140004,'Mary','Teo','Sales','Account Manager','Singapore','Mary.Teo@allinone.com.sg',140894,2),
	(140015,'Oliva','Lim','Sales','Account Manager','Singapore','Oliva.Lim@allinone.com.sg',140894,2),
	(140025,'Emma','Heng','Sales','Account Manager','Singapore','Emma.Heng@allinone.com.sg',140894,2),
	(140036,'Charlotte','Wong','Sales','Account Manager','Singapore','Charlotte.Wong@allinone.com.sg',140894,2),
	(140078,'Amelia','Ong','Sales','Account Manager','Singapore','Amelia.Ong@allinone.com.sg',140894,2),
	(140102,'Eva','Yong','Sales','Account Manager','Singapore','Eva.Yong@allinone.com.sg',140894,2),
	(140108,'Liam','The','Sales','Account Manager','Singapore','Liam.The@allinone.com.sg',140894,2),
	(140115,'Noah','Ng','Sales','Account Manager','Singapore','Noah.Ng@allinone.com.sg',140894,2),
	(140525,'Oliver','Tan','Sales','Account Manager','Singapore','Oliver.Tan@allinone.com.sg',140894,2),
	(140736,'William','Fu','Sales','Account Manager','Singapore','William.Fu@allinone.com.sg',140894,2),
	(140878,'James','Tong','Sales','Account Manager','Singapore','James.Tong@allinone.com.sg',140894,2),
	(140880,'Heng','Chan','Sales','Account Manager','Singapore','Heng.Chan@allinone.com.sg',140008,2),
	(140881,'Rina','Tan','Sales','Account Manager','Singapore','Rina.Tan@allinone.com.sg',140008,2),
	(140882,'Boun','Souk','Sales','Account Manager','Singapore','Boun.Souk@allinone.com.sg',140008,2),
	(140883,'Aung','Kyaw','Sales','Account Manager','Singapore','Aung.Kyaw@allinone.com.sg',140008,2),
	(140886,'Thuy','Nguyen','Sales','Account Manager','Singapore','Thuy.Nguyen@allinone.com.sg',140008,2),
	(140887,'Rajesh','Kumar','Sales','Account Manager','Singapore','Rajesh.Kumar@allinone.com.sg',140008,2),
	(140888,'Koh','Lim','Sales','Account Manager','Singapore','Koh.Lim@allinone.com.sg',140008,2),
	(140889,'Somchai','Somboon','Sales','Account Manager','Singapore','Somchai.Somboon@allinone.com.sg',140008,2),
	(140890,'Seng','Lee','Sales','Account Manager','Singapore','Seng.Lee@allinone.com.sg',140008,2),
	(140891,'Anh','Tran','Sales','Account Manager','Singapore','Anh.Tran@allinone.com.sg',140008,2),
	(140892,'Ratana','Chen','Sales','Account Manager','Singapore','Ratana.Chen@allinone.com.sg',140008,2),
	(140893,'Bui','Nguyen','Sales','Account Manager','Singapore','Bui.Nguyen@allinone.com.sg',140103,2),
	(140895,'Dewi','Putri','Sales','Account Manager','Singapore','Dewi.Putri@allinone.com.sg',140103,2),
	(140898,'Sokha','Seng','Sales','Account Manager','Singapore','Sokha.Seng@allinone.com.sg',140103,2),
	(140900,'Tuan','Nguyen','Sales','Account Manager','Singapore','Tuan.Nguyen@allinone.com.sg',140103,2),
	(140901,'Bao','Luu','Sales','Account Manager','Singapore','Bao.Luu@allinone.com.sg',140103,2),
	(140940,'Siti','Ahmad','Sales','Account Manager','Singapore','Siti.Ahmad@allinone.com.sg',140879,2),
	(140941,'Chandra','Rai','Sales','Account Manager','Singapore','Chandra.Rai@allinone.com.sg',140879,2),
	(140942,'Ratana','Keo','Sales','Account Manager','Singapore','Ratana.Keo@allinone.com.sg',140879,2),
	(140945,'Wai','Yong','Sales','Account Manager','Singapore','Wai.Yong@allinone.com.sg',140879,2),
	(140947,'Thi','Pham','Sales','Account Manager','Singapore','Thi.Pham@allinone.com.sg',140879,2),
	(140948,'Nara','Sok','Sales','Account Manager','Singapore','Nara.Sok@allinone.com.sg',140879,2),
	(140008,'Jaclyn','Lee','Sales','Sales Manager','Singapore','Jaclyn.Lee@allinone.com.sg',140001,3),
	(140927,'Chin','Lim','Sales','Account Manager','Hong Kong','Chin.Lim@allinone.com.hk',140879,2),
	(140928,'Sok','Chhay','Sales','Account Manager','Hong Kong','Sok.Chhay@allinone.com.hk',140879,2),
	(140929,'Tat','Nguyen','Sales','Account Manager','Hong Kong','Tat.Nguyen@allinone.com.hk',140879,2),
	(140933,'Hlaing','Sithu','Sales','Account Manager','Hong Kong','Hlaing.Sithu@allinone.com.hk',140879,2),
	(140934,'Santhi','Perumal','Sales','Account Manager','Hong Kong','Santhi.Perumal@allinone.com.hk',140879,2),
	(140935,'Hakim','Siregar','Sales','Account Manager','Hong Kong','Hakim.Siregar@allinone.com.hk',140879,2),
	(140937,'Sirirat','Chaiyaporn','Sales','Account Manager','Hong Kong','Sirirat.Chaiyaporn@allinone.com.hk',140879,2),
	(140938,'Chinh','Tran','Sales','Account Manager','Hong Kong','Chinh.Tran@allinone.com.hk',140879,2),
	(140103,'Sophia','Toh','Sales','Sales Manager','Singapore','Sophia.Toh@allinone.com.sg',140001,3),
	(140910,'Rina','Siriporn','Sales','Account Manager','Indonesia ','Rina.Siriporn@allinone.com.id',140879,2),
	(140911,'Minh','Ly','Sales','Account Manager','Indonesia ','Minh.Ly@allinone.com.id',140944,2),
	(140912,'Chandara','Kim','Sales','Account Manager','Indonesia ','Chandara.Kim@allinone.com.id',140944,2),
	(140917,'Heng','Phan','Sales','Account Manager','Indonesia ','Heng.Phan@allinone.com.id',140944,2),
	(140918,'Nara','Khun','Sales','Account Manager','Indonesia ','Nara.Khun@allinone.com.id',140944,2),
	(140919,'Priya','Malik','Sales','Account Manager','Indonesia ','Priya.Malik@allinone.com.id',140944,2),
	(140879,'Siti','Abdullah','Sales','Sales Manager','Singapore','Siti.Abdullah@allinone.com.sg',140001,3),
	(140903,'Amara','Singh','Sales','Account Manager','Malaysia','Amara.Singh@allinone.com.my',140944,2),
	(140904,'Srey','Mao','Sales','Account Manager','Malaysia','Srey.Mao@allinone.com.my',140944,2),
	(140905,'Phuc','Le','Sales','Account Manager','Malaysia','Phuc.Le@allinone.com.my',140944,2),
	(140908,'Arifin','Saputra','Sales','Account Manager','Malaysia','Arifin.Saputra@allinone.com.my',140944,2),
	(140909,'Siti','Salleh','Sales','Account Manager','Malaysia','Siti.Salleh@allinone.com.my',140944,2),
	(140944,'Yee','Lim','Sales','Sales Manager','Singapore','Yee.Lim@allinone.com.sg',140001,3),
	(140923,'Ngoc','Trinh','Sales','Account Manager','Vietnam','Ngoc.Trinh@allinone.com.vn',140944,2),
	(140924,'Manoj','Kumar','Sales','Account Manager','Vietnam','Manoj.Kumar@allinone.com.vn',140944,2),
	(140925,'Anh','Pham','Sales','Account Manager','Vietnam','Anh.Pham@allinone.com.vn',140944,2),
	(140926,'Somsak','Somsri','Sales','Account Manager','Vietnam','Somsak.Somsri@allinone.com.vn',140944,2),
	(150143,'John','Lim','Engineering','Senior Engineers','Singapore','John.Lim@allinone.com.sg',151408,2),
	(150065,'Noah','Goh','Engineering','Senior Engineers','Singapore','Noah.Goh@allinone.com.sg',151408,2),
	(150075,'Liam','Tan','Engineering','Senior Engineers','Singapore','Liam.Tan@allinone.com.sg',151408,2),
	(150076,'Oliver','Chan','Engineering','Junior Engineers','Singapore','Oliver.Chan@allinone.com.sg',151408,2),
	(150085,'Michael','Ng','Engineering','Junior Engineers','Singapore','Michael.Ng@allinone.com.sg',151408,2),
	(150095,'Alexander','The','Engineering','Junior Engineers','Singapore','Alexander.The@allinone.com.sg',151408,2),
	(150096,'Ethan','Tan','Engineering','Junior Engineers','Singapore','Ethan.Tan@allinone.com.sg',151408,2),
	(150115,'Jaclyn','Poh','Engineering','Junior Engineers','Singapore','Jaclyn.Poh@allinone.com.sg',151408,2),
	(150118,'William','Teo','Engineering','Junior Engineers','Singapore','William.Teo@allinone.com.sg',151408,2),
	(150125,'Mary','Ma','Engineering','Junior Engineers','Singapore','Mary.Ma@allinone.com.sg',151408,2),
	(150126,'Oliva','Lam','Engineering','Junior Engineers','Singapore','Oliva.Lam@allinone.com.sg',151408,2),
	(150138,'Daniel','Fu','Engineering','Junior Engineers','Singapore','Daniel.Fu@allinone.com.sg',151408,2),
	(150142,'James','Lee','Engineering','Junior Engineers','Singapore','James.Lee@allinone.com.sg',151408,2),
	(150245,'Benjamin','Tan','Engineering','Call Centre','Singapore','Benjamin.Tan@allinone.com.sg',151408,2),
	(150148,'Jack','Heng','Engineering','Call Centre','Singapore','Jack.Heng@allinone.com.sg',151408,2),
	(150155,'Derek','Wong','Engineering','Call Centre','Singapore','Derek.Wong@allinone.com.sg',151408,2),
	(150162,'Jacob','Tong','Engineering','Call Centre','Singapore','Jacob.Tong@allinone.com.sg',151408,2),
	(150163,'Logan','Loh','Engineering','Call Centre','Singapore','Logan.Loh@allinone.com.sg',151408,2),
	(150165,'Jacob','Ming','Engineering','Call Centre','Singapore','Jacob.Ming@allinone.com.sg',151408,2),
	(150166,'James','Fu','Engineering','Call Centre','Singapore','James.Fu@allinone.com.sg',151408,2),
	(150168,'John','Fu','Engineering','Call Centre','Singapore','John.Fu@allinone.com.sg',151408,2),
	(150175,'Jack','Tan','Engineering','Call Centre','Singapore','Jack.Tan@allinone.com.sg',151408,2),
	(150192,'Derek','Heng','Engineering','Call Centre','Singapore','Derek.Heng@allinone.com.sg',151408,2),
	(150193,'Benjamin','Wong','Engineering','Call Centre','Singapore','Benjamin.Wong@allinone.com.sg',151408,2),
	(150198,'Lucas','Ong','Engineering','Call Centre','Singapore','Lucas.Ong@allinone.com.sg',151408,2),
	(150205,'Ethan','Yong','Engineering','Call Centre','Singapore','Ethan.Yong@allinone.com.sg',151408,2),
	(150208,'Daniel','Tong','Engineering','Call Centre','Singapore','Daniel.Tong@allinone.com.sg',151408,2),
	(150215,'Jacob','Lee','Engineering','Call Centre','Singapore','Jacob.Lee@allinone.com.sg',151408,2),
	(150216,'Logan','Lim','Engineering','Call Centre','Singapore','Logan.Lim@allinone.com.sg',151408,2),
	(150232,'Jackson','Loh','Engineering','Call Centre','Singapore','Jackson.Loh@allinone.com.sg',151408,2),
	(150233,'Aiden','Tan','Engineering','Call Centre','Singapore','Aiden.Tan@allinone.com.sg',151408,2),
	(150238,'Samuel','Tong','Engineering','Call Centre','Singapore','Samuel.Tong@allinone.com.sg',151408,2),
	(150345,'William','Heng','Engineering','Senior Engineers','Singapore','William.Heng@allinone.com.sg',151408,2),
	(150258,'Daniel','Heng','Engineering','Senior Engineers','Singapore','Daniel.Heng@allinone.com.sg',151408,2),
	(150265,'Jaclyn','Tong','Engineering','Senior Engineers','Singapore','Jaclyn.Tong@allinone.com.sg',151408,2),
	(150275,'Mary','Fu','Engineering','Junior Engineers','Singapore','Mary.Fu@allinone.com.sg',151408,2),
	(150276,'Oliva','Loh','Engineering','Junior Engineers','Singapore','Oliva.Loh@allinone.com.sg',151408,2),
	(150282,'Jacob','Wong','Engineering','Junior Engineers','Singapore','Jacob.Wong@allinone.com.sg',151408,2),
	(150283,'Logan','Ong','Engineering','Junior Engineers','Singapore','Logan.Ong@allinone.com.sg',151408,2),
	(150288,'Jackson','Yong','Engineering','Junior Engineers','Singapore','Jackson.Yong@allinone.com.sg',151408,2),
	(150295,'Aiden','Toh','Engineering','Junior Engineers','Singapore','Aiden.Toh@allinone.com.sg',151408,2),
	(150318,'Emma','Tan','Engineering','Junior Engineers','Singapore','Emma.Tan@allinone.com.sg',151408,2),
	(150342,'Charlotte','Tan','Engineering','Junior Engineers','Singapore','Charlotte.Tan@allinone.com.sg',151408,2),
	(150343,'Amelia','Tan','Engineering','Junior Engineers','Singapore','Amelia.Tan@allinone.com.sg',151408,2),
	(150555,'Jaclyn','Wong','Engineering','Call Centre','Singapore','Jaclyn.Wong@allinone.com.sg',151408,2),
	(150348,'Eva','Goh','Engineering','Call Centre','Singapore','Eva.Goh@allinone.com.sg',151408,2),
	(150355,'Sophia','Chan','Engineering','Call Centre','Singapore','Sophia.Chan@allinone.com.sg',151408,2),
	(150356,'James','Wong','Engineering','Call Centre','Singapore','James.Wong@allinone.com.sg',151408,2),
	(150398,'John','Ong','Engineering','Call Centre','Singapore','John.Ong@allinone.com.sg',151408,2),
	(150422,'Jack','Yong','Engineering','Call Centre','Singapore','Jack.Yong@allinone.com.sg',151408,2),
	(150423,'Derek','Toh','Engineering','Call Centre','Singapore','Derek.Toh@allinone.com.sg',151408,2),
	(150428,'Benjamin','The','Engineering','Call Centre','Singapore','Benjamin.The@allinone.com.sg',151408,2),
	(150435,'Lucas','Ng','Engineering','Call Centre','Singapore','Lucas.Ng@allinone.com.sg',151408,2),
	(150445,'Ethan','Loh','Engineering','Call Centre','Singapore','Ethan.Loh@allinone.com.sg',151408,2),
	(150446,'Daniel','Tan','Engineering','Call Centre','Singapore','Daniel.Tan@allinone.com.sg',151408,2),
	(150488,'Jacob','Tan','Engineering','Call Centre','Singapore','Jacob.Tan@allinone.com.sg',151408,2),
	(150512,'Logan','Tan','Engineering','Call Centre','Singapore','Logan.Tan@allinone.com.sg',151408,2),
	(150513,'Jackson','Goh','Engineering','Call Centre','Singapore','Jackson.Goh@allinone.com.sg',151408,2),
	(150518,'Aiden','Chan','Engineering','Call Centre','Singapore','Aiden.Chan@allinone.com.sg',151408,2),
	(150525,'Samuel','Teo','Engineering','Call Centre','Singapore','Samuel.Teo@allinone.com.sg',151408,2),
	(151410,'Phuong','Dinh','Engineering','Operation Planning Team','Singapore','Phuong.Dinh@allinone.com.sg',151408,2),
	(150866,'Henry','Chan','Engineering','Senior Engineers','Singapore','Henry.Chan@allinone.com.sg',151408,2),
	(150565,'Benjamin','Ong','Engineering','Senior Engineers','Singapore','Benjamin.Ong@allinone.com.sg',151408,2),
	(150566,'Oliva','Ong','Engineering','Senior Engineers','Singapore','Oliva.Ong@allinone.com.sg',151408,2),
	(150585,'Samuel','Tan','Engineering','Junior Engineers','Singapore','Samuel.Tan@allinone.com.sg',151408,2),
	(150608,'Emma','Yong','Engineering','Junior Engineers','Singapore','Emma.Yong@allinone.com.sg',151408,2),
	(150615,'Sophie','Toh','Engineering','Junior Engineers','Singapore','Sophie.Toh@allinone.com.sg',151408,2),
	(150632,'Charlotte','Toh','Engineering','Junior Engineers','Singapore','Charlotte.Toh@allinone.com.sg',151408,2),
	(150633,'Amelia','The','Engineering','Junior Engineers','Singapore','Amelia.The@allinone.com.sg',151408,2),
	(150638,'Eva','Ng','Engineering','Junior Engineers','Singapore','Eva.Ng@allinone.com.sg',151408,2),
	(150645,'Sophia','Tan','Engineering','Junior Engineers','Singapore','Sophia.Tan@allinone.com.sg',151408,2),
	(150655,'Lucas','Goh','Engineering','Junior Engineers','Singapore','Lucas.Goh@allinone.com.sg',151408,2),
	(150695,'William','Tan','Engineering','Junior Engineers','Singapore','William.Tan@allinone.com.sg',151408,2),
	(150705,'Samuel','The','Engineering','Junior Engineers','Singapore','Samuel.The@allinone.com.sg',151408,2),
	(150765,'Liam','Teo','Engineering','Junior Engineers','Singapore','Liam.Teo@allinone.com.sg',151408,2),
	(150776,'Lucas','Yong','Engineering','Junior Engineers','Singapore','Lucas.Yong@allinone.com.sg',151408,2),
	(150796,'Susan','Teo','Engineering','Junior Engineers','Singapore','Susan.Teo@allinone.com.sg',151408,2),
	(150826,'LiamMing','Fu','Engineering','Junior Engineers','Singapore','LiamMing.Fu@allinone.com.sg',151408,2),
	(150845,'Henry','Fu','Engineering','Junior Engineers','Singapore','Henry.Fu@allinone.com.sg',151408,2),
	(150938,'Jani','Tan','Engineering','Junior Engineers','Singapore','Jani.Tan@allinone.com.sg',151408,2),
	(150968,'Noah','Lim','Engineering','Junior Engineers','Singapore','Noah.Lim@allinone.com.sg',151408,2),
	(150976,'Noah','Lee','Engineering','Junior Engineers','Singapore','Noah.Lee@allinone.com.sg',151408,2),
	(150916,'Susan','Ng','Engineering','Operation Planning Team','Singapore','Susan.Ng@allinone.com.sg',151408,2),
	(150918,'Henry','Toh','Engineering','Operation Planning Team','Singapore','Henry.Toh@allinone.com.sg',151408,2),
	(150935,'Susan','Lee','Engineering','Operation Planning Team','Singapore','Susan.Lee@allinone.com.sg',151408,2),
	(151008,'Alexander','Teo','Engineering','Operation Planning Team','Singapore','Alexander.Teo@allinone.com.sg',151408,2),
	(151055,'Liam','Fu','Engineering','Operation Planning Team','Singapore','Liam.Fu@allinone.com.sg',151408,2),
	(151056,'Alexander','Fu','Engineering','Operation Planning Team','Singapore','Alexander.Fu@allinone.com.sg',151408,2),
	(151058,'Janice','Tan','Engineering','Operation Planning Team','Singapore','Janice.Tan@allinone.com.sg',151408,2),
	(151118,'Oliver','Lim','Engineering','Operation Planning Team','Singapore','Oliver.Lim@allinone.com.sg',151408,2),
	(151146,'Janice','Lim','Engineering','Operation Planning Team','Singapore','Janice.Lim@allinone.com.sg',151408,2),
	(151198,'Michael','Tong','Engineering','Operation Planning Team','Singapore','Michael.Tong@allinone.com.sg',151408,2),
	(151266,'Noah','Tong','Engineering','Operation Planning Team','Singapore','Noah.Tong@allinone.com.sg',151408,2),
	(151288,'Mary','Heng','Engineering','Operation Planning Team','Singapore','Mary.Heng@allinone.com.sg',151408,2),
	(151407,'Oliver','Loh','Engineering','Operation Planning Team','Singapore','Oliver.Loh@allinone.com.sg',151408,2),
	(151441,'Minh','Hoang','Engineering','Senior Engineers','Singapore','Minh.Hoang@allinone.com.sg',151408,2),
	(151411,'Bao','Nguyen','Engineering','Junior Engineers','Singapore','Bao.Nguyen@allinone.com.sg',151408,2),
	(151412,'Wati','Halim','Engineering','Junior Engineers','Singapore','Wati.Halim@allinone.com.sg',151408,2),
	(151413,'Seng','Soeun','Engineering','Junior Engineers','Singapore','Seng.Soeun@allinone.com.sg',151408,2),
	(151452,'Rithya','Suon','Engineering','Operation Planning Team','Indonesia ','Rithya.Suon@allinone.com.id',151408,2),
	(151414,'Yun','Lee','Engineering','Operation Planning Team','Indonesia ','Yun.Lee@allinone.com.id',151408,2),
	(160008,'Sally','Loh','HR','Director','Singapore','Sally.Loh@allinone.com.sg',130002,1),
	(170166,'David','Yap','Finance','Director','Singapore','David.Yap@allinone.com.sg',130002,1),
	(180001,'Ernst','Sim','Consultancy','Director','Singapore','Ernst.Sim@allinone.com.sg',130002,1),
	(210001,'Peter','Yap','IT','Director','Singapore','Peter.aypallinone.com.sg',130002,1),
	(190019,'Heng','Sim','Solutioning','Developers','Singapore','Heng.Sim@allinone.com.sg',150008,2),
	(190037,'Susi','Abdullah','Solutioning','Developers','Singapore','Susi.Abdullah@allinone.com.sg',150008,2),
	(190059,'Phuc','Le','Solutioning','Support Team','Singapore','Phuc.Le@allinone.com.sg',150008,2),
	(190067,'Minh','Ly','Solutioning','Support Team','Malaysia','Minh.Ly@allinone.com.sg',150008,2),
	(190070,'Narah','Khun','Solutioning','Support Team','Indonesia ','Narah.Khun@allinone.com.sg',150008,2),
	(190077,'Anhu','Pham','Solutioning','Support Team','Vietnam','Anhu.Pham@allinone.com.sg',150008,2),
	(190086,'Hlaing','Situ','Solutioning','Support Team','Hong Kong','Hlaing.Situ@allinone.com.sg',150008,2),
	(190093,'Chandra','Raj','Solutioning','Support Team','Singapore','Chandra.Raj@allinone.com.sg',150008,2),
	(151505,'Thi','Lam','Engineering','Junior Engineers','Singapore','Thi.Lam@allinone.com.sg',151408,2),
	(151506,'Vannak','Sok','Engineering','Junior Engineers','Singapore','Vannak.Sok@allinone.com.sg',151408,2),
	(151507,'Phuong','Nguyen','Engineering','Junior Engineers','Singapore','Phuong.Nguyen@allinone.com.sg',151408,2),
	(151508,'Srey','Makara','Engineering','Junior Engineers','Singapore','Srey.Makara@allinone.com.sg',151408,2),
	(151509,'Hlaing','Kyaw','Engineering','Junior Engineers','Singapore','Hlaing.Kyaw@allinone.com.sg',151408,2),
	(151512,'Chin','Heng','Engineering','Junior Engineers','Singapore','Chin.Heng@allinone.com.sg',151408,2),
	(151514,'Somchai','Phan','Engineering','Junior Engineers','Singapore','Somchai.Phan@allinone.com.sg',151408,2),
	(151517,'Chinh','Tran','Engineering','Junior Engineers','Singapore','Chinh.Tran@allinone.com.sg',151408,2),
	(151518,'Yee','Liu','Engineering','Call Centre','Singapore','Yee.Liu@allinone.com.sg',151408,2),
	(151520,'Sokunthea','Soy','Engineering','Call Centre','Singapore','Sokunthea.Soy@allinone.com.sg',151408,2),
	(151521,'Champa','Thach','Engineering','Call Centre','Singapore','Champa.Thach@allinone.com.sg',151408,2),
	(151523,'Rahim','Ramli','Engineering','Call Centre','Singapore','Rahim.Ramli@allinone.com.sg',151408,2),
	(151524,'Hakim','Hassan','Engineering','Call Centre','Singapore','Hakim.Hassan@allinone.com.sg',151408,2),
	(151525,'Trung','Le','Engineering','Call Centre','Singapore','Trung.Le@allinone.com.sg',151408,2),
	(151526,'Seng','Chhour','Engineering','Call Centre','Singapore','Seng.Chhour@allinone.com.sg',151408,2),
	(151528,'Phuc','Phung','Engineering','Call Centre','Singapore','Phuc.Phung@allinone.com.sg',151408,2),
	(151533,'Soma','San','Engineering','Call Centre','Singapore','Soma.San@allinone.com.sg',151408,2),
	(151535,'Vannak','Soun','Engineering','Call Centre','Singapore','Vannak.Soun@allinone.com.sg',151408,2),
	(151536,'Kumara','Suon','Engineering','Call Centre','Singapore','Kumara.Suon@allinone.com.sg',151408,2),
	(151539,'Siti','Yusof','Engineering','Junior Engineers','Singapore','Siti.Yusof@allinone.com.sg',151408,2),
	(151540,'Chanh','Sin','Engineering','Junior Engineers','Singapore','Chanh.Sin@allinone.com.sg',151408,2),
	(151541,'Anhu','Tran','Engineering','Junior Engineers','Singapore','Anhu.Tran@allinone.com.sg',151408,2),
	(151543,'Priya','Krishnan','Engineering','Junior Engineers','Singapore','Priya.Krishnan@allinone.com.sg',151408,2),
	(151544,'Nanda','Lal','Engineering','Junior Engineers','Singapore','Nanda.Lal@allinone.com.sg',151408,2),
	(151545,'Rithy','Khun','Engineering','Junior Engineers','Singapore','Rithy.Khun@allinone.com.sg',151408,2),
	(151547,'Koh','Loo','Engineering','Junior Engineers','Singapore','Koh.Loo@allinone.com.sg',151408,2),
	(151549,'Kumari','Pillai','Engineering','Junior Engineers','Singapore','Kumari.Pillai@allinone.com.sg',151408,2),
	(151556,'Thi','Ling','Engineering','Junior Engineers','Singapore','Thi.Ling@allinone.com.sg',151408,2),
	(151558,'Vannak','Seng','Engineering','Junior Engineers','Singapore','Vannak.Seng@allinone.com.sg',151408,2),
	(151560,'Somchai','Kong','Engineering','Junior Engineers','Singapore','Somchai.Kong@allinone.com.sg',151408,2),
	(151561,'Rath','Khun','Engineering','Junior Engineers','Singapore','Rath.Khun@allinone.com.sg',151408,2),
	(151562,'Chinh','Nguyen','Engineering','Call Centre','Singapore','Chinh.Nguyen@allinone.com.sg',151408,2),
	(151563,'Yee','Chong','Engineering','Call Centre','Singapore','Yee.Chong@allinone.com.sg',151408,2),
	(151564,'Heng','Phal','Engineering','Call Centre','Singapore','Heng.Phal@allinone.com.sg',151408,2),
	(151567,'Sokunthea','Seng','Engineering','Call Centre','Singapore','Sokunthea.Seng@allinone.com.sg',151408,2),
	(151570,'Rahim','Harun','Engineering','Call Centre','Singapore','Rahim.Harun@allinone.com.sg',151408,2),
	(151573,'Trung','Nguyen','Engineering','Call Centre','Singapore','Trung.Nguyen@allinone.com.sg',151408,2),
	(151575,'Narong','Savoeun','Engineering','Call Centre','Singapore','Narong.Savoeun@allinone.com.sg',151408,2),
	(151576,'Phuc','Luong','Engineering','Call Centre','Singapore','Phuc.Luong@allinone.com.sg',151408,2),
	(151579,'Soma','Voeun','Engineering','Call Centre','Singapore','Soma.Voeun@allinone.com.sg',151408,2),
	(151580,'Siv','Sothea','Engineering','Call Centre','Singapore','Siv.Sothea@allinone.com.sg',151408,2),
	(151581,'Vannak','Samnang','Engineering','Call Centre','Singapore','Vannak.Samnang@allinone.com.sg',151408,2),
	(151582,'Kumara','Sareth','Engineering','Call Centre','Singapore','Kumara.Sareth@allinone.com.sg',151408,2),
	(151583,'Sok','Kheng','Engineering','Call Centre','Singapore','Sok.Kheng@allinone.com.sg',151408,2),
	(151584,'Siti','Yusuf','Engineering','Call Centre','Singapore','Siti.Yusuf@allinone.com.sg',151408,2),
	(151589,'Anh','Van','Engineering','Junior Engineers','Singapore','Anh.Van@allinone.com.sg',151408,2),
	(151590,'Priya','Kumar','Engineering','Junior Engineers','Malaysia','Priya.Kumar@allinone.com.my',151408,2),
	(151591,'Nanda','Kesavan','Engineering','Junior Engineers','Singapore','Nanda.Kesavan@allinone.com.sg',151408,2),
	(151595,'Mani','Devi','Engineering','Junior Engineers','Singapore','Mani.Devi@allinone.com.sg',151408,2),
	(151596,'Koh','Seng','Engineering','Junior Engineers','Singapore','Koh.Seng@allinone.com.sg',151408,2),
	(151598,'Kumaru','Pillai','Engineering','Junior Engineers','Singapore','Kumaru.Pillai@allinone.com.sg',151408,2),
	(151439,'Ji','Han','Engineering','Senior Engineers','Vietnam','Ji.Han@allinone.com.vn',151408,2),
	(151443,'Anil','Kumar','Engineering','Senior Engineers','Hong Kong','Anil.Kumar@allinone.com.hk',151408,2),
	(151457,'Chandra','Pandey','Engineering','Senior Engineers','Malaysia','Chandra.Pandey@allinone.com.my',151408,2),
	(151471,'Chanh','Ly','Engineering','Senior Engineers','Singapore','Chanh.Ly@allinone.com.sg',151408,2),
	(151600,'Narong','Chua','Engineering','Senior Engineers','Singapore','Narong.Chua@allinone.com.sg',151408,2),
	(151601,'Thi Mih','Ling','Engineering','Operation Planning Team','Singapore','ThiMih.Ling@allinone.com.sg',151408,2),
	(151602,'Vannah','Seng','Engineering','Operation Planning Team','Singapore','Vannah.Seng@allinone.com.sg',151408,2),
	(151603,'Phuong','Truong','Engineering','Operation Planning Team','Singapore','Phuong.Truong@allinone.com.sg',151408,2),
	(151418,'Chandara','Khun','Engineering','Senior Engineers','Vietnam','Chandara.Khun@allinone.com.vn',151408,2),
	(151459,'Phalla','Yong','Engineering','Junior Engineers','Vietnam','Phalla.Yong@allinone.com.vn',151408,2),
	(151481,'Phuc','Lam','Engineering','Junior Engineers','Vietnam','Phuc.Lam@allinone.com.vn',151408,2),
	(151498,'Mani','Prasad','Engineering','Junior Engineers','Vietnam','Mani.Prasad@allinone.com.vn',151408,2),
	(151515,'Rath','Sim','Engineering','Junior Engineers','Vietnam','Rath.Sim@allinone.com.vn',151408,2),
	(151534,'Siv','Savuth','Engineering','Junior Engineers','Vietnam','Siv.Savuth@allinone.com.vn',151408,2),
	(151550,'Narong','Chua','Engineering','Junior Engineers','Vietnam','Narong.Chua@allinone.com.vn',151408,2),
	(151574,'Seng','Sao','Engineering','Junior Engineers','Vietnam','Seng.Sao@allinone.com.vn',151408,2),
	(151593,'Rithy','Sok','Engineering','Junior Engineers','Vietnam','Rithy.Sok@allinone.com.vn',151408,2),
	(151610,'Somchai','Kong','Engineering','Junior Engineers','Vietnam','Somchai.Kong@allinone.com.vn',151408,2),
	(151415,'Aung','Tun','Engineering','Junior Engineers','Singapore','Aung.Tun@allinone.com.sg',151408,2);
INSERT INTO `Temp_Employee` VALUES (151417,'Pich','Sun','Engineering','Junior Engineers','Singapore','Pich.Sun@allinone.com.sg',151408,2),
	(151419,'Heng','Heng','Engineering','Junior Engineers','Singapore','Heng.Heng@allinone.com.sg',151408,2),
	(151420,'Siti','Ismail','Engineering','Junior Engineers','Singapore','Siti.Ismail@allinone.com.sg',151408,2),
	(151426,'Trung','Trinh','Engineering','Junior Engineers','Singapore','Trung.Trinh@allinone.com.sg',151408,2),
	(151427,'Rahul','Sharma','Engineering','Junior Engineers','Singapore','Rahul.Sharma@allinone.com.sg',151408,2),
	(151428,'Champa','Thao','Engineering','Junior Engineers','Singapore','Champa.Thao@allinone.com.sg',151408,2),
	(151430,'Rithy','Chheng','Engineering','Junior Engineers','Singapore','Rithy.Chheng@allinone.com.sg',151408,2),
	(151431,'Mani','Raj','Engineering','Junior Engineers','Singapore','Mani.Raj@allinone.com.sg',151408,2),
	(151432,'Sokunthea','Phan','Engineering','Junior Engineers','Singapore','Sokunthea.Phan@allinone.com.sg',151408,2),
	(151435,'Somnang','Suon','Engineering','Junior Engineers','Singapore','Somnang.Suon@allinone.com.sg',151408,2),
	(151438,'Rath','Phan','Engineering','Junior Engineers','Singapore','Rath.Phan@allinone.com.sg',151408,2),
	(151440,'Sok','Pich','Engineering','Junior Engineers','Singapore','Sok.Pich@allinone.com.sg',151408,2),
	(151425,'Thuy','Phan','Engineering','Senior Engineers','Hong Kong','Thuy.Phan@allinone.com.hk',151408,2),
	(151466,'Siv','Sun','Engineering','Junior Engineers','Hong Kong','Siv.Sun@allinone.com.hk',151408,2),
	(151484,'Phanith','Sok','Engineering','Junior Engineers','Hong Kong','Phanith.Sok@allinone.com.hk',151408,2),
	(151502,'Kumari','Devi','Engineering','Junior Engineers','Hong Kong','Kumari.Devi@allinone.com.hk',151408,2),
	(151519,'Heng','Chhour','Engineering','Junior Engineers','Hong Kong','Heng.Chhour@allinone.com.hk',151408,2),
	(151537,'Sok','Mao','Engineering','Junior Engineers','Hong Kong','Sok.Mao@allinone.com.hk',151408,2),
	(151559,'Nara','Loo','Engineering','Junior Engineers','Hong Kong','Nara.Loo@allinone.com.hk',151408,2),
	(151578,'Chandara','Tith','Engineering','Junior Engineers','Hong Kong','Chandara.Tith@allinone.com.hk',151408,2),
	(151597,'Arifin','Saputra','Engineering','Junior Engineers','Hong Kong','Arifin.Saputra@allinone.com.hk',151408,2),
	(151613,'Yee','Chong','Engineering','Junior Engineers','Hong Kong','Yee.Chong@allinone.com.hk',151408,2),
	(151433,'Mani','Devi','Engineering','Operation Planning Team','Indonesia ','Mani.Devi@allinone.com.id',151408,2),
	(151476,'Hakim','Rahman','Engineering','Operation Planning Team','Indonesia ','Hakim.Rahman@allinone.com.id',151408,2),
	(151493,'Boun','Sok','Engineering','Operation Planning Team','Indonesia ','Boun.Sok@allinone.com.id',151408,2),
	(151510,'Anh','Ly','Engineering','Operation Planning Team','Indonesia ','Anh.Ly@allinone.com.id',151408,2),
	(151527,'Narong','Mao','Engineering','Operation Planning Team','Indonesia ','Narong.Mao@allinone.com.id',151408,2),
	(151546,'Mani','Choudhury','Engineering','Operation Planning Team','Indonesia ','Mani.Choudhury@allinone.com.id',151408,2),
	(151568,'Champa','Pheap','Engineering','Operation Planning Team','Indonesia ','Champa.Pheap@allinone.com.id',151408,2),
	(151585,'Chanh','Tith','Engineering','Operation Planning Team','Indonesia ','Chanh.Tith@allinone.com.id',151408,2),
	(151416,'Vannak','Chen','Engineering','Senior Engineers','Malaysia','Vannak.Chen@allinone.com.my',151408,2),
	(151436,'Samsul','Rahman','Engineering','Junior Engineers','Malaysia','Samsul.Rahman@allinone.com.my',151408,2),
	(151479,'Narong','Chen','Engineering','Junior Engineers','Malaysia','Narong.Chen@allinone.com.my',151408,2),
	(151495,'Samsul','Saifullah','Engineering','Junior Engineers','Malaysia','Samsul.Saifullah@allinone.com.my',151408,2),
	(151513,'Nara','Yong','Engineering','Junior Engineers','Malaysia','Nara.Yong@allinone.com.my',151408,2),
	(151531,'Chandara','Sin','Engineering','Junior Engineers','Malaysia','Chandara.Sin@allinone.com.my',151408,2),
	(151548,'Arifin','Bakar','Engineering','Junior Engineers','Malaysia','Arifin.Bakar@allinone.com.my',151408,2),
	(151571,'Hakim','Sulaiman','Engineering','Junior Engineers','Malaysia','Hakim.Sulaiman@allinone.com.my',151408,2),
	(151444,'Chinh','Le','Engineering','Senior Engineers','Singapore','Chinh.Le@allinone.com.sg',151408,2),
	(151446,'Seng','Seng','Engineering','Junior Engineers','Singapore','Seng.Seng@allinone.com.sg',151408,2),
	(151447,'Nandah','Kesavan','Engineering','Junior Engineers','Singapore','Nandah.Kesavan@allinone.com.sg',151408,2),
	(151448,'Amirah','Ahmad','Engineering','Junior Engineers','Singapore','Amirah.Ahmad@allinone.com.sg',151408,2),
	(151450,'Sokly','Sok','Engineering','Junior Engineers','Singapore','Sokly.Sok@allinone.com.sg',151408,2),
	(151451,'Trung','Pham','Engineering','Junior Engineers','Singapore','Trung.Pham@allinone.com.sg',151408,2),
	(151456,'Phuc','Vo','Engineering','Junior Engineers','Singapore','Phuc.Vo@allinone.com.sg',151408,2),
	(151458,'Manoj','Singh','Engineering','Junior Engineers','Singapore','Manoj.Singh@allinone.com.sg',151408,2),
	(151464,'Chhaya','Sou','Engineering','Junior Engineers','Singapore','Chhaya.Sou@allinone.com.sg',151408,2),
	(151465,'Soma','Lim','Engineering','Junior Engineers','Singapore','Soma.Lim@allinone.com.sg',151408,2),
	(151467,'Vannak','Mao','Engineering','Junior Engineers','Singapore','Vannak.Mao@allinone.com.sg',151408,2),
	(151468,'Kumara','Seng','Engineering','Junior Engineers','Singapore','Kumara.Seng@allinone.com.sg',151408,2),
	(151469,'Sok','Heng','Engineering','Junior Engineers','Singapore','Sok.Heng@allinone.com.sg',151408,2),
	(151470,'Siti','Saad','Engineering','Junior Engineers','Singapore','Siti.Saad@allinone.com.sg',151408,2),
	(151472,'Anh','Truong','Engineering','Junior Engineers','Singapore','Anh.Truong@allinone.com.sg',151408,2),
	(151477,'Priya','Kaur','Engineering','Junior Engineers','Singapore','Priya.Kaur@allinone.com.sg',151408,2),
	(151480,'Rin','Sok','Engineering','Junior Engineers','Singapore','Rin.Sok@allinone.com.sg',151408,2),
	(151482,'Sok','Chin','Engineering','Junior Engineers','Singapore','Sok.Chin@allinone.com.sg',151408,2),
	(151483,'Chandara','Kong','Engineering','Junior Engineers','Singapore','Chandara.Kong@allinone.com.sg',151408,2),
	(151485,'Heng Meng','Sim','Engineering','Junior Engineers','Singapore','HengMeng.Sim@allinone.com.sg',151408,2),
	(151487,'Nanda','Devan','Engineering','Junior Engineers','Singapore','Nanda.Devan@allinone.com.sg',151408,2),
	(151488,'Pich','Phan','Engineering','Junior Engineers','Singapore','Pich.Phan@allinone.com.sg',151408,2),
	(151489,'Anil','Sarawat','Engineering','Junior Engineers','Singapore','Anil.Sarawat@allinone.com.sg',151408,2),
	(151491,'Nguyen','Tuan','Engineering','Junior Engineers','Singapore','Nguyen.Tuan@allinone.com.sg',151408,2),
	(151492,'Bao','Kim','Engineering','Junior Engineers','Singapore','Bao.Kim@allinone.com.sg',151408,2),
	(151494,'Soma','Khun','Engineering','Junior Engineers','Singapore','Soma.Khun@allinone.com.sg',151408,2),
	(151496,'Rina','Li','Engineering','Junior Engineers','Singapore','Rina.Li@allinone.com.sg',151408,2),
	(151499,'Koh Mong','Seng','Engineering','Junior Engineers','Singapore','KohMong.Seng@allinone.com.sg',151408,2),
	(151500,'Arifin','Siregar','Engineering','Junior Engineers','Singapore','Arifin.Siregar@allinone.com.sg',151408,2),
	(151503,'Narong','Khun','Engineering','Junior Engineers','Singapore','Narong.Khun@allinone.com.sg',151408,2),
	(151605,'Srey','Suon','Engineering','Junior Engineers','Singapore','Srey.Suon@allinone.com.sg',151408,2),
	(151606,'Hlaing','Myat','Engineering','Junior Engineers','Indonesia ','Hlaing.Myat@allinone.com.id',151408,2),
	(151607,'Anh','Vo','Engineering','Junior Engineers','Singapore','Anh.Vo@allinone.com.sg',151408,2),
	(151608,'Chin','Chen','Engineering','Junior Engineers','Malaysia','Chin.Chen@allinone.com.my',151408,2),
	(151609,'Nara','Loo','Engineering','Junior Engineers','Singapore','Nara.Loo@allinone.com.sg',151408,2),
	(151611,'Rith','Khun','Engineering','Junior Engineers','Singapore','Rith.Khun@allinone.com.sg',151408,2),
	(151612,'Chinu','Nguyen','Engineering','Junior Engineers','Singapore','Chinu.Nguyen@allinone.com.sg',151408,2),
	(160075,'James','Tan','HR','HR Team','Singapore','James.Tan@allinone.com.sg',160008,1),
	(160302,'Kumar','Sareth','HR','HR Team','Singapore','Kumar.Sareth@allinone.com.sg',160008,1),
	(160306,'An','Van','HR','LD Team','Singapore','An.Van@allinone.com.sg',160008,2),
	(160318,'Nurong','Chua','HR','Admin Team','Singapore','Nurong.Chua@allinone.com.sg',160008,2),
	(160328,'Hlaing','Myat','HR','LD Team','Singapore','Hlaing.Myat@allinone.com.sg',160008,2),
	(160335,'Yee Meng','Chong','HR','Admin Team','Singapore','YeeMeng.Chong@allinone.com.sg',160008,2),
	(160065,'John','Tan','HR','HR Team','Singapore','John.Tan@allinone.com.sg',160008,1),
	(160076,'Jack','Goh','HR','HR Team','Singapore','Jack.Goh@allinone.com.sg',160008,1),
	(160118,'Derek','Chan','HR','HR Team','Singapore','Derek.Chan@allinone.com.sg',160008,1),
	(160135,'Jaclyn','Ong','HR','HR Team','Singapore','Jaclyn.Ong@allinone.com.sg',160008,1),
	(160142,'Benjamin','Teo','HR','HR Team','Singapore','Benjamin.Teo@allinone.com.sg',160008,1),
	(160143,'Lucas','Lee','HR','HR Team','Singapore','Lucas.Lee@allinone.com.sg',160008,1),
	(160145,'Mary','Wong','HR','HR Team','Singapore','Mary.Wong@allinone.com.sg',160008,1),
	(160146,'Oliva','Yong','HR','HR Team','Singapore','Oliva.Yong@allinone.com.sg',160008,1),
	(160148,'Henry','Lim','HR','HR Team','Singapore','Henry.Lim@allinone.com.sg',160008,1),
	(160155,'Alexander','Heng','HR','HR Team','Singapore','Alexander.Heng@allinone.com.sg',160008,1),
	(160188,'Emma','Toh','HR','HR Team','Singapore','Emma.Toh@allinone.com.sg',160008,1),
	(160212,'Charlotte','The','HR','HR Team','Singapore','Charlotte.The@allinone.com.sg',160008,1),
	(160213,'Amelia','Ng','HR','HR Team','Singapore','Amelia.Ng@allinone.com.sg',160008,1),
	(160218,'Eva','Tan','HR','HR Team','Singapore','Eva.Tan@allinone.com.sg',160008,1),
	(160225,'Sophia','Fu','HR','HR Team','Singapore','Sophia.Fu@allinone.com.sg',160008,1),
	(160258,'Michael','Chen','HR','HR Team','Singapore','Michael.Chen@allinone.com.sg',160008,1),
	(160282,'Ethan','Loo','HR','HR Team','Singapore','Ethan.Loo@allinone.com.sg',160008,1),
	(160283,'Somchai','Pong','HR','HR Team','Singapore','Somchai.Pong@allinone.com.sg',160008,1),
	(160284,'Ruth','Khu','HR','HR Team','Singapore','Ruth.Khu@allinone.com.sg',160008,1),
	(160286,'Chin Min','Nguyen','HR','HR Team','Singapore','ChinMin@allinone.com.sg',160008,1),
	(160287,'Yee','Phal','HR','HR Team','Singapore','Yee.Phal@allinone.com.sg',160008,1),
	(160288,'Heng','Seng','HR','HR Team','Singapore','Heng.Seng@allinone.com.sg',160008,1),
	(160289,'Sokunthea','Pheap','HR','HR Team','Singapore','Sokunthea.Pheap@allinone.com.sg',160008,1),
	(160290,'Champa','Harun','HR','HR Team','Singapore','Champa.Harun@allinone.com.sg',160008,1),
	(160291,'Rahim','Kesavan','HR','HR Team','Singapore','Rahim.Kesavan@allinone.com.sg',160008,1),
	(160293,'Hakim','Pillai','HR','HR Team','Singapore','Hakim.Pillai@allinone.com.sg',160008,1),
	(160294,'Trung','Truong','HR','HR Team','Singapore','Trung.Truong@allinone.com.sg',160008,1),
	(160295,'Seng','Kong','HR','HR Team','Singapore','Seng.Kong@allinone.com.sg',160008,1),
	(160296,'Narong','Luong','HR','HR Team','Singapore','Narong.Luong@allinone.com.sg',160008,1),
	(160297,'Phuc','Tan','HR','HR Team','Singapore','Phuc.Tan@allinone.com.sg',160008,1),
	(160298,'Chandara','Wong','HR','HR Team','Singapore','Chandara.Wong@allinone.com.sg',160008,1),
	(160299,'Soma','Ong','HR','HR Team','Singapore','Soma.Ong@allinone.com.sg',160008,1),
	(160300,'Siv','Tan','HR','HR Team','Singapore','Siv.Tan@allinone.com.sg',160008,1),
	(160301,'Vannak','Goh','HR','HR Team','Singapore','Vannak.Goh@allinone.com.sg',160008,1),
	(160303,'Sok','Chan','HR','LD Team','Singapore','Sok.Chan@allinone.com.sg',160008,2),
	(160304,'Siti','Teo','HR','LD Team','Singapore','Siti.Teo@allinone.com.sg',160008,2),
	(160305,'Chanh','Tith','HR','LD Team','Singapore','Chanh.Tith@allinone.com.sg',160008,2),
	(160307,'Priya','Kumar','HR','LD Team','Singapore','Priya.Kumar@allinone.com.sg',160008,2),
	(160308,'Vannah','Kesavan','HR','LD Team','Singapore','Vannah.Kesavan@allinone.com.sg',160008,2),
	(160313,'Srey','Sok','HR','LD Team','Singapore','Srey.Sok@allinone.com.sg',160008,2),
	(160314,'Hlaing','Devi','HR','LD Team','Singapore','Hlaing.Devi@allinone.com.sg',160008,2),
	(160315,'Anh','Seng','HR','Admin Team','Singapore','Anh.Seng@allinone.com.sg',160008,2),
	(160316,'Chin','Saputra','HR','Admin Team','Singapore','Chin.Saputra@allinone.com.sg',160008,2),
	(160317,'Nara','Pillai','HR','Admin Team','Singapore','Nara.Pillai@allinone.com.sg',160008,2),
	(160323,'Chandara','Ling','HR','LD Team','Singapore','Chandara.Ling@allinone.com.sg',160008,2),
	(160324,'Soma','Seng','HR','LD Team','Singapore','Soma.Seng@allinone.com.sg',160008,2),
	(160325,'Siv','Truong','HR','LD Team','Singapore','Siv.Truong@allinone.com.sg',160008,2),
	(160326,'Vannak','Suon','HR','LD Team','Singapore','Vannak.Suon@allinone.com.sg',160008,2),
	(160329,'Kumara','Vo','HR','LD Team','Singapore','Kumara.Vo@allinone.com.sg',160008,2),
	(160330,'Ruth','Chen','HR','LD Team','Singapore','Ruth.Chen@allinone.com.sg',160008,2),
	(160331,'Chinh','Loo','HR','LD Team','Singapore','Chinh.Loo@allinone.com.sg',160008,2),
	(160332,'Yee','Kong','HR','LD Team','Singapore','Yee.Kong@allinone.com.sg',160008,2),
	(160333,'Heng','Khun','HR','LD Team','Singapore','Heng.Khun@allinone.com.sg',160008,2),
	(160334,'Sokunthe','Nguyen','HR','LD Team','Singapore','Sokunthe.Nguyen@allinone.com.sg',160008,2),
	(160336,'Champa','Phal','HR','Admin Team','Singapore','Champa.Phal@allinone.com.sg',160008,2),
	(160337,'Rahim','Seng','HR','Admin Team','Singapore','Rahim.Seng@allinone.com.sg',160008,2),
	(160338,'Hakim','Pheap','HR','Admin Team','Singapore','Hakim.Pheap@allinone.com.sg',160008,2),
	(160339,'Trung','Harun','HR','Admin Team','Singapore','Trung.Harun@allinone.com.sg',160008,2),
	(171009,'Seng','Kesavan','Finance','Finance Manager','Singapore','Seng.Kesavan@allinone.com.sg',170166,3),
	(171014,'Narong','Pillai','Finance','Finance Manager','Singapore','Narong.Pillai@allinone.com.sg',170166,3),
	(171018,'Ji','Truong','Finance','Finance Manager','Singapore','Ji.Truong@allinone.com.sg',170166,3),
	(171029,'Chandra','Kong','Finance','Finance Manager','Singapore','Chandra.Kong@allinone.com.sg',170166,3),
	(171043,'Rithy','Luong','Finance','Finance Manager','Singapore','Rithy.Luong@allinone.com.sg',170166,3),
	(170208,'Mani','Tan','Finance','Finance Executive','Singapore','Mani.Tan@allinone.com.sg',171009,2),
	(170215,'Sokunthea','Wong','Finance','Finance Executive','Singapore','Sokunthea.Wong@allinone.com.sg',171009,2),
	(170216,'Mani','Ong','Finance','Finance Executive','Singapore','Mani.Ong@allinone.com.sg',171009,2),
	(170232,'Somnang','Tan','Finance','Finance Executive','Singapore','Somnang.Tan@allinone.com.sg',171009,2),
	(170233,'Logan','Goh','Finance','Finance Executive','Singapore','Logan.Goh@allinone.com.sg',171009,2),
	(170238,'Jackson','Chan','Finance','Finance Executive','Singapore','Jackson.Chan@allinone.com.sg',171009,2),
	(170245,'Aiden','Teo','Finance','Finance Executive','Singapore','Aiden.Teo@allinone.com.sg',171009,2),
	(170655,'Samuel','Lee','Finance','Finance Executive','Singapore','Samuel.Lee@allinone.com.sg',171009,2),
	(170866,'Susan','Lim','Finance','Finance Executive','Singapore','Susan.Lim@allinone.com.sg',171009,2),
	(171008,'Janice','Heng','Finance','Finance Executive','Singapore','Janice.Heng@allinone.com.sg',171009,2),
	(171010,'Rithy','Saad','Finance','Finance Executive','Singapore','Rithy.Saad@allinone.com.sg',171014,2),
	(171011,'Mani','Ly','Finance','Finance Executive','Singapore','Mani.Ly@allinone.com.sg',171014,2),
	(171012,'Koh','Truong','Finance','Finance Executive','Singapore','Koh.Truong@allinone.com.sg',171014,2),
	(171013,'Arifin','Rahman','Finance','Finance Executive','Singapore','Arifin.Rahman@allinone.com.sg',171014,2),
	(171015,'Narong','Kaur','Finance','Finance Executive','Singapore','Narong.Kaur@allinone.com.sg',171018,2),
	(171016,'Thi','Chen','Finance','Finance Executive','Singapore','Thi.Chen@allinone.com.sg',171018,2),
	(171017,'Vannah','Sok','Finance','Finance Executive','Singapore','Vannah.Sok@allinone.com.sg',171018,2),
	(171022,'Srey','Lam','Finance','Finance Executive','Singapore','Srey.Lam@allinone.com.sg',171029,2),
	(171023,'Hlaing','Chin','Finance','Finance Executive','Singapore','Hlaing.Chin@allinone.com.sg',171029,2),
	(171024,'Anh','Kong','Finance','Finance Executive','Singapore','Anh.Kong@allinone.com.sg',171029,2),
	(171026,'Chin','Sok','Finance','Finance Executive','Singapore','Chin.Sok@allinone.com.sg',171029,2),
	(171027,'Nara','Devan','Finance','Finance Executive','Singapore','Nara.Devan@allinone.com.sg',171029,2),
	(171044,'Chandara','Phan','Finance','Finance Executive','Singapore','Chandara.Phan@allinone.com.sg',171029,2),
	(171045,'Soma','Sarawat','Finance','Finance Executive','Singapore','Soma.Sarawat@allinone.com.sg',171029,2),
	(171046,'Siv','Tuan','Finance','Finance Executive','Singapore','Siv.Tuan@allinone.com.sg',171029,2),
	(171047,'Vannak','Kim','Finance','Finance Executive','Singapore','Vannak.Kim@allinone.com.sg',171029,2),
	(171048,'Kumara','Sok','Finance','Finance Executive','Singapore','Kumara.Sok@allinone.com.sg',171029,2),
	(171030,'Ruth','Khun','Finance','Finance Executive','Singapore','Ruth.Khun@allinone.com.sg',171043,2),
	(171031,'Chinh','Saifullah','Finance','Finance Executive','Singapore','Chinh.Saifullah@allinone.com.sg',171043,2),
	(171032,'Yee','Li','Finance','Finance Executive','Singapore','Yee.Li@allinone.com.sg',171043,2),
	(171033,'Heng','Prasad','Finance','Finance Executive','Singapore','Heng.Prasad@allinone.com.sg',171043,2),
	(171034,'Sokunthe','Seng','Finance','Finance Executive','Singapore','Sokunthe.Seng@allinone.com.sg',171043,2),
	(171035,'Champa','Siregar','Finance','Finance Executive','Singapore','Champa.Siregar@allinone.com.sg',171043,2),
	(171036,'Rahim','Devi','Finance','Finance Executive','Singapore','Rahim.Devi@allinone.com.sg',171043,2),
	(171038,'Hakim','Myat','Finance','Finance Executive','Singapore','Hakim.Myat@allinone.com.sg',171043,2),
	(171039,'Trung','Chen','Finance','Finance Executive','Singapore','Trung.Chen@allinone.com.sg',171043,2),
	(171041,'Seng','Loo','Finance','Finance Executive','Singapore','Seng.Loo@allinone.com.sg',171043,2),
	(171042,'Narong','Kong','Finance','Finance Executive','Singapore','Narong.Kong@allinone.com.sg',171043,2),
	(180012,'Ji','Khung','Consultancy','Counsultant','Singapore','Ji.Khung@allinone.com.sg',180001,2),
	(180029,'Chandra','Nguyen','Consultancy','Counsultant','Singapore','Chandra.Nguyen@allinone.com.sg',180001,2),
	(180002,'Rithy','Chong','Consultancy','Counsultant','Singapore','Rithy.Chong@allinone.com.sg',180001,2),
	(180003,'Mani','Phalp','Consultancy','Counsultant','Singapore','Mani.Phalp@allinone.com.sg',180001,2),
	(180004,'Sokunthea','Beng','Consultancy','Counsultant','Singapore','Sokunthea.Beng@allinone.com.sg',180001,2),
	(180005,'Mani','Pheap','Consultancy','Counsultant','Singapore','Mani.Pheap@allinone.com.sg',180001,2),
	(180006,'Somnang','Harun','Consultancy','Counsultant','Singapore','Somnang.Harun@allinone.com.sg',180001,2),
	(180010,'Samsul','Rahman','Consultancy','Counsultant','Singapore','Samsul.Rahman@allinone.com.sg',180001,2),
	(180011,'Bui Lui','Phan','Consultancy','Counsultant','Singapore','Bui Lui.Phan@allinone.com.sg',180001,2),
	(180013,'Rahim','Pich','Consultancy','Counsultant','Singapore','Rahim.Pich@allinone.com.sg',180001,2),
	(180014,'Dewi','Hoang','Consultancy','Counsultant','Singapore','Dewi.Hoang@allinone.com.sg',180001,2),
	(180015,'Sokha','Kumar','Consultancy','Counsultant','Singapore','Sokha.Kumar@allinone.com.sg',180001,2),
	(180019,'Tuan','Le','Consultancy','Counsultant','Singapore','Tuan.Le@allinone.com.sg',180001,2),
	(180020,'Bao','Seng','Consultancy','Counsultant','Singapore','Bao.Seng@allinone.com.sg',180001,2),
	(180021,'Amara','Kesavan','Consultancy','Counsultant','Singapore','Amara.Kesavan@allinone.com.sg',180001,2),
	(180022,'Srey','Ahmad','Consultancy','Counsultant','Singapore','Srey.Ahmad@allinone.com.sg',180001,2),
	(180023,'Arifi','Sok','Consultancy','Counsultant','Singapore','Arifi.Sok@allinone.com.sg',180001,2),
	(180025,'Chin','Pham','Consultancy','Counsultant','Singapore','Chin.Pham@allinone.com.sg',180001,2),
	(180026,'Siti','Suon','Consultancy','Counsultant','Singapore','Siti.Suon@allinone.com.sg',180001,2),
	(180027,'Siti','Vo','Consultancy','Counsultant','Singapore','Siti.Vo@allinone.com.sg',180001,2),
	(180030,'Rina','Singh','Consultancy','Counsultant','Singapore','Rina.Singh@allinone.com.sg',180001,2),
	(180032,'Chandara','Yong','Consultancy','Counsultant','Singapore','Chandara.Yong@allinone.com.sg',180001,2),
	(180033,'Heng Meng','Sou','Consultancy','Counsultant','Singapore','Heng Meng.Sou@allinone.com.sg',180001,2),
	(180034,'Priya','Lim','Consultancy','Counsultant','Singapore','Priya.Lim@allinone.com.sg',180001,2),
	(180036,'Ngoc','Sun','Consultancy','Counsultant','Singapore','Ngoc.Sun@allinone.com.sg',180001,2),
	(180037,'Manoj','Mao','Consultancy','Counsultant','Singapore','Manoj.Mao@allinone.com.sg',180001,2),
	(180038,'Somi','Seng','Consultancy','Counsultant','Singapore','Somi.Seng@allinone.com.sg',180001,2),
	(190003,'Chin Meng','Heng','Solutioning','Developers','Singapore','ChinMeng.Heng@allinone.com.sg',150008,2),
	(190004,'Sok','Saad','Solutioning','Developers','Singapore','Sok.Saad@allinone.com.sg',150008,2),
	(190005,'Tatkong','Ly','Solutioning','Developers','Singapore','Tatkong.Ly@allinone.com.sg',150008,2),
	(190006,'Sani','Truong','Solutioning','Developers','Singapore','Sani.Truong@allinone.com.sg',150008,2),
	(190008,'Kakim','Rahman','Solutioning','Developers','Singapore','Kakim.Rahman@allinone.com.sg',150008,2),
	(190009,'Siri','Kaur','Solutioning','Developers','Singapore','Siri.Kaur@allinone.com.sg',150008,2),
	(190010,'Rata','Chen','Solutioning','Developers','Singapore','Rata.Chen@allinone.com.sg',150008,2),
	(190014,'Yee Meng','Sok','Solutioning','Developers','Singapore','Yee Meng.Sok@allinone.com.sg',150008,2),
	(190015,'Wai Wai','Lam','Solutioning','Developers','Singapore','Wai Wai.Lam@allinone.com.sg',150008,2),
	(190016,'Thin','Chin','Solutioning','Developers','Singapore','Thin.Chin@allinone.com.sg',150008,2),
	(190017,'Nara','Kong','Solutioning','Developers','Singapore','Nara.Kong@allinone.com.sg',150008,2),
	(190018,'Manni','Sok','Solutioning','Developers','Singapore','Manni.Sok@allinone.com.sg',150008,2),
	(190021,'An','Devan','Solutioning','Developers','Singapore','An.Devan@allinone.com.sg',150008,2),
	(190022,'Rithe','Phan','Solutioning','Developers','Singapore','Rithe.Phan@allinone.com.sg',150008,2),
	(190024,'Koh Kok','Sarawat','Solutioning','Developers','Singapore','Koh Kok.Sarawat@allinone.com.sg',150008,2),
	(190025,'Arifi','Tuan','Solutioning','Developers','Singapore','Arifi.Tuan@allinone.com.sg',150008,2),
	(190026,'Kumar','Kim','Solutioning','Developers','Singapore','Kumar.Kim@allinone.com.sg',150008,2),
	(190027,'Narong','Sok','Solutioning','Developers','Singapore','Narong.Sok@allinone.com.sg',150008,2),
	(190028,'Thin','Khun','Solutioning','Developers','Singapore','Thin.Khun@allinone.com.sg',150008,2),
	(190029,'Vannak','Saifullah','Solutioning','Developers','Singapore','Vannak.Saifullah@allinone.com.sg',150008,2),
	(190030,'Phuon','Li','Solutioning','Developers','Singapore','Phuon.Li@allinone.com.sg',150008,2),
	(190031,'Sri','Prasad','Solutioning','Developers','Singapore','Sri.Prasad@allinone.com.sg',150008,2),
	(190032,'Haing','Seng','Solutioning','Developers','Singapore','Haing.Seng@allinone.com.sg',150008,2),
	(190033,'Chin Chin','Siregar','Solutioning','Developers','Singapore','Chin Chin.Siregar@allinone.com.sg',150008,2),
	(190035,'Kumari','Devi','Solutioning','Developers','Singapore','Kumari.Devi@allinone.com.sg',150008,2),
	(190036,'Narong','Myat','Solutioning','Developers','Singapore','Narong.Myat@allinone.com.sg',150008,2),
	(190038,'Heng','Chen','Solutioning','Developers','Singapore','Heng.Chen@allinone.com.sg',150008,2),
	(190040,'Rina','Loo','Solutioning','Developers','Singapore','Rina.Loo@allinone.com.sg',150008,2),
	(190041,'Boun','Kong','Solutioning','Developers','Singapore','Boun.Kong@allinone.com.sg',150008,2),
	(190042,'Aung','Khung','Solutioning','Developers','Singapore','Aung.Khung@allinone.com.sg',150008,2),
	(190043,'Thu','Nguyen','Solutioning','Developers','Singapore','Thu.Nguyen@allinone.com.sg',150008,2),
	(190044,'Rajesh','Chong','Solutioning','Developers','Singapore','Rajesh.Chong@allinone.com.sg',150008,2),
	(190045,'Koh','Phalp','Solutioning','Developers','Singapore','Koh.Phalp@allinone.com.sg',150008,2),
	(190046,'Somchai','Seng','Solutioning','Developers','Singapore','Somchai.Seng@allinone.com.sg',150008,2),
	(190047,'Seng','Pheap','Solutioning','Developers','Singapore','Seng.Pheap@allinone.com.sg',150008,2),
	(190048,'Anh','Harun','Solutioning','Developers','Singapore','Anh.Harun@allinone.com.sg',150008,2),
	(190049,'Ratana','Sulaiman','Solutioning','Developers','Singapore','Ratana.Sulaiman@allinone.com.sg',150008,2),
	(190050,'Bui Lui','Nguyen','Solutioning','Developers','Singapore','BuiLui.Nguyen@allinone.com.sg',150008,2),
	(190051,'Rahim','Saon','Solutioning','Developers','Singapore','Rahim.Saon@allinone.com.sg',150008,2),
	(190052,'Dewi','Savoeun','Solutioning','Developers','Singapore','Dewi.Savoeun@allinone.com.sg',150008,2),
	(190054,'Sokha','Luon','Solutioning','Developers','Singapore','Sokha.Luon@allinone.com.sg',150008,2);
INSERT INTO `Temp_Employee` VALUES (190055,'Tuan','Tithe','Solutioning','Developers','Singapore','Tuan.Tithe@allinone.com.sg',150008,2),
	(190056,'Bao','Lu','Solutioning','Developers','Singapore','Bao.Lu@allinone.com.sg',150008,2),
	(190057,'Amara','Singh','Solutioning','Developers','Singapore','Amara.Singh@allinone.com.sg',150008,2),
	(190058,'Srey','Mao','Solutioning','Developers','Singapore','Srey.Mao@allinone.com.sg',150008,2),
	(190064,'Arifi','Sapu','Solutioning','Support Team','Singapore','Arifi.Sapu@allinone.com.sg',150008,2),
	(190091,'Chin','Tran','Solutioning','Support Team','Singapore','Chin.Tran@allinone.com.sg',150008,2),
	(190092,'Siti','Ahmah','Solutioning','Support Team','Singapore','Siti.Ahmah@allinone.com.sg',150008,2),
	(190065,'Siti','Salah','Solutioning','Support Team','Malaysia','Siti.Salah@allinone.com.my',150008,2),
	(190066,'Rina','Siriporn','Solutioning','Support Team','Malaysia','Rina.Siriporn@allinone.com.my',150008,2),
	(190068,'Chandara','Kim','Solutioning','Support Team','Malaysia','Chandara.Kim@allinone.com.my',150008,2),
	(190069,'Heng Meng','Phan','Solutioning','Support Team','Indonesia ','HengMeng.Phan@allinone.com.id',150008,2),
	(190074,'Priya','Maliki','Solutioning','Support Team','Indonesia ','Priya.Maliki@allinone.com.id',150008,2),
	(190075,'Ngoc','Trinh','Solutioning','Support Team','Indonesia ','Ngoc.Trinh@allinone.com.id',150008,2),
	(190076,'Manoj','Kumar','Solutioning','Support Team','Indonesia ','Manoj.Kumar@allinone.com.id',150008,2),
	(190078,'Somi','Somsri','Solutioning','Support Team','Vietnam','Somi.Somsri@allinone.com.vn',150008,2),
	(190079,'Chin','Lim','Solutioning','Support Team','Vietnam','Chin.Lim@allinone.com.vn',150008,2),
	(190080,'Sok','Chay','Solutioning','Support Team','Hong Kong','Sok.Chay@allinone.com.hk',150008,2),
	(190082,'Tatkong','Nguyen','Solutioning','Support Team','Hong Kong','Tatkong.Nguyen@allinone.com.hk',150008,2),
	(190087,'Sani','Perumal','Solutioning','Support Team','Hong Kong','Sani.Perumal@allinone.com.hk',150008,2),
	(190088,'Kakim','Siregar','Solutioning','Support Team','Hong Kong','Kakim.Siregar@allinone.com.hk',150008,2),
	(190089,'Siri','Chaiyaporn','Solutioning','Support Team','Hong Kong','Siri.Chaiyaporn@allinone.com.hk',150008,2),
	(190094,'Rata','Keo','Solutioning','Support Team','Singapore','Rata.Keo@allinone.com.sg',150008,2),
	(190095,'Yee Meng','Lim','Solutioning','Support Team','Singapore','YeeMeng.Lim@allinone.com.sg',150008,2),
	(190096,'Wai Wai','Yong','Solutioning','Support Team','Singapore','WaiWai.Yong@allinone.com.sg',150008,2),
	(190097,'Thin','Pham','Solutioning','Support Team','Singapore','Thin.Pham@allinone.com.sg',150008,2),
	(190098,'Nara','Sook','Solutioning','Support Team','Singapore','Nara.Sook@allinone.com.sg',150008,2),
	(210018,'Manni','Devi','IT','IT Team','Singapore','Manni.Devi@allinone.com.sg',210001,2),
	(210028,'An','Vo','IT','IT Team','Singapore','An.Vo@allinone.com.sg',210001,2),
	(210017,'Rithe','Sok','IT','IT Team','Singapore','Rithe.Sok@allinone.com.sg',210001,2),
	(210019,'Koh Kok','Seng','IT','IT Team','Singapore','KohKok.Seng@allinone.com.sg',210001,2),
	(210020,'Arifi','Saputra','IT','IT Team','Singapore','Arifi.Saputra@allinone.com.sg',210001,2),
	(210021,'Kumar','Pillai','IT','IT Team','Singapore','Kumar.Pillai@allinone.com.sg',210001,2),
	(210022,'Narong','Phua','IT','IT Team','Singapore','Narong.Phua@allinone.com.sg',210001,2),
	(210023,'Thin','Ling','IT','IT Team','Singapore','Thin.Ling@allinone.com.sg',210001,2),
	(210024,'Vannak','Teng','IT','IT Team','Singapore','Vannak.Teng@allinone.com.sg',210001,2),
	(210025,'Phuon','Truong','IT','IT Team','Singapore','Phuon.Truong@allinone.com.sg',210001,2),
	(210026,'Sri','Suon','IT','IT Team','Singapore','Sri.Suon@allinone.com.sg',210001,2),
	(210027,'Haing','Myat','IT','IT Team','Singapore','Haing.Myat@allinone.com.sg',210001,2),
	(210029,'Chin Chin','Chen','IT','IT Team','Singapore','ChinChin.Chen@allinone.com.sg',210001,2),
	(210030,'Narah','Loo','IT','IT Team','Singapore','Narah.Loo@allinone.com.sg',210001,2),
	(210031,'Somachai','Kong','IT','IT Team','Singapore','Somachai.Kong@allinone.com.sg',210001,2),
	(210032,'Rath','Khung','IT','IT Team','Singapore','Rath.Khung@allinone.com.sg',210001,2),
	(210033,'Chin','Nguyen','IT','IT Team','Singapore','Chin.Nguyen@allinone.com.sg',210001,2),
	(210034,'Yee Seng','Chong','IT','IT Team','Singapore','YeeSeng.Chong@allinone.com.sg',210001,2),
	(210035,'Heng','Phalp','IT','IT Team','Singapore','Heng.Phalp@allinone.com.sg',210001,2),
	(210036,'Sokuntheap','Seng','IT','IT Team','Singapore','Sokuntheap.Seng@allinone.com.sg',210001,2),
	(210037,'Champan','Pheap','IT','IT Team','Singapore','Champan.Pheap@allinone.com.sg',210001,2),
	(210038,'Kahim','Harun','IT','IT Team','Singapore','Kahim.Harun@allinone.com.sg',210001,2),
	(210039,'Halim','Sulaiman','IT','IT Team','Singapore','Halim.Sulaiman@allinone.com.sg',210001,2),
	(210040,'Trong','Nguyen','IT','IT Team','Singapore','Trong.Nguyen@allinone.com.sg',210001,2),
	(210041,'Seng','Saon','IT','IT Team','Singapore','Seng.Saon@allinone.com.sg',210001,2),
	(210042,'Naron','Savoeun','IT','IT Team','Singapore','Naron.Savoeun@allinone.com.sg',210001,2),
	(210043,'Phuc','Luon','IT','IT Team','Singapore','Phuc.Luon@allinone.com.sg',210001,2),
	(210044,'Chandara','Tithe','IT','IT Team','Singapore','tithe.chandra@allinone.com.sg',210001,2);


INSERT INTO Department (Dept_Name)
SELECT DISTINCT Dept
FROM Temp_Employee;

INSERT INTO Role (Role_Name)
SELECT DISTINCT Role
FROM Temp_Employee;

-- Disable foreign key checks
SET foreign_key_checks = 0;

-- INSERT INTO Employee (Staff_ID, Staff_FName, Staff_LName, Dept_ID, Position, Country, Email, Reporting_Manager, Role_ID)
-- SELECT
--     e.Staff_ID, e.Staff_FName, e.Staff_LName, d.Dept_ID, e.Position, e.Country, e.Email, e.Reporting_Manager, r.Role_ID
-- FROM Temp_Employee e
-- JOIN Department d ON e.Dept = d.Dept_Name
-- JOIN Role r ON e.Role = r.Role_Name;
-- Insert Employees into the Employee table

INSERT INTO Employee (Staff_ID, Staff_FName, Staff_LName, Dept_ID, Position, Country, Email, Reporting_Manager, Role_ID)
SELECT
    e.Staff_ID, e.Staff_FName, e.Staff_LName, d.Dept_ID, e.Position, e.Country, e.Email, e.Reporting_Manager, r.Role_ID
FROM Temp_Employee e
JOIN Department d ON e.Dept = d.Dept_Name
JOIN Role r ON e.Role = r.Role_Name;

UPDATE Role
SET Role_Name = CASE
    WHEN Role_Name = '1' THEN 'HR'
    WHEN Role_Name = '2' THEN 'IT'
    WHEN Role_Name = '3' THEN 'Finance'
    ELSE 'Unknown'
END;

-- Enable foreign key checks
SET foreign_key_checks = 1;

DROP TABLE Temp_Employee;


-- -- Create the Subordinate_Mapping table
-- CREATE TABLE IF NOT EXISTS `Subordinate_Mapping` (
--     `Manager_ID` INT,          -- Manager or supervisor's Staff ID
--     `Subordinate_ID` INT,      -- Subordinate's Staff ID
--     PRIMARY KEY (`Manager_ID`, `Subordinate_ID`),   -- Composite primary key
--     FOREIGN KEY (`Manager_ID`) REFERENCES `Employee`(`Staff_ID`) ON DELETE CASCADE,
--     FOREIGN KEY (`Subordinate_ID`) REFERENCES `Employee`(`Staff_ID`) ON DELETE CASCADE
-- );
-- -- Insert mappings into the Subordinate_Mapping table
-- INSERT INTO `Subordinate_Mapping` (Manager_ID, Subordinate_ID)
-- SELECT 
--     e1.Staff_ID AS Manager_ID,
--     e2.Staff_ID AS Subordinate_ID
-- FROM 
--     Employee e1
-- JOIN 
--     Employee e2 ON e1.Staff_ID = e2.Reporting_Manager
-- WHERE 
--     e1.Position LIKE '%MD%'
--     OR e1.Position LIKE '%Director%'
--     OR e1.Position LIKE '%Manager%';

-- Increase the GROUP_CONCAT max length limit
SET SESSION group_concat_max_len = 1000000;
-- Create the Manager_Subordinates table
DROP TABLE IF EXISTS `Manager_Subordinates`;
CREATE TABLE IF NOT EXISTS `Manager_Subordinates` (
    `Manager_ID` INT PRIMARY KEY,         -- Manager's Staff ID
    `Subordinates` TEXT,                  -- Concatenated list of subordinates
    FOREIGN KEY (`Manager_ID`) REFERENCES `Employee`(`Staff_ID`) ON DELETE CASCADE
);
-- Insert mappings into the Manager_Subordinates table
INSERT INTO `Manager_Subordinates` (Manager_ID, Subordinates)
SELECT 
    e1.Staff_ID AS Manager_ID,
    GROUP_CONCAT(DISTINCT e2.Staff_ID ORDER BY e2.Staff_ID SEPARATOR ', ') AS Subordinates
FROM 
    Employee e1
JOIN 
    Employee e2 ON e1.Staff_ID = e2.Reporting_Manager
WHERE 
    e1.Position LIKE '%MD%'
    OR e1.Position LIKE '%Director%'
    OR e1.Position LIKE '%Manager%'
GROUP BY 
    e1.Staff_ID;