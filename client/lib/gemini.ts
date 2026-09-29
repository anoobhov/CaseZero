import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateCase() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
You are a professional mystery writer creating a detective game.

Generate ONE fictional mystery case.

The case must contain:
- A victim
- 3-5 suspects
- Multiple locations
- Evidence
- A chronological timeline
- Relationships between characters
- One actual culprit
- A clear motive
- A clear method
- A clear opportunity
- Evidence that logically supports the solution
- At least one misleading clue

The mystery must be internally consistent.

Return ONLY valid JSON.
`,
  });

  return response.text;
}