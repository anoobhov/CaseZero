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
    const { locationId } = body;

    // Validate locationId
    if (!locationId || typeof locationId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "locationId is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the game session
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

    // Make sure the game is still active
    if (session.status !== "in_progress") {
      return NextResponse.json(
        {
          success: false,
          message: "Game session is already completed",
        },
        { status: 400 }
      );
    }

    // Find the case
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

    // Find the requested location
    const location = foundCase.locations.find(
      (location) => location.id === locationId
    );

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          message: "Location not found in this case",
        },
        { status: 404 }
      );
    }

    // Check if location was already discovered
    if (session.discoveredLocations.includes(locationId)) {
      return NextResponse.json({
        success: true,
        message: "Location already investigated",
        location,
        alreadyDiscovered: true,
      });
    }

    // Add location to discovered locations
    session.discoveredLocations.push(locationId);

    await session.save();

    return NextResponse.json({
      success: true,
      message: "Location investigated successfully",
      location,
      alreadyDiscovered: false,
    });
  } catch (error) {
    console.error("Failed to investigate location:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to investigate location",
      },
      { status: 500 }
    );
  }
}