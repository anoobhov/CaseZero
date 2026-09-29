import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";

export async function POST() {
  try {
    await connectDB();

    const newCase = await Case.create({
      title: "The Midnight Murder",
      description: "A professor is found dead in his locked office.",
      difficulty: "medium",
      setting: "University",

      crime: {
        type: "murder",
        location: "Professor's Office",
        date: "2026-09-29",
        time: "21:30",
        description: "The victim was found dead inside his office.",
      },

      victim: {
        name: "Daniel Carter",
        age: 52,
        occupation: "Professor",
        description: "A respected university professor.",
      },

      suspects: [
        {
          id: "suspect_01",
          name: "Alice Morgan",
          age: 34,
          occupation: "Research Assistant",
          relationshipToVictim: "Research assistant",
          personality: "Ambitious and reserved",
          motive: "The victim discovered her plagiarism.",
          alibi: "Claims she was in the library.",
          secrets: [],
          statements: [],
        },
      ],

      locations: [
        {
          id: "loc_01",
          name: "Professor's Office",
          description: "The victim's office.",
          discoverableDetails: ["Broken window", "Coffee cup"],
        },
      ],

      evidence: [
        {
          id: "evidence_01",
          name: "Broken Watch",
          description: "A damaged watch was found beneath the desk.",
          locationId: "loc_01",
          hiddenTruth: {
            significance: "The watch stopped at 21:17.",
            relatedSuspects: ["suspect_01"],
            contradicts: [],
          },
        },
      ],

      timeline: [
        {
          id: "event_01",
          time: "21:17",
          description: "The victim's watch stopped.",
          actorId: "victim",
          locationId: "loc_01",
        },
      ],

      relationships: [],

      solution: {
        culpritId: "suspect_01",
        motive: "The victim discovered her plagiarism.",
        method: "Poisoning",
        opportunity: "She had access to the office.",
        reasoning: [
          "She had a motive.",
          "Her alibi needs further investigation.",
        ],
        requiredEvidence: ["evidence_01"],
      },
    });

    return NextResponse.json(
      {
        success: true,
        case: newCase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create case",
      },
      { status: 500 }
    );
  }
}