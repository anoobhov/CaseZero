import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";
import { generateCase } from "@/lib/gemini";
import { validateCase } from "@/lib/validateCase";

const VALID_DIFFICULTIES = [
  "easy",
  "medium",
  "hard",
  "expert",
] as const;

type Difficulty = (typeof VALID_DIFFICULTIES)[number];

export async function POST(request: NextRequest) {
  try {
    // -----------------------------------------
    // 1. Read difficulty
    // -----------------------------------------

    const body = await request.json();

    const difficulty = body?.difficulty;

    // -----------------------------------------
    // 2. Validate difficulty
    // -----------------------------------------

    if (
      !difficulty ||
      !VALID_DIFFICULTIES.includes(
        difficulty as Difficulty
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid difficulty. Choose easy, medium, hard, or expert.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 3. Generate case using Gemini
    // -----------------------------------------

    const generatedCase = await generateCase(
      difficulty as Difficulty
    );

    // -----------------------------------------
    // 4. Validate structure + references
    // -----------------------------------------

    const validatedCase = validateCase(
      generatedCase
    );

    // -----------------------------------------
    // 5. Make sure Gemini respected difficulty
    // -----------------------------------------

    if (validatedCase.difficulty !== difficulty) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Generated case difficulty does not match the selected difficulty.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // 6. Connect to MongoDB
    // -----------------------------------------

    await connectDB();

    // -----------------------------------------
    // 7. Save case
    // -----------------------------------------

    const savedCase = await Case.create(
      validatedCase
    );

    // -----------------------------------------
    // 8. Remove sensitive information
    // -----------------------------------------

    const { solution, ...publicCase } =
      savedCase.toObject();

    // Never expose hidden evidence information
    publicCase.evidence = publicCase.evidence.map(
      (evidence: any) => {
        const {
          hiddenTruth,
          ...publicEvidence
        } = evidence;

        return publicEvidence;
      }
    );

    // -----------------------------------------
    // 9. Return safe case
    // -----------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Case generated and saved successfully",
        case: publicCase,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(
      "Case generation failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to generate and save case",
      },
      { status: 500 }
    );
  }
}