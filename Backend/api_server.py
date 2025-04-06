from flask import Flask, request, jsonify, url_for
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import logging
import os
import secrets
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email_templates import get_username_recovery_template, get_password_reset_template
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:19006")

# Log email configuration
logger.info(f"Email Configuration:")
logger.info(f"SMTP_SERVER: {SMTP_SERVER}")
logger.info(f"SMTP_PORT: {SMTP_PORT}")
logger.info(f"SMTP_USERNAME: {SMTP_USERNAME}")
logger.info(f"SMTP_PASSWORD: {'[SET]' if SMTP_PASSWORD else '[NOT SET]'}")
logger.info(f"FRONTEND_URL: {FRONTEND_URL}")

if not SMTP_USERNAME or not SMTP_PASSWORD:
    logger.warning("Email credentials not set. Please configure SMTP_USERNAME and SMTP_PASSWORD in .env file")

# Database setup
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tfc_database.db')
logger.info(f"Using database at: {DB_PATH}")

def send_email(to_email, subject, html_content):
    try:
        logger.info(f"Attempting to send email to {to_email}")
        logger.info(f"Using SMTP settings - Server: {SMTP_SERVER}, Port: {SMTP_PORT}")
        logger.info(f"Using email: {SMTP_USERNAME}")

        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(html_content, 'html'))

        logger.info("Connecting to SMTP server with SSL...")
        server = smtplib.SMTP_SSL(SMTP_SERVER, 465)  # Use SSL on port 465
        server.set_debuglevel(1)  # Add debug info
        
        logger.info("Attempting login...")
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        
        logger.info("Sending message...")
        server.send_message(msg)
        
        logger.info("Closing connection...")
        server.quit()
        
        logger.info("Email sent successfully!")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication Error: {str(e)}")
        logger.error("Please check your email and app password")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP Error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False

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
            test_password = generate_password_hash("test123")
            cursor.execute('''
                INSERT INTO users (username, password, email)
                VALUES (?, ?, ?)
            ''', ('testuser', test_password, 'trainingfrequencycalculator@gmail.com'))
        
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
                return jsonify({'message': f'Password reset instructions sent to {email}'})
            else:
                return jsonify({'error': 'Failed to send email'}), 500
        else:
            return jsonify({'error': 'No account found with this email'}), 404

    except Exception as e:
        logger.error(f"Error in forgot_password: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('newPassword')

        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400

        # In a real application, you would:
        # 1. Verify the token is valid and not expired
        # 2. Get the user ID from the token
        # For demo purposes, we'll parse our simple token
        try:
            # Parse our demo token format
            user_id = int(token.split('_')[2])
        except (IndexError, ValueError):
            return jsonify({'error': 'Invalid token'}), 400

        conn = connect_to_db()
        cursor = conn.cursor()

        # Update the password
        hashed_password = generate_password_hash(new_password)
        cursor.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            (hashed_password, user_id)
        )
        conn.commit()

        if cursor.rowcount > 0:
            return jsonify({'message': 'Password successfully reset'})
        else:
            return jsonify({'error': 'Failed to reset password'}), 400

    except Exception as e:
        logger.error(f"Error in reset_password: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    # Initialize the database
    init_db()
    # Run the server on port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)