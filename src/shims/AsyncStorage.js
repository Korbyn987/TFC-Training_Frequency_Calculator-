/**
 * Shim for @react-native-async-storage/async-storage for web environment
 * This implements a web-compatible version of AsyncStorage using localStorage
 * with fallbacks for private browsing mode and storage quotas
 */

// Check if localStorage is available and working
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// In-memory fallback storage for private browsing or when localStorage is unavailable
const memoryStorage = new Map();

// Simple wrapper around localStorage that mimics the AsyncStorage API
const AsyncStorage = {
  // Store data
  setItem: async (key, value) => {
    if (!key) {
      console.error('AsyncStorage: Cannot store with empty key');
      return false;
    }
    
    try {
      // AsyncStorage expects to store objects/values as JSON strings
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      
      // Try to use localStorage first
      if (isLocalStorageAvailable()) {
        localStorage.setItem(key, value);
      } else {
        // Fallback to memory storage
        memoryStorage.set(key, value);
        console.warn('Using in-memory storage fallback for key:', key);
      }
      return true;
    } catch (error) {
      // Handle storage quota errors
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn('Storage quota exceeded, using in-memory fallback');
        memoryStorage.set(key, value);
        return true;
      }
      console.error('AsyncStorage setItem error:', error);
      return false;
    }
  },

  // Retrieve data
  getItem: async (key) => {
    if (!key) {
      console.warn('AsyncStorage: Cannot get item with empty key');
      return null;
    }
    
    try {
      let value;
      // Try localStorage first
      if (isLocalStorageAvailable()) {
        value = localStorage.getItem(key);
      }
      
      // Check memory fallback if value is null
      if (value === null && memoryStorage.has(key)) {
        value = memoryStorage.get(key);
        console.log('Retrieved value from memory fallback for key:', key);
      }
      
      // In AsyncStorage, null is returned for non-existent keys
      return value;
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      
      // Try memory fallback on error
      if (memoryStorage.has(key)) {
        return memoryStorage.get(key);
      }
      
      return null;
    }
  },

  // Remove an item
  removeItem: async (key) => {
    if (!key) {
      console.warn('AsyncStorage: Cannot remove item with empty key');
      return false;
    }
    
    try {
      // Try to remove from both storages
      if (isLocalStorageAvailable()) {
        localStorage.removeItem(key);
      }
      memoryStorage.delete(key);
      return true;
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
      // Still try memory fallback
      memoryStorage.delete(key);
      return false;
    }
  },

  // Get all keys
  getAllKeys: async () => {
    try {
      const keys = new Set();
      
      // Get keys from localStorage
      if (isLocalStorageAvailable()) {
        for (let i = 0; i < localStorage.length; i++) {
          keys.add(localStorage.key(i));
        }
      }
      
      // Merge with memory storage keys
      memoryStorage.forEach((_, key) => {
        keys.add(key);
      });
      
      return Array.from(keys);
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      // Return at least memory keys on error
      return Array.from(memoryStorage.keys());
    }
  },

  // Clear all storage
  clear: async () => {
    try {
      // Clear both storages
      if (isLocalStorageAvailable()) {
        localStorage.clear();
      }
      memoryStorage.clear();
      return true;
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      // Still try to clear memory storage
      memoryStorage.clear();
      return false;
    }
  },

  // Multi-get - get multiple items in a batch
  multiGet: async (keys) => {
    if (!Array.isArray(keys)) {
      console.error('AsyncStorage multiGet: Expected an array of keys');
      return [];
    }
    
    try {
      const results = await Promise.all(keys.map(async (key) => {
        const value = await AsyncStorage.getItem(key);
        return [key, value];
      }));
      return results;
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      
      // Fallback to non-async version
      try {
        const results = keys.map(key => {
          let value;
          if (isLocalStorageAvailable()) {
            value = localStorage.getItem(key);
          }
          if (value === null && memoryStorage.has(key)) {
            value = memoryStorage.get(key);
          }
          return [key, value];
        });
        return results;
      } catch (e) {
        return keys.map(key => [key, null]);
      }
    }
  },

  // Multi-set - set multiple items in a batch
  multiSet: async (keyValuePairs) => {
    if (!Array.isArray(keyValuePairs)) {
      console.error('AsyncStorage multiSet: Expected an array of key-value pairs');
      return false;
    }
    
    try {
      await Promise.all(keyValuePairs.map(async ([key, value]) => {
        await AsyncStorage.setItem(key, value);
      }));
      return true;
    } catch (error) {
      console.error('AsyncStorage multiSet error:', error);
      
      // Try non-async version
      try {
        keyValuePairs.forEach(([key, value]) => {
          if (value === null || value === undefined) {
            value = '';
          } else if (typeof value !== 'string') {
            value = JSON.stringify(value);
          }
          
          if (isLocalStorageAvailable()) {
            try {
              localStorage.setItem(key, value);
            } catch (e) {
              memoryStorage.set(key, value);
            }
          } else {
            memoryStorage.set(key, value);
          }
        });
        return true;
      } catch (e) {
        return false;
      }
    }
  },

  // Multi-remove - remove multiple items in a batch
  multiRemove: async (keys) => {
    if (!Array.isArray(keys)) {
      console.error('AsyncStorage multiRemove: Expected an array of keys');
      return false;
    }
    
    try {
      await Promise.all(keys.map(async key => {
        await AsyncStorage.removeItem(key);
      }));
      return true;
    } catch (error) {
      console.error('AsyncStorage multiRemove error:', error);
      
      // Try non-async fallback
      try {
        keys.forEach(key => {
          if (isLocalStorageAvailable()) {
            localStorage.removeItem(key);
          }
          memoryStorage.delete(key);
        });
        return true;
      } catch (e) {
        return false;
      }
    }
  },

  // Merge an existing item with new value
  mergeItem: async (key, value) => {
    if (!key) {
      console.error('AsyncStorage mergeItem: Empty key provided');
      return false;
    }
    
    try {
      // Get existing value from either storage
      let existingValue;
      if (isLocalStorageAvailable()) {
        existingValue = localStorage.getItem(key);
      }
      if (existingValue === null && memoryStorage.has(key)) {
        existingValue = memoryStorage.get(key);
      }
      
      if (!existingValue) {
        // If no existing value, just set
        return await AsyncStorage.setItem(key, value);
      }

      // Parse existing value
      let parsedExisting;
      try {
        parsedExisting = JSON.parse(existingValue);
      } catch {
        parsedExisting = existingValue;
      }

      // Parse new value
      let parsedValue;
      if (typeof value === 'string') {
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = value;
        }
      } else {
        parsedValue = value;
      }

      // Only objects can be merged
      if (typeof parsedExisting === 'object' && parsedExisting !== null && 
          typeof parsedValue === 'object' && parsedValue !== null) {
        // Deep merge for objects
        const deepMerge = (target, source) => {
          for (const key in source) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
              }
              deepMerge(target[key], source[key]);
            } else {
              target[key] = source[key];
            }
          }
          return target;
        };

        const merged = deepMerge({...parsedExisting}, parsedValue);
        return await AsyncStorage.setItem(key, JSON.stringify(merged));
      } else {
        // If either is not an object, just overwrite with new value
        return await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('AsyncStorage mergeItem error:', error);
      
      // Try direct set as fallback
      try {
        return await AsyncStorage.setItem(key, value);
      } catch (e) {
        return false;
      }
    }
  },

  // Multi-merge - merge multiple items in a batch
  multiMerge: async (keyValuePairs) => {
    if (!Array.isArray(keyValuePairs)) {
      console.error('AsyncStorage multiMerge: Expected an array of key-value pairs');
      return false;
    }
    
    try {
      await Promise.all(keyValuePairs.map(async ([key, value]) => {
        await AsyncStorage.mergeItem(key, value);
      }));
      return true;
    } catch (error) {
      console.error('AsyncStorage multiMerge error:', error);
      
      // Try non-async fallback
      try {
        for (const [key, value] of keyValuePairs) {
          // Just do a setItem as fallback
          if (isLocalStorageAvailable()) {
            try {
              localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            } catch (e) {
              memoryStorage.set(key, typeof value === 'string' ? value : JSON.stringify(value));
            }
          } else {
            memoryStorage.set(key, typeof value === 'string' ? value : JSON.stringify(value));
          }
        }
        return true;
      } catch (e) {
        return false;
      }
    }
  },
  
  // Flush any pending storage operations (noop in this implementation but needed for compatibility)
  flushGetRequests: async () => {
    return true;
  }
};

// Add support for checking if AsyncStorage is ready
AsyncStorage.isReady = true;

// Export as both default and named export to match AsyncStorage patterns
export default AsyncStorage;
export { AsyncStorage };

// Make sure AsyncStorage is available globally for libraries that expect it
if (typeof window !== 'undefined') {
  window.AsyncStorage = AsyncStorage;
}
