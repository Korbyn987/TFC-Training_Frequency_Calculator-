import sqlite3
import getpass

def connect_to_db():
    try:
        # Connect to SQLite database
        conn = sqlite3.connect('tfc_database.db')
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def register_user():
    print("\n=== User Registration ===")
    username = input("Enter username: ")
    password = getpass.getpass("Enter password: ")
    email = input("Enter email: ")
    
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
            
            # Create tables if they don't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password TEXT,
                    email TEXT UNIQUE,
                    name TEXT,
                    age TEXT,
                    gender TEXT,
                    weight TEXT,
                    height TEXT
                )
            ''')
            
            # Insert the new user
            cursor.execute('''
                INSERT INTO users (username, password, email, name, age, gender, weight, height)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (username, password, email, name, age, gender, weight, height))
            
            conn.commit()
            print("\nRegistration successful!")
            
        except Exception as e:
            print(f"Error during registration: {e}")
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
            
            # Check credentials and get user info
            cursor.execute('''
                SELECT name, email, age, gender, weight, height
                FROM users
                WHERE username = ? AND password = ?
            ''', (username, password))
            
            user_data = cursor.fetchone()
            
            if user_data:
                print("\nLogin successful!")
                print(f"Welcome back, {user_data[0]}!")
                print(f"Email: {user_data[1]}")
                print(f"Age: {user_data[2]}")
                print(f"Gender: {user_data[3]}")
                print(f"Weight: {user_data[4]} lbs")
                print(f"Height: {user_data[5]}")
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
