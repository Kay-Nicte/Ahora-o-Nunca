import Anthropic from "npm:@anthropic-ai/sdk@^0.39.0";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});

const SYSTEM_PROMPT = `You receive a voice transcription from a TDAH task management app.
The user said a task out loud. Extract:
1. The task text (clean, short)
2. Category: one of "home", "work", "mobile", "errands", "personal" (or null)
3. Energy levels: array from "high", "calm", "short_time", "mobile_only"

Rules for energy:
- "high": physical effort, focus, leaving house
- "calm": relaxed, low effort
- "short_time": 5-10 minutes
- "mobile_only": can do from phone

Return ONLY JSON: {"text": "...", "category": "...", "energyLevels": [...]}`;

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
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return Response.json({ text: "", category: null, energyLevels: [] });
    }

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: transcript }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return Response.json({ text: transcript, category: null, energyLevels: [] });
    }

    const result = JSON.parse(content.text);

    return Response.json(result, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return Response.json(
      { text: "", category: null, energyLevels: [] },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
});
