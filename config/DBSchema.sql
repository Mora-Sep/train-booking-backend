

DROP DATABASE IF EXISTS project_database;
DROP DATABASE IF EXISTS railway;

CREATE DATABASE railway;

USE railway;

-- drop_all_users_roles()

DROP USER IF EXISTS 'adminAccount'@'%';
DROP USER IF EXISTS 'staffAccount'@'%';
DROP USER IF EXISTS 'registeredUserAccount'@'%';
DROP USER IF EXISTS 'guestAccount'@'%';

DROP USER IF EXISTS admin;
DROP USER IF EXISTS staff;
DROP USER IF EXISTS staff;
DROP USER IF EXISTS guest;

-- drop_all_tables()
DROP TABLE IF EXISTS guest;
DROP TABLE IF EXISTS booked_seat;
DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS registered_user;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS user_category;
DROP TABLE IF EXISTS base_price;
DROP TABLE IF EXISTS capacity;
DROP TABLE IF EXISTS class;
DROP TABLE IF EXISTS scheduled_trip;
DROP TABLE IF EXISTS route;
DROP TABLE IF EXISTS railway_station;
DROP TABLE IF EXISTS intermediate_station;
DROP TABLE IF EXISTS train;
DROP TABLE IF EXISTS model;

-- drop_all_views()
DROP VIEW IF EXISTS trip;
DROP VIEW IF EXISTS admin_trip;
DROP VIEW IF EXISTS seat_reservation;
DROP VIEW IF EXISTS ticket;
DROP VIEW IF EXISTS passenger;
DROP VIEW IF EXISTS price_list;

-- drop_all_procedures()
DROP PROCEDURE IF EXISTS CompleteBooking;
DROP PROCEDURE IF EXISTS UserCreateBooking;
DROP PROCEDURE IF EXISTS GuestCreateBooking;
DROP PROCEDURE IF EXISTS ScheduleTrip;
DROP PROCEDURE IF EXISTS CreateRailwayStation;
DROP PROCEDURE IF EXISTS CreateModel;
DROP PROCEDURE IF EXISTS CreateRoute;

-- drop_all_functions()
DROP FUNCTION IF EXISTS GenerateRandomGuestID;
DROP FUNCTION IF EXISTS GenerateRandomString;

-- drop_all_events()
DROP EVENT IF EXISTS CheckBookingValidity;

-- drop_all_triggers()
DROP TRIGGER IF EXISTS check_routes_matching;
DROP TRIGGER IF EXISTS check_booking_has_seats_and_guest;
DROP TRIGGER IF EXISTS check_valid_route_creation;


-- create_tables()
CREATE TABLE IF NOT EXISTS model (
            Model_ID SMALLINT PRIMARY KEY AUTO_INCREMENT,
            Name VARCHAR(40) NOT NULL UNIQUE);

CREATE TABLE IF NOT EXISTS train (
            Number SMALLINT PRIMARY KEY,
            Model SMALLINT NOT NULL,
            Name VARCHAR(40) NOT NULL,
            FOREIGN KEY (Model) REFERENCES model(Model_ID) ON DELETE CASCADE );

CREATE TABLE IF NOT EXISTS railway_station (
            Code CHAR(3) PRIMARY KEY,
            Name VARCHAR(40) NOT NULL,
            District VARCHAR(20) NOT NULL);

CREATE TABLE IF NOT EXISTS route (
            Route_ID SMALLINT PRIMARY KEY AUTO_INCREMENT,
            Origin CHAR(3) NOT NULL,
            Destination CHAR(3) NOT NULL,
            Duration_Minutes SMALLINT NOT NULL,
            FOREIGN KEY (Origin) REFERENCES railway_station(Code) ON DELETE CASCADE ,
            FOREIGN KEY (Destination) REFERENCES railway_station(Code) ON DELETE CASCADE,
            CONSTRAINT Unique_Route UNIQUE (Origin, Destination, Duration_Minutes) );

CREATE TABLE IF NOT EXISTS scheduled_trip (
            Scheduled_ID INTEGER PRIMARY KEY AUTO_INCREMENT,
            Route SMALLINT NOT NULL,
            train SMALLINT NOT NULL,
            Departure_Time TIME NOT NULL,
            Date DATE NOT NULL,
            Delay_Minutes SMALLINT NOT NULL DEFAULT 0,
            Active BOOLEAN NOT NULL DEFAULT 1,
            FOREIGN KEY (Route) REFERENCES route(Route_ID) ON DELETE CASCADE,
            FOREIGN KEY (train) REFERENCES train(Number) ON DELETE CASCADE );

CREATE TABLE IF NOT EXISTS class (
            Class_Code CHAR(1) PRIMARY KEY,
            Class_Name VARCHAR(20) NOT NULL );

CREATE TABLE IF NOT EXISTS capacity (
            Capacity_ID SMALLINT PRIMARY KEY AUTO_INCREMENT,
            Model SMALLINT NOT NULL,
            Class CHAR(1) NOT NULL,
            Seats_Count SMALLINT NOT NULL,
            Carts_Count SMALLINT NOT NULL,
            FOREIGN KEY (Model) REFERENCES model(Model_ID) ON DELETE CASCADE,
            FOREIGN KEY (Class) REFERENCES class(Class_Code) ON DELETE CASCADE );

CREATE TABLE IF NOT EXISTS base_price (
            Price_ID SMALLINT PRIMARY KEY AUTO_INCREMENT,
            Class CHAR(1) NOT NULL,
            Route SMALLINT NOT NULL,
            Price DECIMAL(8,2) NOT NULL,
            FOREIGN KEY (Class) REFERENCES class(Class_Code) ON DELETE CASCADE,
            FOREIGN KEY (Route) REFERENCES route(Route_ID),
            CONSTRAINT Unique_Price_Pair UNIQUE (Class, Route));

CREATE TABLE IF NOT EXISTS user_category (
            Category_ID SMALLINT PRIMARY KEY AUTO_INCREMENT,
            Category_Name ENUM('Bronze', 'Silver', 'Gold') NOT NULL,
            Min_Bookings SMALLINT NOT NULL, 
            Discount DECIMAL(5,4) NOT NULL );

CREATE TABLE IF NOT EXISTS user (
            Username VARCHAR(30) PRIMARY KEY,
            Password VARCHAR(162) NOT NULL,
            FirstName VARCHAR(30) NOT NULL,
            LastName VARCHAR(30) NOT NULL);

CREATE TABLE IF NOT EXISTS registered_user (
            Username VARCHAR(30) PRIMARY KEY,
            NIC VARCHAR(15) NOT NULL,
            Address VARCHAR(50) NOT NULL,
            Category SMALLINT NOT NULL DEFAULT 1,
            Birth_Date DATE NOT NULL,
            Gender VARCHAR(15) NOT NULL,
            Email VARCHAR(50) NOT NULL,
            Contact_Number VARCHAR(16) NOT NULL UNIQUE,
            Bookings_Count SMALLINT NOT NULL DEFAULT 0,
            reset_password_token VARCHAR(162),
            reset_password_expires DATETIME,
            FOREIGN KEY (Category) REFERENCES user_category(Category_ID) ON DELETE CASCADE,
            FOREIGN KEY (Username) REFERENCES user(Username) ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS staff (
            Username VARCHAR(30) PRIMARY KEY,
            Role ENUM('Admin', 'Data Entry Operator') NOT NULL,
            FOREIGN KEY (Username) REFERENCES user(Username) ON DELETE CASCADE );

CREATE TABLE IF NOT EXISTS booking (
    Booking_Ref_ID CHAR(12) PRIMARY KEY,
    scheduled_trip INTEGER NOT NULL,
    User VARCHAR(30),
    Final_Price DECIMAL(8,2) NOT NULL,
    from_station CHAR(3) NOT NULL DEFAULT "NIL",  -- New column to store the origin station code
    to_station CHAR(3) NOT NULL DEFAULT "NIL",    -- New column to store the destination station code
    Completed BOOLEAN NOT NULL DEFAULT 0,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scheduled_trip) REFERENCES scheduled_trip(Scheduled_ID) ON DELETE CASCADE,
    FOREIGN KEY (User) REFERENCES user(Username) ON DELETE CASCADE,
    FOREIGN KEY (from_station) REFERENCES railway_station(Code) ON DELETE CASCADE, -- New foreign key to railway_station
    FOREIGN KEY (to_station) REFERENCES railway_station(Code) ON DELETE CASCADE    -- New foreign key to railway_station
);


CREATE TABLE IF NOT EXISTS booked_seat (
            Ticket_Number INTEGER PRIMARY KEY AUTO_INCREMENT,
            Booking CHAR(12) NOT NULL,
            Seat_Number SMALLINT NOT NULL,
            Class CHAR(1) NOT NULL,
            FirstName VARCHAR(30) NOT NULL,
            LastName VARCHAR(30) NOT NULL,
            IsAdult BOOLEAN NOT NULL,
            FOREIGN KEY (Booking) REFERENCES booking(Booking_Ref_ID) ON DELETE CASCADE,
            FOREIGN KEY (Class) REFERENCES class(Class_Code) ON DELETE CASCADE,
            CONSTRAINT Unique_Seat_On_Booking UNIQUE (Booking, Seat_Number, Class) );

CREATE TABLE IF NOT EXISTS guest (
            Guest_ID CHAR(12) NOT NULL,
            Booking_Ref_ID CHAR(12) PRIMARY KEY,
            Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            Email VARCHAR(50),
            Contact_Number VARCHAR(16),
            FOREIGN KEY (Booking_Ref_ID) REFERENCES booking(Booking_Ref_ID) ON DELETE CASCADE);
            
CREATE TABLE IF NOT EXISTS intermediate_station (
			IS_ID INTEGER PRIMARY KEY AUTO_INCREMENT,
            Schedule INTEGER NOT NULL,
            Code CHAR(3) NOT NULL,
            Sequence SMALLINT NOT NULL,
            FOREIGN KEY (Schedule) REFERENCES scheduled_trip(Scheduled_ID) ON DELETE CASCADE,
            FOREIGN KEY (Code) REFERENCES railway_station(Code) ON DELETE CASCADE);


-- create_indexes()
CREATE INDEX idx_scheduled_trip ON scheduled_trip (Route, train, Departure_Time, Delay_Minutes);
CREATE INDEX idx_registered_user ON registered_user (Category);
CREATE INDEX idx_booking ON booking (scheduled_trip, User, Final_Price, Completed);
CREATE INDEX idx_booked_seat ON booked_seat (Booking, Seat_Number, FirstName, LastName, IsAdult);
CREATE INDEX idx_guest ON guest (Booking_Ref_ID);


-- create_views()
CREATE OR REPLACE VIEW trip AS
SELECT 
    sht.Scheduled_ID AS ID,
    sht.Date AS date,
    org.Code AS originCode,
    des.Code AS destinationCode,
    org.Name AS originName,
    des.Name AS destinationName,
    DATE_ADD(sht.Departure_Time, INTERVAL sht.Delay_Minutes MINUTE) AS departureDateAndTime,
    DATE_ADD(sht.Departure_Time, INTERVAL sht.Delay_Minutes + rut.Duration_Minutes MINUTE) AS arrivalDateAndTime,
    rut.Duration_Minutes AS durationMinutes,
    mdl.Name AS trainModel,
    trn.Name AS trainName,
    trn.Number AS trainCode,
    (
        SELECT COUNT(*)
        FROM intermediate_station is1
        WHERE is1.Schedule = sht.Scheduled_ID
    ) AS numberOfIntermediateStations
FROM
    scheduled_trip AS sht
    INNER JOIN route AS rut ON rut.Route_ID = sht.Route
    INNER JOIN railway_station AS org ON rut.Origin = org.Code
    INNER JOIN railway_station AS des ON rut.Destination = des.Code
    INNER JOIN train AS trn ON sht.train = trn.Number
    INNER JOIN model AS mdl ON trn.Model = mdl.Model_ID
WHERE
    DATE(DATE_ADD(sht.Departure_Time, INTERVAL sht.Delay_Minutes MINUTE)) >= CURDATE()
GROUP BY 
    sht.Scheduled_ID;


CREATE OR REPLACE VIEW admin_trip AS
            SELECT 
                sht.Scheduled_ID AS ID,
                sht.Active AS isactive,
                sht.Delay_Minutes AS delay,
                sht.Date AS date,
                org.Code AS originCode,
                des.Code AS destinationCode,
                org.Name AS originName,
                des.Name AS destinationName,
                DATE_ADD(sht.Departure_Time, INTERVAL sht.Delay_Minutes MINUTE) AS departureDateAndTime,
                DATE_ADD(sht.Departure_Time, INTERVAL sht.Delay_Minutes + rut.Duration_Minutes MINUTE) AS arrivalDateAndTime,
                rut.Duration_Minutes AS durationMinutes,
                trn.Number AS trainNumber,
                trn.Name AS trainName,
                (
                SELECT COUNT(*)
                FROM intermediate_station is1
                WHERE is1.Schedule = sht.Scheduled_ID
                ) AS numberOfIntermediateStations
            FROM
                scheduled_trip AS sht
                INNER JOIN route AS rut ON rut.Route_ID = sht.Route
                INNER JOIN railway_station AS org ON rut.Origin = org.Code
                INNER JOIN railway_station AS des ON rut.Destination = des.Code
                INNER JOIN train AS trn ON sht.train = trn.Number
                INNER JOIN model AS mdl ON trn.Model = mdl.Model_ID
            WHERE
                DATE(DATE_ADD(sht.Departure_Time, INTERVAL sht.Delay_Minutes MINUTE)) >= CURDATE()
            GROUP BY sht.Scheduled_ID;

CREATE OR REPLACE VIEW seat_reservation AS
            SELECT 
                subquery2.id AS ID,
                subquery2.clas AS class,
                subquery2.count AS totalCount,
                subquery2.carts AS totalCarts,
                IFNULL(subquery1.count, 0) AS reservedCount,
                IFNULL(subquery1.bookedSeats, '') AS bookedSeats
            FROM
                (SELECT 
                    sht.Scheduled_ID AS id,
                    cls.Class_Name AS clas,
                    COUNT(*) AS count,
                    GROUP_CONCAT(bk.Seat_Number ORDER BY bk.Seat_Number ASC SEPARATOR ',') AS bookedSeats
                    FROM
                        booked_seat AS bk
                        INNER JOIN booking AS bkset ON bk.Booking = bkset.Booking_Ref_ID
                        INNER JOIN class AS cls ON bk.Class = cls.Class_Code
                        INNER JOIN scheduled_trip AS sht ON bkset.scheduled_trip = sht.Scheduled_ID
                        GROUP BY sht.Scheduled_ID , cls.Class_Name) 
                    AS subquery1
                RIGHT JOIN
                (SELECT 
                    sht.Scheduled_ID AS id,
                    cls.Class_Name AS clas,
                    cpt.Seats_Count AS count,
                    cpt.Carts_Count as carts,
                    date(sht.Departure_Time) as date
                    FROM
                        scheduled_trip AS sht
                        INNER JOIN train AS trn ON sht.train = trn.Number
                        INNER JOIN model AS mdl ON trn.Model = mdl.Model_ID
                        INNER JOIN capacity AS cpt ON mdl.Model_ID = cpt.Model
                        INNER JOIN class AS cls ON cpt.Class = cls.Class_Code)
                    AS subquery2 
                ON subquery1.id = subquery2.id AND subquery1.clas = subquery2.clas
            WHERE DATE(subquery2.date) >= CURDATE()
            ORDER BY subquery2.id;

CREATE OR REPLACE VIEW ticket AS
            SELECT 
                bk.Ticket_Number AS ticketNumber,
                bk.Seat_Number AS seatNumber,
                CONCAT(bk.FirstName, ' ', bk.LastName) AS passenger,
                rut.Route_ID AS route,
                org.Name AS origin,
                des.Name AS destination,
                sht.Date AS date,
                sht.Departure_Time AS departureTime,
                cls.Class_Name AS class,
                bkset.Booking_Ref_ID AS bookingRefID,
                usr.Username AS bookedUser,
                CASE
                    WHEN bkset.Completed = 1 THEN 'Active'
                    ELSE 'Payment Pending'
                END AS status
            FROM
                booked_seat AS bk
                INNER JOIN booking AS bkset ON bk.Booking = bkset.Booking_Ref_ID
                LEFT JOIN registered_user AS usr ON bkset.User = usr.Username
                INNER JOIN class AS cls ON bk.Class = cls.Class_Code
                INNER JOIN scheduled_trip AS sht ON bkset.scheduled_trip = sht.Scheduled_ID
                INNER JOIN route AS rut ON sht.Route = rut.Route_ID
                INNER JOIN railway_station AS org ON bkset.from_station = org.Code
                INNER JOIN railway_station AS des ON bkset.to_station = des.Code
            GROUP BY bk.Ticket_Number;

CREATE OR REPLACE VIEW passenger AS
            SELECT 
                bk.Ticket_Number AS ticketNumber,
                CONCAT(bk.FirstName, ' ', bk.LastName) AS name,
                CONCAT(bk.Seat_Number, cls.Class_Code) AS seat,
                bk.IsAdult as isAdult,
                org.Code AS 'fromCode',
                des.Code AS 'toCode',
                sht.Departure_Time AS departureDateTime,
                sht.Scheduled_ID AS tripID,
                cls.Class_Name AS class,
                bkset.Completed AS isPaymentDone,
                bkset.Booking_Ref_ID AS bookingRefID,
                IFNULL(ctg.Category_Name, 'Guest') AS userType
            FROM
                booked_seat AS bk
                INNER JOIN booking AS bkset ON bk.Booking = bkset.Booking_Ref_ID
                LEFT JOIN registered_user AS usr ON bkset.User = usr.Username
                INNER JOIN class AS cls ON bk.Class = cls.Class_Code
                INNER JOIN scheduled_trip AS sht ON bkset.scheduled_trip = sht.Scheduled_ID
                INNER JOIN route AS rut ON sht.Route = rut.Route_ID
                INNER JOIN railway_station AS org ON rut.Origin = org.Code
                INNER JOIN railway_station AS des ON rut.Destination = des.Code
                LEFT JOIN user_category AS ctg ON usr.Category = ctg.Category_ID
			ORDER BY bk.Ticket_Number;

CREATE OR REPLACE VIEW price_list AS
    SELECT 
        st.Scheduled_ID AS scheduled_trip_id,
        c.Class_Name AS class_name,
        bp.Price AS price
    FROM 
        scheduled_trip st
    JOIN 
        base_price bp ON st.Route = bp.Route
    JOIN 
        class c ON bp.Class = c.Class_Code;



-- create_procedures()
CREATE PROCEDURE CompleteBooking(IN Ref_ID CHAR(12))
            BEGIN
                DECLARE totalBookingsCount SMALLINT;
                DECLARE currentUser VARCHAR(30);
                DECLARE minBookCountBronze VARCHAR(10);
                DECLARE idBronze SMALLINT;
                DECLARE minBookCountSilver VARCHAR(10);
                DECLARE idSilver SMALLINT;
                DECLARE minBookCountGold VARCHAR(10);
                DECLARE idGold SMALLINT;
                
                START TRANSACTION;
                    
                    -- Set booking as completed
                    UPDATE booking
                    SET Completed = 1
                    WHERE Booking_Ref_ID = Ref_ID;

                    -- Select current user
                    SELECT usr.Username INTO currentUser
                    FROM booking as bkset
                    INNER JOIN registered_user as usr on bkset.User = usr.Username
                    WHERE bkset.Booking_Ref_ID = Ref_ID;
  
                    -- Get booking count of user
                    SELECT COUNT(distinct bk.Ticket_Number) INTO totalBookingsCount 
                    FROM booking as bkset
                    INNER JOIN booked_seat as bk on bkset.Booking_Ref_ID = bk.Booking
                    INNER JOIN registered_user as usr on bkset.User = usr.Username
                    WHERE usr.Username = currentUser;
  
                    -- Get details related to each category
                    SELECT ctg.Category_ID, ctg.Min_Bookings INTO idBronze, minBookCountBronze
                    FROM user_category as ctg 
                    WHERE ctg.Category_Name = 'Bronze';
                    
                    SELECT ctg.Category_ID, ctg.Min_Bookings INTO idSilver, minBookCountSilver
                    FROM user_category as ctg 
                    WHERE ctg.Category_Name = 'Silver';
                    
                    SELECT ctg.Category_ID, ctg.Min_Bookings INTO idGold, minBookCountGold
                    FROM user_category as ctg 
                    WHERE ctg.Category_Name = 'Gold';
                    
                    -- Update user category
                    IF totalBookingsCount >= minBookCountGold THEN
                        UPDATE registered_user
                        SET Category = idGold
                        WHERE Username = currentUser;
                    ELSEIF totalBookingsCount >= minBookCountSilver THEN
                        UPDATE registered_user
                        SET Category = idSilver
                        WHERE Username = currentUser;
                    ELSE
                        UPDATE registered_user
                        SET Category = idBronze
                        WHERE Username = currentUser;
                    END IF;

                    UPDATE registered_user
                    SET Bookings_Count = totalBookingsCount
                    WHERE Username = currentUser;

                COMMIT;
            END;

CREATE PROCEDURE UserCreateBooking(
    IN scheduled_trip_id INTEGER, 
    IN acc_username VARCHAR(30), 
    IN from_station CHAR(3),  -- New parameter for origin station
    IN to_station CHAR(3),    -- New parameter for destination station
    IN passengers_json JSON,
    IN finalPrice DECIMAL(8,2),
    OUT refID CHAR(12),
    OUT final_Price DECIMAL(8,2),
    OUT status_var BOOLEAN
    )
    BEGIN
        DECLARE i INTEGER DEFAULT 0;
        DECLARE seat_number SMALLINT;
        DECLARE class_value CHAR(1);
        DECLARE first_name VARCHAR(30);
        DECLARE last_name VARCHAR(30);
        DECLARE is_adult BOOLEAN;
        DECLARE seat_reserved BOOLEAN;
        DECLARE max_seat_number SMALLINT;
        DECLARE origin_sequence SMALLINT;
        DECLARE destination_sequence SMALLINT;

        DECLARE done BOOLEAN DEFAULT FALSE;
        DECLARE recordsCursor CURSOR FOR SELECT SeatNumber, ClassValue, FirstName, LastName, IsAdult FROM booking_data;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        DROP TEMPORARY TABLE IF EXISTS booking_data;

        CREATE TEMPORARY TABLE IF NOT EXISTS booking_data (
            SeatNumber SMALLINT,
            ClassValue CHAR(1),
            FirstName VARCHAR(30),
            LastName VARCHAR(30),
            IsAdult BOOLEAN
        );

        SET status_var = FALSE;

        -- Generate booking reference ID
        SET refID = GenerateRandomString();

        -- Determine sequences of the selected stations
        SELECT is1.Sequence INTO origin_sequence
        FROM intermediate_station is1
        WHERE is1.Schedule = scheduled_trip_id AND is1.Code = from_station
        LIMIT 1;

        SELECT is2.Sequence INTO destination_sequence
        FROM intermediate_station is2
        WHERE is2.Schedule = scheduled_trip_id AND is2.Code = to_station
        LIMIT 1;

        IF origin_sequence IS NULL OR destination_sequence IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid origin or destination station';
        END IF;

        IF origin_sequence >= destination_sequence THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Origin station must be before destination station';
        END IF;

        -- Calculate the final price based on the distance between the intermediate stations
        SET final_Price = finalPrice;



        -- Insert passenger data into the temporary table
        WHILE i < JSON_LENGTH(passengers_json) DO
            SET seat_number = JSON_UNQUOTE(JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].seatNumber')));
            SET class_value = JSON_UNQUOTE(JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].class')));
            SET first_name = JSON_UNQUOTE(JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].firstName')));
            SET last_name = JSON_UNQUOTE(JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].lastName')));
            SET is_adult = JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].isAdult'));

            INSERT INTO 
                booking_data (SeatNumber, ClassValue, FirstName, LastName, IsAdult) 
            VALUES 
                (seat_number, class_value, first_name, last_name, is_adult);

            SET i = i + 1;
        END WHILE;

        -- Start transaction for booking and seat reservation
        START TRANSACTION;
            
            INSERT INTO booking (
                Booking_Ref_ID, 
                scheduled_trip, 
                User, 
                Final_price, 
                from_station,   
                to_station      
            ) 
            VALUES (
                refID, 
                scheduled_trip_id, 
                acc_username, 
                finalPrice, 
                from_station,  
                to_station     
            );

            -- Loop through passengers and reserve seats
            OPEN recordsCursor;
            readLoop: LOOP
                FETCH recordsCursor INTO seat_number, class_value, first_name, last_name, is_adult;
                IF done THEN
                    LEAVE readLoop;
                END IF;

                SET seat_reserved = 0;
       
                -- Insert booked seat record
                INSERT INTO booked_seat (Booking, Seat_Number, Class, FirstName, LastName, IsAdult) 
                VALUES (refID, seat_number, class_value, first_name, last_name, is_adult);
                
            END LOOP;
            CLOSE recordsCursor;

        COMMIT;
        SET status_var = TRUE;
    END;


CREATE PROCEDURE GuestCreateBooking(
    IN scheduled_trip_id INTEGER, 
    IN in_guest_id CHAR(12), 
    IN passengers_json JSON,
    IN from_station CHAR(3),  
    IN to_station CHAR(3),    
    IN email VARCHAR(50),
    IN contact_number VARCHAR(16),
    IN finalPrice DECIMAL(8,2),
    OUT refID CHAR(12),
    OUT final_Price DECIMAL(8,2),
    OUT out_guest_id CHAR(12),
    OUT status_var BOOLEAN
    )
    BEGIN
        DECLARE i INTEGER DEFAULT 0;
        DECLARE basePricePerBooking DECIMAL(8,2);
        DECLARE seat_number SMALLINT;
        DECLARE class CHAR(1);
        DECLARE first_name VARCHAR(30);
        DECLARE last_name VARCHAR(30);
        DECLARE is_adult BOOLEAN;
        DECLARE seat_reserved BOOLEAN;
        DECLARE max_seat_number SMALLINT;
        DECLARE guest_id CHAR(12);
        DECLARE origin_sequence SMALLINT;
        DECLARE destination_sequence SMALLINT;

        DECLARE done BOOLEAN DEFAULT FALSE;
        DECLARE recordsCursor CURSOR FOR SELECT SeatNumber, FirstName, LastName, IsAdult FROM booking_data;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        SET status_var = FALSE;

        -- Generate booking reference ID
        SET refID = GenerateRandomString();

        -- Determine sequences of the selected stations
        SELECT is1.Sequence INTO origin_sequence
        FROM intermediate_station is1
        WHERE is1.Schedule = scheduled_trip_id AND is1.Code = from_station
        LIMIT 1; 

        SELECT is2.Sequence INTO destination_sequence
        FROM intermediate_station is2
        WHERE is2.Schedule = scheduled_trip_id AND is2.Code = to_station
        LIMIT 1; 

        IF origin_sequence IS NULL OR destination_sequence IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid origin or destination station';
        END IF;

        IF origin_sequence >= destination_sequence THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Origin station must be before destination station';
        END IF;

        -- Calculate the final price based on the distance between the intermediate stations
        SET final_Price = finalPrice;

        -- Create a temporary table to hold passenger data
        DROP TEMPORARY TABLE IF EXISTS booking_data;

        CREATE TEMPORARY TABLE IF NOT EXISTS booking_data (
            SeatNumber SMALLINT,
            Class CHAR(1),
            FirstName VARCHAR(30),
            LastName VARCHAR(30),
            IsAdult BOOLEAN
        );

        -- Insert passenger data into the temporary table
        WHILE i < JSON_LENGTH(passengers_json) DO
            SET seat_number = JSON_UNQUOTE(JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].seatNumber')));
            SET class = JSON_UNQUOTE(JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].class')));
            SET first_name = JSON_UNQUOTE(JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].firstName')));
            SET last_name = JSON_UNQUOTE(JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].lastName')));
            SET is_adult = JSON_EXTRACT(passengers_json, CONCAT('$[', i, '].isAdult'));

            INSERT INTO 
                booking_data (SeatNumber, Class, FirstName, LastName, IsAdult) 
            VALUES 
                (seat_number, class, first_name, last_name, is_adult);

            SET i = i + 1;
        END WHILE;

        -- Start transaction for booking and seat reservation
        START TRANSACTION;

            INSERT INTO booking (
                Booking_Ref_ID, 
                scheduled_trip, 
                User, 
                Final_price, 
                from_station,  
                to_station     
            ) 
            VALUES (
                refID, 
                scheduled_trip_id, 
                NULL, 
                finalPrice, 
                from_station,  
                to_station    
            );

            -- Loop through passengers and reserve seats
            OPEN recordsCursor;
            readLoop: LOOP
                FETCH recordsCursor INTO seat_number, class, first_name, last_name, is_adult;
                IF done THEN
                    LEAVE readLoop;
                END IF;

                SET seat_reserved = 0;

                -- Check if seat number exceeds the maximum seat count
                SELECT cpt.Seats_Count INTO max_seat_number
                FROM 
                    scheduled_trip AS sht
                    INNER JOIN train AS trn ON sht.train = trn.Number
                    INNER JOIN model AS mdl ON trn.Model = mdl.Model_ID
                    INNER JOIN capacity AS cpt ON mdl.Model_ID = cpt.Model
                    INNER JOIN class AS cls ON cpt.Class = cls.Class_Code
                WHERE 
                    sht.Scheduled_ID = scheduled_trip_id
                    AND cls.Class_Code = class
                LIMIT 1; 

                IF seat_number > max_seat_number THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seat Number Exceeds Maximum Seat Count';
                END IF;

                -- Insert booked seat record
                INSERT INTO booked_seat (Booking, Seat_Number, Class, FirstName, LastName, IsAdult) 
                VALUES (refID, seat_number, class, first_name, last_name, is_adult);

            END LOOP;
            CLOSE recordsCursor;

            -- Insert guest details into the guest table
            IF email = 'NULL' THEN
                SET email = NULL;
            END IF;

            IF contact_number = 'NULL' THEN
                SET contact_number = NULL;
            END IF;

            IF in_guest_id = '____________' THEN
                SET out_guest_id = GenerateRandomGuestID();
            ELSE
                SET out_guest_id = in_guest_id;
            END IF;

            INSERT INTO guest (Guest_ID, Booking_Ref_ID, Email, Contact_Number)
            VALUES (out_guest_id, refID, email, contact_number);

        COMMIT;
        SET status_var = TRUE;
    END;

CREATE DEFINER=`root`@`%` PROCEDURE `ScheduleTrip`(
                IN route_int SMALLINT, 
                IN train_code SMALLINT, 
                IN departure_time TIME, 
                IN date DATE,
                OUT status_var BOOLEAN,
                OUT new_trip_id INT)
BEGIN
                DECLARE lower_bound TIME;
                DECLARE upper_bound TIME;
                DECLARE duration SMALLINT;
                DECLARE scheduled_count SMALLINT;
                
                SET status_var = FALSE;
                
                START TRANSACTION;
                        
                        SELECT rut.Duration_Minutes INTO duration
                        FROM route as rut
                        WHERE rut.Route_ID = route_int;
                        
                        
                        SET lower_bound = DATE_SUB(departure_time, INTERVAL 1 HOUR);
                        SET upper_bound = DATE_ADD(departure_time, INTERVAL duration + 60 MINUTE);
 
                        
                        
                        SELECT COUNT(*) INTO scheduled_count
                        FROM trip as trp
                        WHERE
                            trp.trainCode = train_code
                            AND ( trp.departureDateAndTime > lower_bound AND trp.arrivalDateAndTime < upper_bound )
                            OR ( trp.departureDateAndTime < lower_bound AND trp.arrivalDateAndTime > upper_bound );

                        IF scheduled_count > 0 THEN
                            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'train has scheduled trips at this time';
                        END IF;
                        
                        INSERT INTO scheduled_trip (Route, train, Departure_Time, Date) 
                        VALUES (route_int, train_code, departure_time, date);

                        -- Retrieve the last inserted trip ID
                        SET new_trip_id = LAST_INSERT_ID();
                        
                COMMIT;
                SET status_var = TRUE;
            END;

CREATE PROCEDURE CreateRailwayStation(
                IN Code CHAR(3),
                IN Name VARCHAR(20),
                IN District VARCHAR(20),
                OUT status_var BOOLEAN)
            
            BEGIN
                
                SET status_var = FALSE;
                
                START TRANSACTION;
                
                    INSERT INTO 
                        railway_station (Code, Name, District) 
                    VALUES 
                        (Code, Name, District);
                    
                COMMIT;
                SET status_var = TRUE;
            END;

CREATE PROCEDURE CreateModel(
                IN model_name VARCHAR(40),
                IN seats_count_json JSON,
                OUT status_var BOOLEAN)
            
            BEGIN
                DECLARE model_id INTEGER;
                DECLARE class_name VARCHAR(10);
                DECLARE seats_count SMALLINT;
                DECLARE keyIndex INTEGER DEFAULT 0;
                DECLARE totalKeys INTEGER;
                
                SET status_var = FALSE;
                SET totalKeys = JSON_LENGTH(JSON_KEYS(seats_count_json));

                START TRANSACTION;

                    INSERT INTO
                        model (Name)
                    VALUES
                        (model_name);

                    SET model_id = LAST_INSERT_ID();

                    WHILE keyIndex < totalKeys DO
                        SET class_name = JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(seats_count_json), CONCAT('$[', keyIndex, ']')));
                        SET seats_count = JSON_UNQUOTE(JSON_EXTRACT(seats_count_json, CONCAT('$.', class_name)));

                        INSERT INTO
                            capacity (Model, Class, Seats_Count)
                        VALUES
                            (model_id, class_name, seats_count);
                        
                        SET keyIndex = keyIndex + 1;
                    END WHILE;

                COMMIT;
                SET status_var = TRUE;
            END;

CREATE PROCEDURE CreateRoute(
                IN origin VARCHAR(4),
                IN destination VARCHAR(4),
                IN duration_minutes SMALLINT,
                IN base_price_json JSON,
                OUT status_var BOOLEAN)

            BEGIN

                DECLARE route_id INTEGER;
                DECLARE class_name VARCHAR(10);
                DECLARE price DECIMAL(8,2);
                DECLARE keyIndex INTEGER DEFAULT 0;
                DECLARE totalKeys INTEGER;
                
                SET status_var = FALSE;

                SET totalKeys = JSON_LENGTH(JSON_KEYS(base_price_json));

                START TRANSACTION;

                    INSERT INTO
                        route (Origin, Destination, Duration_Minutes)
                    VALUES
                        (origin, destination, duration_minutes);
                    
                    SET route_id = LAST_INSERT_ID();

                    WHILE keyIndex < totalKeys DO
                        SET class_name = JSON_UNQUOTE(JSON_EXTRACT(JSON_KEYS(base_price_json), CONCAT('$[', keyIndex, ']')));
                        SET price = JSON_UNQUOTE(JSON_EXTRACT(base_price_json, CONCAT('$.', class_name)));

                        INSERT INTO
                            base_price (Route, Class, Price)
                        VALUES
                            (route_id, class_name, price);
                        
                        SET keyIndex = keyIndex + 1;
                    END WHILE;
                
                COMMIT;
                SET status_var = TRUE;
            END;


-- create_functions()
CREATE FUNCTION GenerateRandomString()
            RETURNS CHAR(12)
            DETERMINISTIC
            NO SQL
            BEGIN
                DECLARE randomString CHAR(12);
                
                REPEAT
                    SET randomString = (
                        SELECT
                            SUBSTRING(
                                (SELECT
                                    GROUP_CONCAT(SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', FLOOR(1 + RAND() * 36), 1) ORDER BY RAND() SEPARATOR '')
                                AS randomLongString
                                FROM
                                    information_schema.tables),
                                1, 12
                            ) AS randomString
                    );

                UNTIL NOT EXISTS (SELECT 1 FROM booking WHERE Booking_Ref_ID = randomString)
                END REPEAT;

                RETURN randomString;
            END;


CREATE FUNCTION GenerateRandomGuestID()
            RETURNS CHAR(12)
            DETERMINISTIC
            NO SQL
            BEGIN
                DECLARE randomString CHAR(12);
                
                REPEAT
                    SET randomString = (
                        SELECT
                            SUBSTRING(
                                (SELECT
                                    GROUP_CONCAT(SUBSTRING('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', FLOOR(1 + RAND() * 36), 1) ORDER BY RAND() SEPARATOR '')
                                AS randomLongString
                                FROM
                                    information_schema.tables),
                                1, 12
                            ) AS randomString
                    );

                UNTIL NOT EXISTS (SELECT 1 FROM guest WHERE Guest_ID = randomString)
                END REPEAT;

                RETURN randomString;
            END;

-- create_events()
CREATE EVENT CheckBookingValidity
            ON SCHEDULE EVERY 60 MINUTE STARTS CURRENT_TIMESTAMP
            DO
            BEGIN
            DELETE FROM booking
            WHERE 
                Created_At < NOW() - INTERVAL 300 MINUTE
                AND User IS NULL
                AND Completed = 0;
            END;


CREATE EVENT DeletePastBookings
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    DELETE FROM booking
    WHERE scheduled_trip IN (
        SELECT Scheduled_ID
        FROM scheduled_trip
        WHERE Date < CURDATE()
    );
END;


CREATE TRIGGER check_booking_has_seats_and_guest
                BEFORE UPDATE ON booking
                FOR EACH ROW
                BEGIN
                    DECLARE booked_seats_count SMALLINT;
                    DECLARE guest_user_id CHAR(12);

                    SELECT COUNT(*) INTO booked_seats_count
                    FROM booked_seat
                    WHERE Booking = NEW.Booking_Ref_ID;

                    IF booked_seats_count = 0 THEN
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking must have at least 1 seat';
                    END IF;

                    IF NEW.User IS NULL THEN
                        SELECT Guest_ID INTO guest_user_id
                        FROM guest
                        WHERE Booking_Ref_ID = NEW.Booking_Ref_ID;

                        IF guest_user_id IS NULL THEN
                            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid Booking with no user';
                        END IF;
                    END IF;
                END;

CREATE TRIGGER check_valid_route_creation
                BEFORE INSERT ON route
                FOR EACH ROW
                BEGIN
                    IF NEW.Origin = NEW.Destination THEN
                        SIGNAL SQLSTATE '45000'
                            SET MESSAGE_TEXT = 'Origin and destination must be different';
                    END IF;
                END;


CREATE TRIGGER check_trip_has_paid_bookings
                BEFORE DELETE ON scheduled_trip
                FOR EACH ROW
                BEGIN
                    DECLARE paid_bookings_count SMALLINT;

                    SELECT COUNT(*) INTO paid_bookings_count
                    FROM booking
                    WHERE scheduled_trip = OLD.Scheduled_ID AND Completed = 1;

                    IF paid_bookings_count > 0 THEN
                        SIGNAL SQLSTATE '45000'
                            SET MESSAGE_TEXT = 'Trip has paid bookings, cannot delete';
                    END IF;
                END;

CREATE TRIGGER check_railway_station_has_paid_bookings
                BEFORE DELETE ON railway_station
                FOR EACH ROW
                BEGIN
                    DECLARE paid_bookings_count SMALLINT;

                    SELECT COUNT(*) INTO paid_bookings_count
                    FROM booking as bk
                    INNER JOIN scheduled_trip as sf ON bk.scheduled_trip = sf.Scheduled_ID
                    INNER JOIN route as rt ON sf.Route = rt.Route_ID
                    WHERE rt.Origin = OLD.Code OR rt.Destination = OLD.Code AND bk.Completed = 1;

                    IF paid_bookings_count > 0 THEN
                        SIGNAL SQLSTATE '45000'
                            SET MESSAGE_TEXT = 'railway_station has paid bookings, cannot delete';
                    END IF;
                END;

CREATE TRIGGER check_train_has_paid_bookings
                BEFORE DELETE ON train
                FOR EACH ROW
                BEGIN
                    DECLARE paid_bookings_count SMALLINT;

                    SELECT COUNT(*) INTO paid_bookings_count
                    FROM booking as bk
                    INNER JOIN scheduled_trip as sf ON bk.scheduled_trip = sf.Scheduled_ID
                    WHERE sf.train = OLD.Number AND bk.Completed = 1;

                    IF paid_bookings_count > 0 THEN
                        SIGNAL SQLSTATE '45000'
                            SET MESSAGE_TEXT = 'train has paid bookings, cannot delete';
                    END IF;
                END;

CREATE TRIGGER check_model_has_paid_bookings
                BEFORE DELETE ON model
                FOR EACH ROW
                BEGIN
                    DECLARE paid_bookings_count SMALLINT;

                    SELECT COUNT(*) INTO paid_bookings_count
                    FROM booking as bk
                    INNER JOIN scheduled_trip as sf ON bk.scheduled_trip = sf.Scheduled_ID
                    INNER JOIN train as ap ON sf.train = ap.Number
                    WHERE ap.Model = OLD.Model_ID AND bk.Completed = 1;

                    IF paid_bookings_count > 0 THEN
                        SIGNAL SQLSTATE '45000'
                            SET MESSAGE_TEXT = 'Model has paid bookings, cannot delete';
                    END IF;
                END;

CREATE TRIGGER check_route_has_paid_bookings
                BEFORE DELETE ON route
                FOR EACH ROW
                BEGIN
                    DECLARE paid_bookings_count SMALLINT;

                    SELECT COUNT(*) INTO paid_bookings_count
                    FROM booking as bk
                    INNER JOIN scheduled_trip as sf ON bk.scheduled_trip = sf.Scheduled_ID
                    WHERE sf.Route = OLD.Route_ID AND bk.Completed = 1;

                    IF paid_bookings_count > 0 THEN
                        SIGNAL SQLSTATE '45000'
                            SET MESSAGE_TEXT = 'Route has paid bookings, cannot delete';
                    END IF;
                END;
        


-- create roles and users
CREATE ROLE IF NOT EXISTS admin, staff, registeredUser, guest;
CREATE USER IF NOT EXISTS 'adminAccount'@'%' IDENTIFIED BY 'P7tZ99pJ2s9';
CREATE USER IF NOT EXISTS 'staffAccount'@'%'IDENTIFIED BY 'MK6dLpY9sPz';
CREATE USER IF NOT EXISTS 'registeredUserAccount'@'%' IDENTIFIED BY '0qR3vKnX8w5';
CREATE USER IF NOT EXISTS 'guestAccount'@'%' IDENTIFIED BY 'L2mSgV7hg5e';

GRANT ALL PRIVILEGES ON railway.* TO 'admin';

GRANT SELECT, INSERT, UPDATE, DELETE ON railway.capacity TO 'staff';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.model TO 'staff';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.train TO 'staff';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.railway_station TO 'staff';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.intermediate_station TO 'staff';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.route TO 'staff';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.scheduled_trip TO 'staff';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.base_price TO 'staff';
GRANT SELECT, INSERT, UPDATE ON railway.class TO 'staff';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.user TO 'staff';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.staff TO 'staff';
GRANT SELECT ON railway.trip TO 'staff';
GRANT SELECT ON railway.price_list TO 'staff';
GRANT EXECUTE ON PROCEDURE railway.ScheduleTrip TO 'staff';
GRANT EXECUTE ON PROCEDURE railway.CreateModel TO 'staff';
GRANT EXECUTE ON PROCEDURE railway.CreateRailwayStation TO 'staff';
GRANT EXECUTE ON PROCEDURE railway.CreateRoute TO 'staff';

GRANT SELECT ON railway.capacity TO 'registeredUser';
GRANT SELECT ON railway.model TO 'registeredUser';
GRANT SELECT ON railway.train TO 'registeredUser';
GRANT SELECT ON railway.railway_station TO 'registeredUser';
GRANT SELECT ON railway.intermediate_station TO 'registeredUser';
GRANT SELECT ON railway.route TO 'registeredUser';
GRANT SELECT ON railway.scheduled_trip TO 'registeredUser';
GRANT SELECT ON railway.base_price TO 'registeredUser';
GRANT SELECT ON railway.class TO 'registeredUser';
GRANT SELECT ON railway.trip TO 'registeredUser';
GRANT SELECT ON railway.ticket TO 'registeredUser';
GRANT SELECT ON railway.seat_reservation TO 'registeredUser';
GRANT SELECT ON railway.price_list TO 'registeredUser';
GRANT SELECT ON railway.user_category TO 'registeredUser';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.user TO 'registeredUser';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.registered_user TO 'registeredUser';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.booking TO 'registeredUser';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.booked_seat TO 'registeredUser';
GRANT CREATE TEMPORARY TABLES ON railway.* TO 'registeredUser';
GRANT EXECUTE ON FUNCTION railway.GenerateRandomString TO 'registeredUser';
GRANT EXECUTE ON PROCEDURE railway.UserCreateBooking TO 'registeredUser';
GRANT EXECUTE ON PROCEDURE railway.CompleteBooking TO 'registeredUser';


GRANT SELECT ON railway.capacity TO 'guest';
GRANT SELECT ON railway.model TO 'guest';
GRANT SELECT ON railway.train TO 'guest';
GRANT SELECT ON railway.railway_station TO 'guest';
GRANT SELECT ON railway.intermediate_station TO 'guest';
GRANT SELECT ON railway.route TO 'guest';
GRANT SELECT ON railway.scheduled_trip TO 'guest';
GRANT SELECT ON railway.base_price TO 'guest';
GRANT SELECT ON railway.class TO 'guest';
GRANT SELECT ON railway.trip TO 'guest';
GRANT SELECT ON railway.ticket TO 'guest';
GRANT SELECT ON railway.seat_reservation TO 'guest';
GRANT SELECT ON railway.price_list TO 'guest';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.guest TO 'guest';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.booking TO 'guest';
GRANT SELECT, INSERT, UPDATE, DELETE ON railway.booked_seat TO 'guest';
GRANT CREATE TEMPORARY TABLES ON railway.* TO 'guest';
GRANT EXECUTE ON FUNCTION railway.GenerateRandomString TO 'guest';
GRANT EXECUTE ON FUNCTION railway.GenerateRandomGuestID TO 'guest';
GRANT EXECUTE ON PROCEDURE railway.GuestCreateBooking TO 'guest';
GRANT EXECUTE ON PROCEDURE railway.CompleteBooking TO 'guest';
        

GRANT 'admin' TO 'adminAccount'@'%';
SET DEFAULT ROLE 'admin' TO 'adminAccount'@'%';
GRANT 'staff' TO 'staffAccount'@'%';
SET DEFAULT ROLE 'staff' TO 'staffAccount'@'%';
GRANT 'registeredUser' TO 'registeredUserAccount'@'%';
SET DEFAULT ROLE 'registeredUser' TO 'registeredUserAccount'@'%';
GRANT 'guest' TO 'guestAccount'@'%';
SET DEFAULT ROLE 'guest' TO 'guestAccount'@'%';



