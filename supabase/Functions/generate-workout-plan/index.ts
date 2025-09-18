// supabase/functions/generate-workout-plan/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "npm:openai@^4"; // Import the official OpenAI library
import { corsHeaders } from "../_shared/cors.ts";

// Initialize the OpenAI client. It will automatically use the
// OPENAI_API_KEY secret we set in our Supabase project.
const openai = new OpenAI();

serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    // Use the official OpenAI client to create the chat completion
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or "gpt-4" if your key supports it
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const aiResponse = chatCompletion.choices[0].message.content;
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
