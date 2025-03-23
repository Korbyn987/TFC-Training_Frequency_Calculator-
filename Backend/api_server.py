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
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    finally:
        conn.close()

def connect_to_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
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
        if not all([username, password, email]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = connect_to_db()
        if conn:
            try:
                cursor = conn.cursor()
                
                # Insert new user
                cursor.execute('''
                    INSERT INTO users (username, password, email, name, age, gender, weight, height)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (username, password, email, name, age, gender, weight, height))
                
                conn.commit()
                return jsonify({'message': 'Registration successful'}), 201
                
            except sqlite3.IntegrityError as e:
                if 'username' in str(e):
                    return jsonify({'error': 'Username already exists'}), 409
                elif 'email' in str(e):
                    return jsonify({'error': 'Email already exists'}), 409
                return jsonify({'error': str(e)}), 409
                
            except Exception as e:
                logger.error(f"Registration error: {e}")
                return jsonify({'error': 'Registration failed'}), 500
                
            finally:
                conn.close()
        
        return jsonify({'error': 'Database connection failed'}), 500
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Invalid request'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400
        
        conn = connect_to_db()
        if conn:
            try:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, username, email, name, age, gender, weight, height
                    FROM users
                    WHERE username = ? AND password = ?
                ''', (username, password))
                
                user = cursor.fetchone()
                if user:
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
                    return jsonify({'error': 'Invalid username or password'}), 401
                    
            except Exception as e:
                logger.error(f"Login error: {e}")
                return jsonify({'error': 'Login failed'}), 500
                
            finally:
                conn.close()
                
        return jsonify({'error': 'Database connection failed'}), 500
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Invalid request'}), 400

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    # Initialize the database
    init_db()
    # Run the server
    app.run(host='0.0.0.0', port=5001, debug=True)
