from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import re

app = Flask(__name__)
CORS(app)

def connect_to_db():
    try:
        conn = sqlite3.connect('tfc_database.db')
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            print("No JSON data received")
            return jsonify({'error': 'No data received'}), 400

        identifier = data.get('identifier')
        password = data.get('password')

        print(f"Login attempt - Identifier: {identifier}")  # Debug log

        if not identifier or not password:
            return jsonify({'error': 'Please enter your username/email and password'}), 400

        conn = connect_to_db()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor()
        
        # First try username
        cursor.execute('SELECT username FROM users WHERE username = ? AND password = ?', 
                      (identifier, password))
        user = cursor.fetchone()
        
        # If not found by username and input looks like email, try email
        if not user and is_valid_email(identifier):
            cursor.execute('SELECT username FROM users WHERE email = ? AND password = ?', 
                         (identifier, password))
            user = cursor.fetchone()

        if user:
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'username': user[0]
                }
            })
        else:
            return jsonify({'error': 'Invalid username/email or password'}), 401

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500
    finally:
        if 'conn' in locals() and conn:
            conn.close()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    age = data.get('age')
    gender = data.get('gender')
    weight = data.get('weight')
    height = data.get('height')
    email = data.get('email')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    if email and not is_valid_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    try:
        conn = connect_to_db()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = conn.cursor()
        
        # Check if username exists
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        if cursor.fetchone():
            return jsonify({'error': 'Username already exists'}), 409

        if email:
            # Check if email exists
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                return jsonify({'error': 'Email already exists'}), 409

        # Insert new user
        cursor.execute('''
            INSERT INTO users (username, password, name, age, gender, weight, height, email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (username, password, name, age, gender, weight, height, email))
        
        conn.commit()
        return jsonify({'message': 'Registration successful'}), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(port=5001, debug=True)
