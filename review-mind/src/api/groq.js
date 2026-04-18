import { GROQ_API_KEY } from '../config/keys';

export const generateReplies = async (topPainPoint, dominantEmotion) => {
  try {
    const response = await fetch(
      "/api/groq/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content: `You are a professional brand manager.
              Write exactly 3 short customer reply templates.
              Format your response as JSON array only:
              [
                {"tone": "Empathetic", "reply": "..."},
                {"tone": "Professional", "reply": "..."},
                {"tone": "Concise", "reply": "..."}
              ]
              No extra text. JSON only.`
            },
            {
              role: "user",
              content: `Top customer complaint: ${topPainPoint}
              Dominant emotion detected: ${dominantEmotion}
              Write 3 brand reply options.`
            }
          ]
        })
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq API Error: ${response.status} - ${text}`);
    }
    const data = await response.json();
    let raw = data.choices[0].message.content;

    // Attempt to extract JSON if there's markdown wrapping
    if (raw.includes("```json")) {
      raw = raw.replace(/```json\n/g, "").replace(/```/g, "");
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Groq reply generation failed", err);
    return [
      { tone: "Empathetic", reply: "We are so sorry to hear about your experience. We are looking into this." },
      { tone: "Professional", reply: "Thank you for bringing this to our attention. Our team has been notified." },
      { tone: "Concise", reply: "Apologies for the issue. We're on it." }
    ];
  }
};
