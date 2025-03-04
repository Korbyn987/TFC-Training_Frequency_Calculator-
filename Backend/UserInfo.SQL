-- Use the database
USE Training_Frequency_Calculator;
GO

-- Drop the table if it exists
IF OBJECT_ID('TFC_user_info_table', 'U') IS NOT NULL
    DROP TABLE TFC_user_info_table;
GO

-- Create the table
CREATE TABLE TFC_user_info_table (
    id INTEGER PRIMARY KEY,
    name NVARCHAR(100),
    age NVARCHAR(10),
    weight NVARCHAR(10),
    height NVARCHAR(10)
);
GO

-- Insert initial test data
INSERT INTO TFC_user_info_table (id, name, age, weight, height) 
VALUES (1, 'John Doe', '30', '200', '6"4');
GO
