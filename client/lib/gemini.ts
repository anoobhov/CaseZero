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
              significance: {
                type: Type.STRING,
              },

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

export async function generateCase(
  difficulty: "easy" | "medium" | "hard" | "expert"
) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",

    contents: `
Generate a fictional detective mystery for CaseZero.

========================================
SELECTED DIFFICULTY
========================================

The player selected:

${difficulty.toUpperCase()}

The generated case MUST have:

difficulty = "${difficulty}"

Do not change the difficulty.

========================================
GENERAL RULES
========================================

1. Create exactly ONE culprit.

2. Create 3-5 suspects.

3. Every suspect must have a plausible motive or connection.

4. The culprit must have a believable opportunity.

5. Create multiple pieces of evidence.

6. At least one piece of evidence should initially
   mislead the player.

7. The timeline must be logically consistent.

8. All IDs must be unique.

9. culpritId must match one of the suspect IDs.

10. Evidence relatedSuspects must contain valid suspect IDs.

11. Evidence locationId must contain a valid location ID.

12. Timeline actorId must refer to a valid suspect ID
    or "victim".

13. Timeline locationId must refer to a valid location ID.

14. requiredEvidence must contain valid evidence IDs.

15. The solution must actually be deducible from
    the evidence and timeline.

16. The timeline must NEVER explicitly reveal the
    culprit or describe the culprit committing
    the crime.

17. Timeline events must contain only information
    that could reasonably be discovered by the
    investigator.

18. Do not use omniscient narration in the timeline.

19. Do not write statements such as:

    "the culprit poisoned the victim"

    "X killed the victim"

    "X framed Y"

20. The actual solution must exist only inside
    the solution object.

21. The timeline may contain suspicious actions,
    movements, alibis, and discoveries, but the
    investigator must need to reason from them.

========================================
DIFFICULTY DESIGN
========================================

EASY:

- 3 suspects
- Relatively small number of locations
- Clearer evidence
- Fewer misleading clues
- Suspect statements should provide useful information
- Connections between evidence should be relatively easy
  to recognize
- The culprit should be reasonably deducible

MEDIUM:

- 3-4 suspects
- Several locations
- Multiple pieces of evidence
- Some misleading evidence
- Suspect statements may contain contradictions
- The investigator must connect multiple clues
- The culprit should not be immediately obvious

HARD:

- 4-5 suspects
- More locations and evidence
- Multiple plausible motives
- Several misleading clues
- Contradictory alibis
- Evidence should require cross-referencing
- Suspect statements should contain subtle inconsistencies
- The culprit should only become clear after careful reasoning

EXPERT:

- 5 suspects
- Multiple interconnected locations
- Complex relationships between suspects
- Several plausible motives
- Significant amount of misleading evidence
- Carefully constructed contradictions
- Alibis should require comparison with the timeline
- Important clues should not individually identify the culprit
- Multiple pieces of evidence should need to be combined
- The solution should require substantial reasoning

========================================
IMPORTANT
========================================

Difficulty must affect the actual complexity
of the mystery, not just the difficulty field.

Generate an interesting mystery rather than
a generic story.

The timeline must NEVER explicitly reveal
the culprit or describe the culprit committing
the crime.

Timeline events must contain only information
that could reasonably be discovered by the investigator.

Timeline events may describe suspicious movements,
observations, statements, discoveries, or actions,
but the investigator must infer the culprit from
the available evidence.
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