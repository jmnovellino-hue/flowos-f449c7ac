import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, voiceId = "FGY2WhTYpPnrIDTdsKH5" } = await req.json(); // Default to Laura voice
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    if (!text || text.length === 0) {
      throw new Error("Text is required");
    }

    // Truncate text if too long (ElevenLabs limit is 5000 chars)
    const truncatedText = text.length > 5000 ? text.substring(0, 5000) : text;

    // Voice options with calm, slow settings
    // Available voices for meditation/relaxation:
    // - FGY2WhTYpPnrIDTdsKH5: Laura - calm female voice (default)
    // - SAz9YHcvj6GT2YYXdXww: River - warm male voice
    // - pFZP5JQG7iQjIQuC4Bku: Lily - gentle female voice
    // - nPczCjzI2devNBz1zQrb: Brian - soothing male voice
    // - XrExE9yKIg1WjnnlVkGX: Matilda - calm female voice
    // - onwK4e9ZLuTAKqWW03F9: Daniel - warm male voice

    const selectedVoice = voiceId;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: truncatedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.9,         // Very high stability for calmer, more consistent voice
            similarity_boost: 0.5,  // Reduced for softer, gentler sound
            style: 0.1,             // Very low style for gentle, understated delivery
            use_speaker_boost: false, // Disabled for softer, more intimate sound
            speed: 0.7,             // Even slower pace for deep relaxation
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      throw new Error(`TTS API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});