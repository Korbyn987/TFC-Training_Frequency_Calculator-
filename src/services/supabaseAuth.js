import { supabase } from "../config/supabase";

// Register new user with Supabase Auth
export const registerUser = async (
  username,
  email,
  password,
  additionalData = {}
) => {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: additionalData.display_name || username,
          ...additionalData
        }
      }
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      throw { success: false, message: authError.message };
    }

    if (authData.user) {
      console.log("User registered successfully:", authData.user.id);

      // Check if email confirmation is required
      const needsConfirmation = !authData.user.email_confirmed_at;

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username,
          needsConfirmation,
          ...additionalData
        },
        message: needsConfirmation
          ? "Account created! Please check your email and click the confirmation link before logging in."
          : "Account created successfully! You can now log in."
      };
    }

    throw { success: false, message: "Registration failed" };
  } catch (error) {
    console.error("Registration error:", error);
    if (error.success === false) {
      throw error;
    }
    throw { success: false, message: "Registration failed" };
  }
};

// Login user with Supabase Auth
export const loginUser = async (email, password) => {
  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (authError) {
      console.error("Supabase login error:", authError);
      throw { success: false, message: authError.message };
    }

    if (authData.user) {
      // Get user profile from our users table
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", authData.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        // If profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            auth_user_id: authData.user.id,
            email: authData.user.email,
            username:
              authData.user.user_metadata?.username ||
              authData.user.email.split("@")[0],
            display_name:
              authData.user.user_metadata?.display_name ||
              authData.user.email.split("@")[0]
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating user profile:", createError);
          throw { success: false, message: "Failed to create user profile" };
        }

        return {
          success: true,
          user: {
            id: newProfile.id,
            auth_id: authData.user.id,
            username: newProfile.username,
            email: newProfile.email,
            display_name: newProfile.display_name
          },
          session: authData.session,
          message: "Login successful!"
        };
      }

      // Update last login
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userProfile.id);

      console.log("Login successful for user:", userProfile.username);
      return {
        success: true,
        user: {
          id: userProfile.id,
          auth_id: authData.user.id,
          username: userProfile.username,
          email: userProfile.email,
          display_name: userProfile.display_name,
          profile_picture_url: userProfile.profile_picture_url,
          fitness_level: userProfile.fitness_level
        },
        session: authData.session,
        message: "Login successful!"
      };
    }

    throw { success: false, message: "Login failed" };
  } catch (error) {
    console.error("Login error:", error);
    if (error.success === false) {
      throw error;
    }
    throw { success: false, message: "Authentication failed" };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      throw { success: false, message: error.message };
    }

    console.log("User logged out successfully");
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Logout error:", error);
    throw { success: false, message: "Logout failed" };
  }
};

// Get current user session
export const getCurrentUser = async () => {
  try {
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return null;
    }

    if (!session?.user) {
      return null;
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", session.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return null;
    }

    return {
      id: userProfile.id,
      auth_id: session.user.id,
      username: userProfile.username,
      email: userProfile.email,
      display_name: userProfile.display_name,
      profile_picture_url: userProfile.profile_picture_url,
      fitness_level: userProfile.fitness_level,
      session
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      throw { success: false, message: error.message };
    }

    console.log("Profile updated successfully");
    return {
      success: true,
      user: data,
      message: "Profile updated successfully"
    };
  } catch (error) {
    console.error("Update profile error:", error);
    throw { success: false, message: "Failed to update profile" };
  }
};

// Update user
export const updateUser = async (updates) => {
  try {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://yourapp.com/reset-password" // Update with your app's reset URL
    });

    if (error) {
      console.error("Password reset error:", error);
      throw { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Password reset email sent! Check your inbox."
    };
  } catch (error) {
    console.error("Reset password error:", error);
    throw { success: false, message: "Failed to send reset email" };
  }
};

// Check if username exists
export const checkUsernameExists = async (username) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Username check error:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Check username error:", error);
    return false;
  }
};

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Email check error:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Check email error:", error);
    return false;
  }
};

// Resend confirmation email
export const resendConfirmationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email
    });

    if (error) {
      console.error("Resend confirmation error:", error);
      throw { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Confirmation email sent! Please check your inbox."
    };
  } catch (error) {
    console.error("Resend confirmation error:", error);
    throw { success: false, message: "Failed to resend confirmation email" };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, session?.user?.id);

    if (event === "SIGNED_IN" && session?.user) {
      const user = await getCurrentUser();
      callback(event, user);
    } else if (event === "SIGNED_OUT") {
      callback(event, null);
    } else {
      callback(event, session?.user || null);
    }
  });
};
