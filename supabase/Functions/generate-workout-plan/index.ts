// supabase/functions/generate-workout-plan/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// IMPORTANT: Your secret key is now your OpenRouter key, not your OpenAI key.
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("--- Invoking OpenRouter Edge Function v2 ---");
    const { prompt } = await req.json(); // Re-enable user prompt

    // --- Final Debugging Step: Log the incoming prompt ---
    console.log("--- Received Prompt from App ---");
    console.log(prompt);
    console.log("--------------------------------");

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    // Note: We are now using a manual fetch call because the official OpenAI
    // library does not easily support custom base URLs for services like OpenRouter.
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://tfc.ai", // Optional, but recommended by OpenRouter
        "X-Title": "TFC AI Workout Planner" // Optional, but recommended
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // Use a powerful, cost-effective model
        messages: [{ role: "user", content: prompt }] // Use the real prompt
      })
    });

    if (!response.ok) {
      // If the response is not OK, read the response as text and log it.
      const errorText = await response.text();
      console.error("OpenRouter API Error Response:", errorText);
      throw new Error(
        `Failed to fetch from OpenRouter API. Status: ${response.status}. Body: ${errorText}`
      );
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Log the raw response from the AI to debug parsing issues
    console.log("--- Raw AI Response ---");
    console.log(aiResponse);
    console.log("-----------------------");

    // --- The Fix: Strip markdown code blocks if they exist ---
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      aiResponse = jsonMatch[1];
    }
    // --- End of Fix ---

    const planJson = JSON.parse(aiResponse);

    return new Response(JSON.stringify(planJson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
