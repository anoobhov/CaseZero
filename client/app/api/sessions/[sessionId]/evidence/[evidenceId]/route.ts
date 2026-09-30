import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";
import GameSession from "@/models/GameSession";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; evidenceId: string }> }
) {
  try {
    const { sessionId, evidenceId } = await params;

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

    if (!evidenceId || typeof evidenceId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid evidenceId",
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

    // Make sure game is active
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

    // Find evidence
    const evidence = foundCase.evidence.find(
      (item) => item.id === evidenceId
    );

    if (!evidence) {
      return NextResponse.json(
        {
          success: false,
          message: "Evidence not found",
        },
        { status: 404 }
      );
    }

    // Make sure the player has investigated the location
    if (!session.discoveredLocations.includes(evidence.locationId)) {
      return NextResponse.json(
        {
          success: false,
          message: "You must investigate the location first",
        },
        { status: 403 }
      );
    }

    // Already discovered?
    if (session.discoveredEvidence.includes(evidenceId)) {
      return NextResponse.json({
        success: true,
        message: "Evidence already discovered",
        evidence: {
          id: evidence.id,
          name: evidence.name,
          description: evidence.description,
          locationId: evidence.locationId,
        },
        alreadyDiscovered: true,
      });
    }

    // Add evidence to session
    session.discoveredEvidence.push(evidenceId);

    await session.save();

    // IMPORTANT:
    // Do NOT return hiddenTruth
    return NextResponse.json({
      success: true,
      message: "Evidence discovered successfully",
      evidence: {
        id: evidence.id,
        name: evidence.name,
        description: evidence.description,
        locationId: evidence.locationId,
      },
      alreadyDiscovered: false,
    });
  } catch (error) {
    console.error("Failed to discover evidence:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to discover evidence",
      },
      { status: 500 }
    );
  }
}