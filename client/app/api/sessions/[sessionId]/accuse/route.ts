import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";
import GameSession from "@/models/GameSession";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

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

    const body = await request.json();

    const {
      suspectId,
      motive,
      method,
      reasoning,
    } = body;

    // Validate request body
    if (!suspectId || typeof suspectId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "suspectId is required",
        },
        { status: 400 }
      );
    }

    if (!motive || typeof motive !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "motive is required",
        },
        { status: 400 }
      );
    }

    if (!method || typeof method !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "method is required",
        },
        { status: 400 }
      );
    }

    if (!reasoning || typeof reasoning !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "reasoning is required",
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

    // Don't allow multiple accusations
    if (session.status === "completed") {
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

    // Verify that the accused suspect exists
    const suspectExists = foundCase.suspects.some(
      (suspect) => suspect.id === suspectId
    );

    if (!suspectExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Suspect not found in this case",
        },
        { status: 404 }
      );
    }

    // Hidden solution
    const solution = foundCase.solution;

    // Compare accusation
    const correctCulprit = suspectId === solution.culpritId;

    const correctMotive =
      motive.trim().toLowerCase() ===
      solution.motive.trim().toLowerCase();

    const correctMethod =
      method.trim().toLowerCase() ===
      solution.method.trim().toLowerCase();

    // Score
    let score = 0;

    if (correctCulprit) {
      score += 40;
    }

    if (correctMotive) {
      score += 25;
    }

    if (correctMethod) {
      score += 25;
    }

    if (reasoning.trim().length >= 50) {
      score += 10;
    }

    // Save accusation
    session.accusation = {
      suspectId,
      motive,
      method,
      reasoning,
      submittedAt: new Date(),
    };

    session.result = {
      correctCulprit,
      correctMotive,
      correctMethod,
      score,
    };

    session.status = "completed";
    session.completedAt = new Date();

    await session.save();

    return NextResponse.json({
      success: true,
      message: "Accusation submitted",
      result: {
        correctCulprit,
        correctMotive,
        correctMethod,
        score,
      },
    });
  } catch (error) {
    console.error("Failed to submit accusation:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit accusation",
      },
      { status: 500 }
    );
  }
}