const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

const SYSTEM_PROMPT = `You are a patient ADHD coach. A user with ADHD is struggling to start a task. Break it down into 3-5 micro-steps that are so small they feel almost silly. The goal is to eliminate the "wall of awful" — the emotional barrier before starting.

Rules:
- Each step should take under 1 minute
- First step should be physical and trivial (stand up, open the app, pick up the phone)
- Use the same language as the task
- Be warm but brief — max 6 words per step
- No numbering, just the steps one per line
- Return ONLY the steps, nothing else

Example for "Clean the kitchen":
Stand up
Walk to the kitchen
Put one plate in the sink
Turn on the tap
Add soap`;

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
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");
    const { task, language } = await req.json();
    if (!task) {
      return Response.json({ steps: [] }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const langHint = language === 'es' ? ' Respond in Spanish.' :
                     language === 'eu' ? ' Respond in Basque.' :
                     language === 'ca' ? ' Respond in Catalan.' :
                     language === 'gl' ? ' Respond in Galician.' :
                     language === 'fr' ? ' Respond in French.' :
                     language === 'it' ? ' Respond in Italian.' :
                     language === 'de' ? ' Respond in German.' :
                     language === 'pt' ? ' Respond in Portuguese.' : '';

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + langHint },
          { role: "user", content: task },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      return Response.json({ steps: [] }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const steps = content.split("\n").map((s: string) => s.trim()).filter((s: string) => s.length > 0);

    return Response.json({ steps }, { headers: { "Access-Control-Allow-Origin": "*" } });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ steps: [] }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
});
