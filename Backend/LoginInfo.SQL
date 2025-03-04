
-- Drop database if it exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'Training_Frequency_Calculator')
    DROP DATABASE Training_Frequency_Calculator
GO

-- Create the database
CREATE DATABASE Training_Frequency_Calculator;
GO

-- Use the database
USE Training_Frequency_Calculator;
GO

-- Create the table
CREATE TABLE TFC_login_table (
    id INTEGER PRIMARY KEY,
    username NVARCHAR(50),
    password NVARCHAR(50)
);
GO

-- Insert data into the table
INSERT INTO TFC_login_table (id, username, password) VALUES (1, 'John Doe', 'password');
GO

-- Query all data from the table
SELECT * FROM TFC_login_table;