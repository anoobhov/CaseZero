// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// export async function generateCase() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: `
// You are a professional mystery writer creating a detective game.

// Generate ONE fictional mystery case.

// The case must contain:
// - A victim
// - 3-5 suspects
// - Multiple locations
// - Evidence
// - A chronological timeline
// - Relationships between characters
// - One actual culprit
// - A clear motive
// - A clear method
// - A clear opportunity
// - Evidence that logically supports the solution
// - At least one misleading clue

// The mystery must be internally consistent.

// Return ONLY valid JSON.
// `,
//   });

//   return response.text;
// }


import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const caseSchema = {
  type: Type.OBJECT,

  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    difficulty: {
      type: Type.STRING,
      enum: ["easy", "medium", "hard", "expert"],
    },
    setting: { type: Type.STRING },

    crime: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        location: { type: Type.STRING },
        date: { type: Type.STRING },
        time: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: [
        "type",
        "location",
        "date",
        "time",
        "description",
      ],
    },

    victim: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        age: { type: Type.INTEGER },
        occupation: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: [
        "name",
        "age",
        "occupation",
        "description",
      ],
    },

    suspects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          age: { type: Type.INTEGER },
          occupation: { type: Type.STRING },
          relationshipToVictim: { type: Type.STRING },
          personality: { type: Type.STRING },
          motive: { type: Type.STRING },
          alibi: { type: Type.STRING },
          secrets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          statements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "id",
          "name",
          "age",
          "occupation",
          "relationshipToVictim",
          "personality",
          "motive",
          "alibi",
          "secrets",
          "statements",
        ],
      },
    },

    locations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          discoverableDetails: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "id",
          "name",
          "description",
          "discoverableDetails",
        ],
      },
    },

    evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          locationId: { type: Type.STRING },

          hiddenTruth: {
            type: Type.OBJECT,
            properties: {
              significance: { type: Type.STRING },
              relatedSuspects: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              contradicts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "significance",
              "relatedSuspects",
              "contradicts",
            ],
          },
        },
        required: [
          "id",
          "name",
          "description",
          "locationId",
          "hiddenTruth",
        ],
      },
    },

    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          time: { type: Type.STRING },
          description: { type: Type.STRING },
          actorId: { type: Type.STRING },
          locationId: { type: Type.STRING },
        },
        required: [
          "id",
          "time",
          "description",
          "actorId",
          "locationId",
        ],
      },
    },

    relationships: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          from: { type: Type.STRING },
          to: { type: Type.STRING },
          type: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: [
          "from",
          "to",
          "type",
          "description",
        ],
      },
    },

    solution: {
      type: Type.OBJECT,
      properties: {
        culpritId: { type: Type.STRING },
        motive: { type: Type.STRING },
        method: { type: Type.STRING },
        opportunity: { type: Type.STRING },
        reasoning: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        requiredEvidence: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: [
        "culpritId",
        "motive",
        "method",
        "opportunity",
        "reasoning",
        "requiredEvidence",
      ],
    },
  },

  required: [
    "title",
    "description",
    "difficulty",
    "setting",
    "crime",
    "victim",
    "suspects",
    "locations",
    "evidence",
    "timeline",
    "relationships",
    "solution",
  ],
};

export async function generateCase() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",

    contents: `
Generate a fictional detective mystery for CaseZero.

Rules:

1. Create exactly ONE culprit.
2. Create 3-5 suspects.
3. Every suspect must have a plausible motive or connection.
4. The culprit must have a believable opportunity.
5. Create multiple pieces of evidence.
6. At least one piece of evidence should initially mislead the player.
7. The timeline must be logically consistent.
8. All IDs must be unique.
9. culpritId must match one of the suspect IDs.
10. Evidence relatedSuspects must contain valid suspect IDs.
11. Evidence locationId must contain a valid location ID.
12. Timeline actorId must refer to a valid suspect ID or "victim".
13. Timeline locationId must refer to a valid location ID.
14. requiredEvidence must contain valid evidence IDs.
15. The solution must actually be deducible from the evidence and timeline.
16. The timeline must NEVER explicitly reveal the culprit or describe the culprit committing the crime.
17. Timeline events must contain only information that could reasonably be discovered by the investigator.
18. Do not use omniscient narration in the timeline.
19. Do not write statements such as "the culprit poisoned the victim", "X killed the victim", or "X framed Y".
20. The actual solution must exist only inside the solution object.
21. The timeline may contain suspicious actions, movements, alibis, and discoveries, but the investigator must need to reason from them.

Generate an interesting mystery rather than a generic story.

The timeline must NEVER explicitly reveal the culprit or describe the culprit committing the crime.

Timeline events must contain only information that could reasonably be discovered by the investigator.

Do not use omniscient narration.

Do not write statements such as:
- "X killed the victim"
- "X poisoned the victim"
- "X framed Y"
- "the culprit did..."

The actual solution must exist only inside the solution object.

Timeline events may describe suspicious movements, observations,
statements, discoveries, or actions, but the investigator must
infer the culprit from the available evidence.
`,

    config: {
      responseMimeType: "application/json",
      responseSchema: caseSchema,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(response.text);
}