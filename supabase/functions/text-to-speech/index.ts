import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId = "EXAVITQu4vr4xnSDxMaL" } = await req.json(); // Sarah voice
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    if (!text || text.length === 0) {
      throw new Error("Text is required");
    }

    // Truncate text if too long (ElevenLabs limit is 5000 chars)
    const truncatedText = text.length > 5000 ? text.substring(0, 5000) : text;

    // Use Laura voice for calm, relaxing meditation narration
    const meditationVoiceId = "FGY2WhTYpPnrIDTdsKH5"; // Laura - calm female voice
    const selectedVoice = voiceId === "EXAVITQu4vr4xnSDxMaL" ? meditationVoiceId : voiceId;

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
            stability: 0.85,        // Higher stability for calmer, more consistent voice
            similarity_boost: 0.6,  // Slightly reduced for softer sound
            style: 0.15,            // Low style for gentle, understated delivery
            use_speaker_boost: false, // Disabled for softer, more intimate sound
            speed: 0.75,            // Slower pace for relaxation
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
