from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
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
        "origins": [
            "http://localhost:19007",
            "http://127.0.0.1:19007",
            "http://localhost:19006",
            "http://127.0.0.1:19006",
            "http://localhost:5001",
            "http://127.0.0.1:5001",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database setup
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tfc_database.db')
logger.info(f"Using database at: {DB_PATH}")

def init_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create users table with all fields
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
        
        conn.commit()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    finally:
        if conn:
            conn.close()

def connect_to_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        return None

@app.route('/api/register', methods=['POST'])
def register():
    try:
        logger.info("Received registration request")
        data = request.get_json()
        logger.debug(f"Registration data received: {data}")
        
        # Extract all required fields
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        name = data.get('name')
        age = str(data.get('age'))  # Convert to string for consistency
        gender = data.get('gender')
        weight = str(data.get('weight'))  # Convert to string for consistency
        height = str(data.get('height'))  # Convert to string for consistency
        
        # Validate required fields
        required_fields = {
            'username': username,
            'password': password,
            'email': email,
            'name': name,
            'age': age,
            'gender': gender,
            'weight': weight,
            'height': height
        }
        
        for field, value in required_fields.items():
            if not value:
                error_msg = f"{field} is required"
                logger.error(error_msg)
                return jsonify({'error': error_msg}), 400

        #Hash the password before storing 
        hashed_password = generate_password_hash(password)
        
        conn = connect_to_db()
        if conn:
            try:
                cursor = conn.cursor()
                
                # Insert new user
                cursor.execute('''
                    INSERT INTO users (username, password, email, name, age, gender, weight, height)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (username, hashed_password, email, name, age, gender, weight, height))
                
                conn.commit()
                logger.info(f"User {username} registered successfully")
                return jsonify({'message': 'Registration successful'}), 201
                
            except sqlite3.IntegrityError as e:
                error_msg = ''
                if 'username' in str(e):
                    error_msg = 'Username already exists'
                elif 'email' in str(e):
                    error_msg = 'Email already exists'
                else:
                    error_msg = str(e)
                logger.error(f"Registration integrity error: {error_msg}")
                return jsonify({'error': error_msg}), 409
                
            except Exception as e:
                error_msg = f"Registration failed: {str(e)}"
                logger.error(error_msg)
                return jsonify({'error': error_msg}), 500
                
            finally:
                conn.close()
        
        error_msg = "Database connection failed"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 500
        
    except Exception as e:
        error_msg = f"Invalid request: {str(e)}"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 400

@app.route('/api/login', methods=['POST'])
def login():
    try:
        logger.info("Received login request")
        data = request.get_json()
        logger.debug(f"Login data received: {data}")
        
        if not data:
            error_msg = "No data provided"
            logger.error(error_msg)
            return jsonify({'error': error_msg}), 400
            
        identifier = data.get('identifier')
        password = data.get('password')
        
        if not identifier or not password:
            error_msg = "Please enter your username/email and password"
            logger.error(error_msg)
            return jsonify({'error': error_msg}), 400
        
        conn = connect_to_db()
        if not conn:
            error_msg = "Database connection failed"
            logger.error(error_msg)
            return jsonify({'error': error_msg}), 500
            
        try:
            cursor = conn.cursor()
            # Check for both username and email
            cursor.execute('''
                SELECT id, username, email, name, age, gender, weight, height, password
                FROM users
                WHERE username = ? OR email = ?
            ''', (identifier, identifier))
            
            user = cursor.fetchone()
            if user:
                logger.info(f"Found user with identifier: {identifier}")
                stored_password = user[8]
                
                # Verify password
                if check_password_hash(stored_password, password):
                    return jsonify({
                        'message': 'Login successful',
                        'user': {
                            'id': user[0],
                            'username': user[1],
                            'email': user[2],
                            'name': user[3],
                            'age': user[4],
                            'gender': user[5],
                            'weight': user[6],
                            'height': user[7]
                        }
                    }), 200
                else:
                    error_msg = "Invalid password"
                    logger.error(error_msg)
                    return jsonify({'error': error_msg}), 401
            else:
                error_msg = "User not found"
                logger.error(error_msg)
                return jsonify({'error': error_msg}), 401
                
        except sqlite3.Error as e:
            error_msg = f"Database error: {str(e)}"
            logger.error(error_msg)
            return jsonify({'error': error_msg}), 500
        finally:
            conn.close()
            
    except Exception as e:
        error_msg = f"Server error: {str(e)}"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    # Initialize the database
    init_db()
    # Run the server
    app.run(host='0.0.0.0', port=5001, debug=True)