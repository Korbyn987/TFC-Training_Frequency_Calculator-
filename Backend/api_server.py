from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import logging
import secrets
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from email_templates import get_password_reset_template, get_username_recovery_template
from dotenv import load_dotenv
import bcrypt

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
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

# Configuration
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tfc_database.db')
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 465
SMTP_USERNAME = 'trainingfrequencycalculator@gmail.com'
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
FRONTEND_URL = 'http://localhost:19006'

def connect_to_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error: {str(e)}")
        return None

def init_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create users table with all fields
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                age TEXT,
                gender TEXT,
                weight TEXT,
                height TEXT
            )
        ''')
        
        # Create password reset tokens table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                token TEXT,
                expiration TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Debug: Insert a test user if none exists
        cursor.execute('SELECT COUNT(*) FROM users')
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            logger.info("No users found in database. Creating test user...")
            test_password = generate_password_hash('test123')
            cursor.execute('''
                INSERT INTO users (username, password, email, name, age, gender, weight, height)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', ('testuser', test_password, 'trainingfrequencycalculator@gmail.com', '', '', '', '', ''))
            conn.commit()
            logger.info("Test user created successfully")
        
        conn.commit()
        logger.info("Database initialized successfully")
        
        # Debug: Print all users
        cursor.execute('SELECT email, username FROM users')
        all_users = cursor.fetchall()
        logger.info("All users in database after initialization:")
        for email, username in all_users:
            logger.info(f"Email: {email}, Username: {username}")
            
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
    finally:
        if conn:
            conn.close()

def generate_password_hash(password):
    """Generate a bcrypt password hash"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password_hash(password_hash, password):
    """Check if the password matches the hash"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except Exception as e:
        logger.error(f"Error checking password: {str(e)}")
        return False

def send_email(to_email, subject, html_content):
    try:
        logger.info(f"Attempting to send email to {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Content: {html_content}")

        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject

        # Add HTML content
        msg.attach(MIMEText(html_content, 'html'))

        # Connect to SMTP server and send email
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            logger.info("Email sent successfully")
            return True
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        name = data.get('name', '')
        age = data.get('age', '')
        gender = data.get('gender', '')
        weight = data.get('weight', '')
        height = data.get('height', '')

        # Validate required fields
        if not all([username, password, email]):
            return jsonify({'error': 'Username, password, and email are required'}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        conn = connect_to_db()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (username, password, email, name, age, gender, weight, height)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (username, hashed_password, email, name, age, gender, weight, height))
            conn.commit()

            # Get the created user
            cursor.execute('SELECT id, username, email FROM users WHERE username = ?', (username,))
            user = cursor.fetchone()
            
            return jsonify({
                'message': 'Registration successful',
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2]
                }
            })

        except sqlite3.IntegrityError as e:
            if "UNIQUE constraint failed: users.username" in str(e):
                return jsonify({'error': 'Username already exists'}), 409
            elif "UNIQUE constraint failed: users.email" in str(e):
                return jsonify({'error': 'Email already exists'}), 409
            else:
                return jsonify({'error': f'Registration failed: {str(e)}'}), 500
        except Exception as e:
            return jsonify({'error': f'Registration failed: {str(e)}'}), 500
        finally:
            conn.close()

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        identifier = data.get('identifier')  # Can be username or email
        password = data.get('password')

        logger.info(f"Login attempt with identifier: {identifier}")

        if not identifier or not password:
            return jsonify({'error': 'Username/email and password are required'}), 400

        conn = connect_to_db()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500

        try:
            cursor = conn.cursor()
            # Check if identifier is email or username
            cursor.execute('''
                SELECT id, username, password, email 
                FROM users 
                WHERE username = ? OR email = ?
            ''', (identifier, identifier))
            
            user = cursor.fetchone()
            
            if not user:
                logger.error(f"No user found for identifier: {identifier}")
                return jsonify({'error': 'Invalid credentials'}), 401

            user_id, username, stored_password, email = user
            logger.info(f"Found user: {username}")
            logger.info(f"Stored password hash: {stored_password}")
            logger.info(f"Checking password...")

            if check_password_hash(stored_password, password):
                logger.info("Password check successful")
                return jsonify({
                    'message': 'Login successful',
                    'user': {
                        'id': user_id,
                        'username': username,
                        'email': email
                    }
                })
            else:
                logger.error("Password check failed")
                return jsonify({'error': 'Invalid credentials'}), 401

        except sqlite3.Error as e:
            logger.error(f"Database error during login: {str(e)}")
            return jsonify({'error': 'Database error'}), 500
        finally:
            conn.close()

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/auth/recover-username', methods=['POST'])
def recover_username():
    try:
        data = request.get_json()
        logger.info(f"Received data: {data}")
        email = data.get('email')
        logger.info(f"Received username recovery request for email: {email}")

        if not email:
            logger.error("No email provided in request")
            return jsonify({'error': 'Email is required'}), 400

        try:
            conn = connect_to_db()
            cursor = conn.cursor()

            # Debug: Print all users in the database
            cursor.execute('SELECT email, username FROM users')
            all_users = cursor.fetchall()
            logger.info("All users in database:")
            for user_email, username in all_users:
                logger.info(f"Email: {user_email}, Username: {username}")

            # Check if email exists
            cursor.execute('SELECT username FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
            logger.info(f"Query result for {email}: {user}")
            
            if user:
                username = user[0]
                logger.info(f"Found username '{username}' for email {email}")
                # Send email with username
                html_content = get_username_recovery_template(username)
                if send_email(email, "Your Username Recovery", html_content):
                    logger.info("Username recovery email sent successfully")
                    return jsonify({'message': f'Your username has been sent to {email}'})
                else:
                    logger.error("Failed to send username recovery email")
                    return jsonify({'error': 'Failed to send email'}), 500
            else:
                logger.warning(f"No user found for email: {email}")
                return jsonify({'error': 'No account found with this email'}), 404

        except sqlite3.Error as e:
            logger.error(f"Database error: {str(e)}")
            return jsonify({'error': 'Database error'}), 500
        finally:
            if conn:
                conn.close()

    except Exception as e:
        logger.error(f"Error in recover_username: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        conn = connect_to_db()
        cursor = conn.cursor()

        # Check if email exists
        cursor.execute('SELECT id, username FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()

        if user:
            # Generate secure token
            token = secrets.token_urlsafe(32)
            user_id = user[0]
            
            # Store token with expiration (24 hours)
            expiration = datetime.now() + timedelta(hours=24)
            cursor.execute('''
                INSERT INTO password_reset_tokens (user_id, token, expiration)
                VALUES (?, ?, ?)
            ''', (user_id, token, expiration.isoformat()))
            conn.commit()

            # Generate reset link
            reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
            
            # Send email with reset link
            html_content = get_password_reset_template(reset_link)
            if send_email(email, "Password Reset Instructions", html_content):
                return jsonify({'message': f'Password reset instructions have been sent to {email}'})
            else:
                return jsonify({'error': 'Failed to send email'}), 500
        else:
            # For security reasons, don't reveal that the email doesn't exist
            return jsonify({'message': f'If an account exists with {email}, you will receive password reset instructions'})

    except Exception as e:
        logger.error(f"Error in forgot_password: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('newPassword')

        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400

        conn = connect_to_db()
        cursor = conn.cursor()

        # First check if token exists and is valid
        cursor.execute('''
            SELECT user_id, expiration 
            FROM password_reset_tokens 
            WHERE token = ?
        ''', (token,))
        
        token_data = cursor.fetchone()
        if not token_data:
            return jsonify({'error': 'Invalid or expired token'}), 400

        user_id, expiration = token_data
        expiration_date = datetime.fromisoformat(expiration)

        # Check if token has expired
        if datetime.now() > expiration_date:
            # Clean up expired token
            cursor.execute('DELETE FROM password_reset_tokens WHERE token = ?', (token,))
            conn.commit()
            return jsonify({'error': 'Token has expired'}), 400

        # Update the password
        hashed_password = generate_password_hash(new_password)
        cursor.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            (hashed_password, user_id)
        )

        # Clean up used token
        cursor.execute('DELETE FROM password_reset_tokens WHERE token = ?', (token,))
        conn.commit()

        if cursor.rowcount > 0:
            return jsonify({'message': 'Password successfully reset'})
        else:
            return jsonify({'error': 'Failed to reset password'}), 400

    except Exception as e:
        logger.error(f"Error in reset_password: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if conn:
            conn.close()

# Initialize database
init_db()

if __name__ == '__main__':
    # Log configuration
    logger.info("Email Configuration:")
    logger.info(f"SMTP_SERVER: {SMTP_SERVER}")
    logger.info(f"SMTP_PORT: {SMTP_PORT}")
    logger.info(f"SMTP_USERNAME: {SMTP_USERNAME}")
    logger.info(f"SMTP_PASSWORD: {'[SET]' if SMTP_PASSWORD else '[NOT SET]'}")
    logger.info(f"FRONTEND_URL: {FRONTEND_URL}")
    logger.info(f"Using database at: {DB_PATH}")
    
    # Start server
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5001, debug=True)