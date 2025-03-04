from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc

app = Flask(__name__)
CORS(app)  # This allows frontend to make requests to this API

def connect_to_db():
    try:
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

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
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
                return jsonify({"message": "User registered successfully"}), 201
                
            except Exception as e:
                conn.rollback()
                return jsonify({"error": str(e)}), 400
            finally:
                conn.close()
        return jsonify({"error": "Database connection failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

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
                    return jsonify({
                        "message": "Login successful",
                        "user": {
                            "name": user_data[0],
                            "age": user_data[1],
                            "gender": user_data[2],
                            "weight": user_data[3],
                            "height": user_data[4]
                        }
                    }), 200
                else:
                    return jsonify({"error": "Invalid username or password"}), 401
                    
            except Exception as e:
                return jsonify({"error": str(e)}), 400
            finally:
                conn.close()
        return jsonify({"error": "Database connection failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
