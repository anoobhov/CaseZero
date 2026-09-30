import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";
import GameSession from "@/models/GameSession";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId } = body;

    // Validate caseId
    if (!caseId || typeof caseId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "caseId is required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid caseId",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check whether the case exists
    const foundCase = await Case.findById(caseId).select("_id");

    if (!foundCase) {
      return NextResponse.json(
        {
          success: false,
          message: "Case not found",
        },
        { status: 404 }
      );
    }

    // Create a new game session
    const session = await GameSession.create({
      caseId: foundCase._id,
      discoveredEvidence: [],
      discoveredLocations: [],
      interrogatedSuspects: [],
      unlockedInformation: [],
      notes: [],
      status: "in_progress",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Game session created",
        session: {
          id: session._id,
          caseId: session.caseId,
          status: session.status,
          startedAt: session.startedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create game session:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create game session",
      },
      { status: 500 }
    );
  }
}