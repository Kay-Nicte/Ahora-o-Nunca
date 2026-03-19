import Anthropic from "npm:@anthropic-ai/sdk@^0.39.0";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
});

const SYSTEM_PROMPT = `You classify tasks for a TDAH (ADHD) task management app.

Given a task description, return a JSON object with:
- "category": one of "home", "work", "mobile", "errands", "personal" (or null if unclear)
- "energyLevels": array of applicable energy levels from: "high", "calm", "short_time", "mobile_only"

Rules for energy levels:
- "high": requires physical effort, focus, or leaving the house (cleaning, exercise, cooking, moving furniture)
- "calm": can be done relaxed, low mental/physical effort (reading, light organizing, watching something)
- "short_time": can be done in 5-10 minutes (quick call, send a message, small errand)
- "mobile_only": can be done entirely from your phone without getting up (emails, messages, online tasks, calls)

A task can have multiple energy levels. For example "call the doctor" is both "short_time" and "mobile_only".

Return ONLY valid JSON, no explanation.`;

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
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return Response.json({ category: null, energyLevels: [] });
    }

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return Response.json({ category: null, energyLevels: [] });
    }

    const result = JSON.parse(content.text);

    return Response.json(result, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("Classification error:", error);
    return Response.json(
      { category: null, energyLevels: [] },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
});
