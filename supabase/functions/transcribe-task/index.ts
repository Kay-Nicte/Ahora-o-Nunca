import Anthropic from "npm:@anthropic-ai/sdk@^0.39.0";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const CLASSIFY_PROMPT = `You receive a voice transcription from a TDAH task management app.
Extract:
1. The task text (clean, short, in the same language as input)
2. Category: one of "home", "work", "mobile", "errands", "personal" (or null)
3. Energy levels: array from "high", "calm", "short_time", "mobile_only"

Rules for energy:
- "high": physical effort, focus, leaving house
- "calm": relaxed, low effort
- "short_time": 5-10 minutes
- "mobile_only": can do from phone

Return ONLY JSON: {"text": "...", "category": "...", "energyLevels": [...]}`;

async function transcribeAudio(base64Audio: string): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");

  // Decode base64 to binary
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create form data for Whisper API
  const formData = new FormData();
  formData.append("file", new Blob([bytes], { type: "audio/m4a" }), "audio.m4a");
  formData.append("model", "whisper-1");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.status}`);
  }

  const result = await response.json();
  return result.text || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = await req.json();

    // If raw audio base64, transcribe first
    if (body.audio) {
      const transcript = await transcribeAudio(body.audio);
      if (!transcript) {
        return Response.json(
          { text: "", category: null, energyLevels: [] },
          { headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      // Classify with Claude
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: CLASSIFY_PROMPT,
        messages: [{ role: "user", content: transcript }],
      });

      const content = message.content[0];
      if (content.type !== "text") {
        return Response.json(
          { text: transcript, category: null, energyLevels: [] },
          { headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      const result = JSON.parse(content.text);
      return Response.json(result, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // If already transcribed text, just classify
    if (body.transcript) {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: CLASSIFY_PROMPT,
        messages: [{ role: "user", content: body.transcript }],
      });

      const content = message.content[0];
      if (content.type !== "text") {
        return Response.json({ text: body.transcript, category: null, energyLevels: [] });
      }

      return Response.json(JSON.parse(content.text), {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    return Response.json(
      { text: "", category: null, energyLevels: [] },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { text: "", category: null, energyLevels: [] },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
});
