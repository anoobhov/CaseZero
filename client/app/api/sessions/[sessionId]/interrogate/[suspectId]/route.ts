import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";
import GameSession from "@/models/GameSession";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; suspectId: string }> }
) {
  try {
    const { sessionId, suspectId } = await params;

    // Validate sessionId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sessionId",
        },
        { status: 400 }
      );
    }

    if (!suspectId || typeof suspectId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid suspectId",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find session
    const session = await GameSession.findById(sessionId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Game session not found",
        },
        { status: 404 }
      );
    }

    // Check game status
    if (session.status !== "in_progress") {
      return NextResponse.json(
        {
          success: false,
          message: "Game session is already completed",
        },
        { status: 400 }
      );
    }

    // Find case
    const foundCase = await Case.findById(session.caseId).lean();

    if (!foundCase) {
      return NextResponse.json(
        {
          success: false,
          message: "Case not found",
        },
        { status: 404 }
      );
    }

    // Find suspect
    const suspect = foundCase.suspects.find(
      (item) => item.id === suspectId
    );

    if (!suspect) {
      return NextResponse.json(
        {
          success: false,
          message: "Suspect not found",
        },
        { status: 404 }
      );
    }

    const alreadyInterrogated =
      session.interrogatedSuspects.includes(suspectId);

    // Add suspect to interrogated list if this is the first interrogation
    if (!alreadyInterrogated) {
      session.interrogatedSuspects.push(suspectId);
      await session.save();
    }

    // Only return information the investigator is allowed to know
    return NextResponse.json({
      success: true,
      message: alreadyInterrogated
        ? "Suspect already interrogated"
        : "Suspect interrogated successfully",

      suspect: {
        id: suspect.id,
        name: suspect.name,
        age: suspect.age,
        occupation: suspect.occupation,
        relationshipToVictim: suspect.relationshipToVictim,
        personality: suspect.personality,
        alibi: suspect.alibi,
        statements: suspect.statements,
      },

      alreadyInterrogated,
    });
  } catch (error) {
    console.error("Failed to interrogate suspect:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to interrogate suspect",
      },
      { status: 500 }
    );
  }
}