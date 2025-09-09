import { supabase } from "../config/supabase";

// Test Supabase connection and basic operations
export const testSupabaseConnection = async () => {
  console.log("🧪 Testing Supabase connection...");

  try {
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Connection test failed:", error);
      return false;
    }

    console.log("✅ Supabase connection successful");

    // Test 2: Auth status
    const {
      data: { session }
    } = await supabase.auth.getSession();
    console.log("🔐 Auth session:", session ? "Active" : "None");

    // Test 3: Check if tables exist
    const tables = ["users", "workouts", "user_stats", "workout_exercises"];
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select("*")
          .limit(1);

        if (tableError) {
          console.warn(
            `⚠️ Table ${table} might not exist:`,
            tableError.message
          );
        } else {
          console.log(`✅ Table ${table} accessible`);
        }
      } catch (err) {
        console.warn(`⚠️ Error checking table ${table}:`, err.message);
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Supabase test failed:", error);
    return false;
  }
};

// Test user registration flow
export const testUserRegistration = async () => {
  console.log("🧪 Testing user registration...");

  const testEmail = `test-${Date.now()}@gmail.com`;
  const testUsername = `testuser${Date.now()}`;
  const testPassword = "TestPassword123!";

  try {
    // Test registration
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: testUsername,
          display_name: `Test User ${Date.now()}`
        }
      }
    });

    if (authError) {
      console.error("❌ Registration failed:", authError);
      return false;
    }

    console.log("✅ Test user registered:", authData.user?.id);

    // Clean up test user (optional)
    if (authData.user) {
      await supabase.auth.signOut();
      console.log("🧹 Test user signed out");
    }

    return true;
  } catch (error) {
    console.error("❌ Registration test failed:", error);
    return false;
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log("🚀 Starting Supabase integration tests...\n");

  const connectionTest = await testSupabaseConnection();
  console.log("");

  const registrationTest = await testUserRegistration();
  console.log("");

  const allPassed = connectionTest && registrationTest;

  console.log("📊 Test Results:");
  console.log(`Connection: ${connectionTest ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Registration: ${registrationTest ? "✅ PASS" : "❌ FAIL"}`);
  console.log(
    `Overall: ${allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}`
  );

  return allPassed;
};
