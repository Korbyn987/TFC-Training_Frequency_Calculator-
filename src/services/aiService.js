import { supabase } from "../config/supabase";

// This function simulates calling a secure backend endpoint.
// In a real app, you would replace the mock logic with a fetch or axios call.
export const generateWorkoutPlan = async (
  userGoals,
  recoveryData,
  workoutHistory
) => {
  // 1. Construct the detailed prompt for the AI
  const prompt = `
    System Prompt: You are an expert personal trainer and fitness coach named 'Cascade'. Your task is to create a personalized workout plan based on the user's goals, experience, and current recovery status. The output must be a clean, stringified JSON object and nothing else.

    User Data:

    - Primary Goal: ${userGoals.goal}
    - Experience Level: ${userGoals.level}
    - Workouts Per Week: ${userGoals.frequency}
    - Available Equipment: ${userGoals.equipment}
    - Current Muscle Recovery: ${JSON.stringify(recoveryData, null, 2)}
    - Recent Workout History: ${JSON.stringify(
      workoutHistory.map((w) => ({ name: w.name, date: w.completed_at })),
      null,
      2
    )}

    Instructions:

    1. Generate a workout plan for the specified number of days.
    2. Prioritize exercises that target the most recovered muscle groups. Avoid training muscles that are still sore (less than 75% recovered).
    3. Consider the user's experience level and available equipment.
    4. Structure the output as a JSON object with a 'plan' key, containing a 'name' and an array of 'days'. Each day should have a 'day' number, a 'focus' string, and an array of 'exercises'. Each exercise should have a 'name', 'sets' (e.g., "4x8-12"), and 'rest' (e.g., "60-90s").
  `;

  console.log("--- Invoking Supabase Edge Function with Prompt ---");

  // 2. Invoke the Supabase Edge Function
  try {
    const { data, error } = await supabase.functions.invoke(
      "generate-workout-plan",
      {
        body: { prompt }
      }
    );

    if (error) {
      throw error;
    }

    // The data returned from the function is the parsed JSON plan
    return { success: true, plan: data.plan };
  } catch (error) {
    console.error("Error invoking Supabase function:", error);
    return { success: false, error: "Failed to connect to the AI service." };
  }
};
