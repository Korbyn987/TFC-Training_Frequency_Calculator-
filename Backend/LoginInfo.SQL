-- Create the database
CREATE DATABASE Training_Frequency_Calculator;

-- Use the database
USE Training_Frequency_Calculator;

-- Create the table
CREATE TABLE TFC_login_table (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT
);

-- Insert data into the table
INSERT INTO TFC_login_table (username, password) VALUES ('John Doe', 'password');

-- Query all data from the table
SELECT * FROM TFC_login_table;

-- Drop the table if it exists
DROP TABLE IF EXISTS TFC_login_table;
