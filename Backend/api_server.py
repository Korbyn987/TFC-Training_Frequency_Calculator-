from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import logging
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from your React Native app
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # Allow all origins for development
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database setup
DB_PATH = 'tfc_database.db'

def init_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create login table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS TFC_login_table (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        
        # Create user info table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS TFC_user_info_table (
                id INTEGER PRIMARY KEY,
                name TEXT,
                age INTEGER,
                gender TEXT,
                weight REAL,
                height REAL,
                FOREIGN KEY (id) REFERENCES TFC_login_table(id)
            )
        ''')
        
        conn.commit()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")
    finally:
        conn.close()

def connect_to_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        logger.info("Successfully connected to database")
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        return None

@app.route('/api/register', methods=['POST'])
def register():
    try:
        logger.info("Received registration request")
        data = request.json
        logger.debug(f"Registration data: {data}")
        
        username = data.get('username')
        password = data.get('password')
        name = data.get('name')
        age = data.get('age')
        gender = data.get('gender')
        weight = data.get('weight')
        height = data.get('height')

        conn = connect_to_db()
        if conn:
            try:
                cursor = conn.cursor()
                
                # Check if username already exists
                cursor.execute("SELECT username FROM TFC_login_table WHERE username = ?", (username,))
                if cursor.fetchone():
                    return jsonify({"error": "Username already exists"}), 400
                
                # Insert into login table
                cursor.execute("""
                    INSERT INTO TFC_login_table (username, password)
                    VALUES (?, ?)
                """, (username, password))
                
                user_id = cursor.lastrowid
                
                # Insert into user info table
                cursor.execute("""
                    INSERT INTO TFC_user_info_table (id, name, age, gender, weight, height)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (user_id, name, age, gender, weight, height))
                
                conn.commit()
                logger.info(f"User {username} registered successfully")
                return jsonify({"message": "User registered successfully"}), 201
                
            except Exception as e:
                conn.rollback()
                logger.error(f"Database error during registration: {str(e)}")
                return jsonify({"error": str(e)}), 400
            finally:
                conn.close()
        logger.error("Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        conn = connect_to_db()
        cursor = conn.cursor()

        # Check if user exists and password matches
        cursor.execute('SELECT * FROM TFC_login_table WHERE username = ? AND password = ?', (username, password))
        user = cursor.fetchone()

        if user is None:
            return jsonify({'error': 'Invalid username or password'}), 401

        # Return user data (excluding sensitive information)
        return jsonify({
            'username': username,
            'message': 'Login successful'
        }), 200

    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    # Initialize the database
    init_db()
    app.run(debug=True, port=5001, host='0.0.0.0')
