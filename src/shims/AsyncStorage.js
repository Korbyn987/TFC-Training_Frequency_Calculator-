/**
 * Shim for @react-native-async-storage/async-storage for web environment
 * This implements a web-compatible version of AsyncStorage using localStorage
 */

// Simple wrapper around localStorage that mimics the AsyncStorage API
const AsyncStorage = {
  // Store data
  setItem: async (key, value) => {
    try {
      // AsyncStorage expects to store objects/values as JSON strings
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
      throw error;
    }
  },

  // Retrieve data
  getItem: async (key) => {
    try {
      const value = localStorage.getItem(key);
      // In AsyncStorage, null is returned for non-existent keys
      return value;
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      throw error;
    }
  },

  // Remove an item
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
      throw error;
    }
  },

  // Get all keys
  getAllKeys: async () => {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return keys;
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      throw error;
    }
  },

  // Clear all storage
  clear: async () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      throw error;
    }
  },

  // Multi-get - get multiple items in a batch
  multiGet: async (keys) => {
    try {
      const results = keys.map(key => {
        const value = localStorage.getItem(key);
        return [key, value];
      });
      return results;
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      throw error;
    }
  },

  // Multi-set - set multiple items in a batch
  multiSet: async (keyValuePairs) => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        if (typeof value !== 'string') {
          value = JSON.stringify(value);
        }
        localStorage.setItem(key, value);
      });
      return true;
    } catch (error) {
      console.error('AsyncStorage multiSet error:', error);
      throw error;
    }
  },

  // Multi-remove - remove multiple items in a batch
  multiRemove: async (keys) => {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('AsyncStorage multiRemove error:', error);
      throw error;
    }
  },

  // Merge an existing item with new value
  mergeItem: async (key, value) => {
    try {
      const existingValue = localStorage.getItem(key);
      if (!existingValue) {
        // If no existing value, just set
        if (typeof value !== 'string') {
          value = JSON.stringify(value);
        }
        localStorage.setItem(key, value);
        return true;
      }

      // Parse existing and new values
      let parsedExisting;
      try {
        parsedExisting = JSON.parse(existingValue);
      } catch {
        parsedExisting = existingValue;
      }

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
        const merged = { ...parsedExisting, ...parsedValue };
        localStorage.setItem(key, JSON.stringify(merged));
      } else {
        // If either is not an object, just overwrite with new value
        if (typeof value !== 'string') {
          value = JSON.stringify(value);
        }
        localStorage.setItem(key, value);
      }
      return true;
    } catch (error) {
      console.error('AsyncStorage mergeItem error:', error);
      throw error;
    }
  },

  // Multi-merge - merge multiple items in a batch
  multiMerge: async (keyValuePairs) => {
    try {
      for (const [key, value] of keyValuePairs) {
        await AsyncStorage.mergeItem(key, value);
      }
      return true;
    } catch (error) {
      console.error('AsyncStorage multiMerge error:', error);
      throw error;
    }
  }
};

// Export as both default and named export to match AsyncStorage patterns
export default AsyncStorage;
export { AsyncStorage };
