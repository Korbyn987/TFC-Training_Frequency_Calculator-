import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detect if running in Chrome debugger
const isDebuggingInChrome = typeof DedicatedWorkerGlobalScope !== 'undefined' || 
                           typeof importScripts === 'function' ||
                           (typeof navigator !== 'undefined' && navigator.product === 'ReactNative' && typeof window !== 'undefined');

// Open database (only if not in Chrome debugger)
let db = null;
if (!isDebuggingInChrome) {
  try {
    db = SQLite.openDatabase('tfc_users.db');
  } catch (error) {
    console.warn('SQLite not available, falling back to AsyncStorage:', error);
  }
}

// Helper function to promisify SQLite operations
const executeSqlAsync = (sql, params = []) => {
  if (!db) {
    throw new Error('SQLite not available in Chrome debugger. Disable remote debugging to use SQLite.');
  }
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// Fallback storage for Chrome debugging
const fallbackStorage = {
  users: 'tfc_fallback_users',
  workouts: 'tfc_fallback_workouts'
};

// Get stored data from AsyncStorage
const getFallbackData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(fallbackStorage[key]);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Fallback storage error:', error);
    return [];
  }
};

// Store data to AsyncStorage
const setFallbackData = async (key, data) => {
  try {
    await AsyncStorage.setItem(fallbackStorage[key], JSON.stringify(data));
  } catch (error) {
    console.error('Fallback storage error:', error);
  }
};

// Initialize database tables
export const initDatabase = async () => {
  try {
    if (db) {
      // Create users table
      await executeSqlAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        );
      `);
      console.log('Users table created successfully');
      
      // Create workouts table
      await executeSqlAsync(`
        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          workout_name TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          duration INTEGER,
          exercises TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Workouts table created successfully');
    } else {
      // Initialize fallback storage
      await setFallbackData('users', []);
      await setFallbackData('workouts', []);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Simple hash function for passwords (using built-in crypto if available)
const hashPassword = (password, salt) => {
  // Simple hash implementation for React Native
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

const generateSalt = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Register new user
export const registerUser = async (username, email, password) => {
  try {
    if (db) {
      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);
      
      const result = await executeSqlAsync(
        'INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, salt]
      );
      
      console.log('User registered successfully:', result.insertId);
      return {
        success: true,
        userId: result.insertId,
        message: 'Account created successfully!'
      };
    } else {
      // Fallback to AsyncStorage
      const users = await getFallbackData('users');
      const existingUser = users.find(user => user.username === username || user.email === email);
      if (existingUser) {
        throw { success: false, message: 'Username or email already exists' };
      }
      
      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);
      const newUser = { username, email, passwordHash, salt };
      users.push(newUser);
      await setFallbackData('users', users);
      
      console.log('User registered successfully (fallback):', newUser);
      return {
        success: true,
        userId: users.length - 1,
        message: 'Account created successfully!'
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('username')) {
        throw { success: false, message: 'Username already exists' };
      } else if (error.message.includes('email')) {
        throw { success: false, message: 'Email already registered' };
      }
    }
    throw { success: false, message: 'Registration failed' };
  }
};

// Login user
export const loginUser = async (usernameOrEmail, password) => {
  try {
    if (db) {
      const result = await executeSqlAsync(
        'SELECT * FROM users WHERE (username = ? OR email = ?)',
        [usernameOrEmail, usernameOrEmail]
      );
      
      if (result.rows.length > 0) {
        const user = result.rows.item(0);
        const passwordHash = hashPassword(password, user.salt);
        if (passwordHash === user.password_hash) {
          // Update last login
          await executeSqlAsync(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
          );
          
          console.log('Login successful for user:', user.username);
          return {
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              lastLogin: user.last_login
            },
            message: 'Login successful!'
          };
        } else {
          throw { success: false, message: 'Invalid username/email or password' };
        }
      } else {
        throw { success: false, message: 'Invalid username/email or password' };
      }
    } else {
      // Fallback to AsyncStorage
      const users = await getFallbackData('users');
      const user = users.find(user => user.username === usernameOrEmail || user.email === usernameOrEmail);
      if (!user) {
        throw { success: false, message: 'Invalid username/email or password' };
      }
      
      const passwordHash = hashPassword(password, user.salt);
      if (passwordHash !== user.passwordHash) {
        throw { success: false, message: 'Invalid username/email or password' };
      }
      
      console.log('Login successful for user (fallback):', user.username);
      return {
        success: true,
        user: {
          id: users.indexOf(user),
          username: user.username,
          email: user.email,
          lastLogin: null
        },
        message: 'Login successful!'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.success === false) {
      throw error;
    }
    throw { success: false, message: 'Authentication failed' };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    if (db) {
      const result = await executeSqlAsync(
        'SELECT id, username, email, created_at, last_login FROM users WHERE id = ?',
        [userId]
      );
      
      if (result.rows.length > 0) {
        return result.rows.item(0);
      } else {
        throw { success: false, message: 'User not found' };
      }
    } else {
      // Fallback to AsyncStorage
      const users = await getFallbackData('users');
      const user = users[userId];
      if (!user) {
        throw { success: false, message: 'User not found' };
      }
      
      return {
        id: userId,
        username: user.username,
        email: user.email,
        created_at: null,
        last_login: null
      };
    }
  } catch (error) {
    console.error('Get user error:', error);
    throw { success: false, message: 'Failed to get user' };
  }
};

// Check if username exists
export const checkUsernameExists = async (username) => {
  try {
    if (db) {
      const result = await executeSqlAsync(
        'SELECT COUNT(*) as count FROM users WHERE username = ?',
        [username]
      );
      const count = result.rows.item(0).count;
      return count > 0;
    } else {
      // Fallback to AsyncStorage
      const users = await getFallbackData('users');
      return users.some(user => user.username === username);
    }
  } catch (error) {
    console.error('Check username error:', error);
    return false;
  }
};

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    if (db) {
      const result = await executeSqlAsync(
        'SELECT COUNT(*) as count FROM users WHERE email = ?',
        [email]
      );
      const count = result.rows.item(0).count;
      return count > 0;
    } else {
      // Fallback to AsyncStorage
      const users = await getFallbackData('users');
      return users.some(user => user.email === email);
    }
  } catch (error) {
    console.error('Check email error:', error);
    return false;
  }
};
