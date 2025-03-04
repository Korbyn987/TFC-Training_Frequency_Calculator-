import pyodbc
import getpass

def connect_to_db():
    try:
        # Connect to SQL Server using ODBC Driver 17
        conn = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=localhost;'
            'DATABASE=Training_Frequency_Calculator;'
            'Trusted_Connection=yes;'
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def register_user():
    print("\n=== User Registration ===")
    username = input("Enter username: ")
    password = getpass.getpass("Enter password: ")
    
    # Get user info
    name = input("Enter your full name: ")
    age = input("Enter your age: ")
    gender = input("Enter your gender (Male/Female/Other): ")
    weight = input("Enter your weight (in lbs): ")
    height = input("Enter your height (e.g., 5'11\"): ")
    
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Get the next available ID
            cursor.execute("SELECT ISNULL(MAX(id), 0) + 1 FROM TFC_login_table")
            next_id = cursor.fetchone()[0]
            
            # Insert into login table
            cursor.execute("""
                INSERT INTO TFC_login_table (id, username, password)
                VALUES (?, ?, ?)
            """, (next_id, username, password))
            
            # Insert into user info table
            cursor.execute("""
                INSERT INTO TFC_user_info_table (id, name, age, gender, weight, height)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (next_id, name, age, gender, weight, height))
            
            conn.commit()
            print("\nUser registered successfully!")
            
        except Exception as e:
            print(f"Error registering user: {e}")
            conn.rollback()
        finally:
            conn.close()

def login_user():
    print("\n=== User Login ===")
    username = input("Enter username: ")
    password = getpass.getpass("Enter password: ")
    
    conn = connect_to_db()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.name, u.age, u.gender, u.weight, u.height
                FROM TFC_login_table l
                JOIN TFC_user_info_table u ON l.id = u.id
                WHERE l.username = ? AND l.password = ?
            """, (username, password))
            
            user_data = cursor.fetchone()
            if user_data:
                print("\nLogin successful!")
                print(f"Welcome back, {user_data[0]}!")
                print(f"Your profile:")
                print(f"Age: {user_data[1]}")
                print(f"Gender: {user_data[2]}")
                print(f"Weight: {user_data[3]} lbs")
                print(f"Height: {user_data[4]}")
            else:
                print("\nInvalid username or password.")
                
        except Exception as e:
            print(f"Error during login: {e}")
        finally:
            conn.close()

def main():
    while True:
        print("\n=== Training Frequency Calculator ===")
        print("1. Register")
        print("2. Login")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ")
        
        if choice == "1":
            register_user()
        elif choice == "2":
            login_user()
        elif choice == "3":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
