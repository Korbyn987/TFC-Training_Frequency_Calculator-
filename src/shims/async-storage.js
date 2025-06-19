// Simple in-memory storage implementation
const storage = new Map();

const AsyncStorage = {
  getItem: async (key) => {
    return storage.get(key) || null;
  },
  setItem: async (key, value) => {
    storage.set(key, value);
  },
  removeItem: async (key) => {
    storage.delete(key);
  },
  clear: async () => {
    storage.clear();
  },
  getAllKeys: async () => {
    return Array.from(storage.keys());
  },
  multiGet: async (keys) => {
    return keys.map(key => [key, storage.get(key) || null]);
  },
  multiSet: async (keyValuePairs) => {
    keyValuePairs.forEach(([key, value]) => {
      storage.set(key, value);
    });
  },
  multiRemove: async (keys) => {
    keys.forEach(key => storage.delete(key));
  },
};

export default AsyncStorage;
