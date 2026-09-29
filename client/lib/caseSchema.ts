import { z } from "zod";

export const caseSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]),
  setting: z.string(),

  crime: z.object({
    type: z.string(),
    location: z.string(),
    date: z.string(),
    time: z.string(),
    description: z.string(),
  }),

  victim: z.object({
    name: z.string(),
    age: z.number(),
    occupation: z.string(),
    description: z.string(),
  }),

  suspects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      age: z.number(),
      occupation: z.string(),
      relationshipToVictim: z.string(),
      personality: z.string(),
      motive: z.string(),
      alibi: z.string(),
      secrets: z.array(z.string()),
      statements: z.array(z.string()),
    })
  ),

  locations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      discoverableDetails: z.array(z.string()),
    })
  ),

  evidence: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      locationId: z.string(),

      hiddenTruth: z.object({
        significance: z.string(),
        relatedSuspects: z.array(z.string()),
        contradicts: z.array(z.string()),
      }),
    })
  ),

  timeline: z.array(
    z.object({
      id: z.string(),
      time: z.string(),
      description: z.string(),
      actorId: z.string(),
      locationId: z.string(),
    })
  ),

  relationships: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      type: z.string(),
      description: z.string(),
    })
  ),

  solution: z.object({
    culpritId: z.string(),
    motive: z.string(),
    method: z.string(),
    opportunity: z.string(),
    reasoning: z.array(z.string()),
    requiredEvidence: z.array(z.string()),
  }),
});

export type GeneratedCase = z.infer<typeof caseSchema>;