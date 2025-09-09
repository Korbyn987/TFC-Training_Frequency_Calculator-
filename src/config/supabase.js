import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://gldsfwwccrnjgkmpfpkq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZHNmd3djY3JuamdrbXBmcGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MzU3MTEsImV4cCI6MjA3MjUxMTcxMX0.M1jh8iFWv3S3pYIxXMCG0Vvgrzkxn8mQDL38KOnE1Ks";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable automatic session refresh for React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  // Configure for React Native environment
  global: {
    headers: {
      "X-Client-Info": "tfc-app@1.0.0"
    },
    fetch: (...args) => fetch(...args)
  },
  // Add network timeout configuration
  db: {
    schema: "public"
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper function to check if user is authenticated
export const getCurrentUser = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting current user:", error);
    return null;
  }
  return user;
};

// Helper function to get current session
export const getCurrentSession = async () => {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting current session:", error);
    return null;
  }
  return session;
};

export default supabase;
