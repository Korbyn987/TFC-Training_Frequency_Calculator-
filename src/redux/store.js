import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import authReducer from "./authSlice";
import workoutReducer from "./workoutSlice";

// Configuration for persisting the Redux store
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Only persist these reducers
  whitelist: ['workout', 'auth']
};

// Combine reducers
const rootReducer = combineReducers({
  workout: workoutReducer,
  auth: authReducer
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create a persistor object for the store
const persistor = persistStore(store);

export { store, persistor };

export default store;
