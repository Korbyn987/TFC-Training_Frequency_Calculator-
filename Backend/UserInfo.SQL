-- Use the database
USE Training_Frequency_Calculator;

-- Create the table
CREATE TABLE TFC_userinfo_table (
    id INTEGER PRIMARY KEY,
    name TEXT
    age TEXT,
    weight TEXT
    height TEXT
);

-- Insert data into the table
INSERT INTO TFC_userinfo_table (name, age, weight, height) VALUES ('John Doe', '30', '200', '6"4');

-- Query all data from the table
SELECT * FROM TFC_userinfo_table;

-- Drop the table if it exists
DROP TABLE IF EXISTS TFC_userinfo_table;
