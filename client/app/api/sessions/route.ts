import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";
import GameSession from "@/models/GameSession";

/* =========================================================
   POST /api/sessions
   Create a new game session
========================================================= */

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

/* =========================================================
   GET /api/sessions
   Get all previous game sessions
========================================================= */

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    /*
      Fetch sessions newest first.

      We populate only safe case information.
      We DO NOT expose:
      - solution
      - hiddenTruth
      - culprit information
    */

    const sessions = await GameSession.find()
      .populate({
        path: "caseId",
        select: "title description difficulty setting suspects locations evidence",
      })
      .sort({ updatedAt: -1 })
      .lean();

    const formattedSessions = sessions.map((session: any) => {
      const gameCase = session.caseId;

      /*
        Calculate investigation progress.

        We use the arrays stored inside GameSession and
        compare them with the total available items in Case.
      */

      const totalEvidence = gameCase?.evidence?.length ?? 0;
      const evidenceFound = session.discoveredEvidence?.length ?? 0;

      const totalLocations = gameCase?.locations?.length ?? 0;
      const locationsInvestigated =
        session.discoveredLocations?.length ?? 0;

      const totalSuspects = gameCase?.suspects?.length ?? 0;
      const suspectsInterrogated =
        session.interrogatedSuspects?.length ?? 0;

      /*
        Overall progress.

        We divide the investigation into:
        - Evidence
        - Locations
        - Suspects

        Each contributes equally.
      */

      const progressParts: number[] = [];

      if (totalEvidence > 0) {
        progressParts.push(
          Math.min((evidenceFound / totalEvidence) * 100, 100)
        );
      }

      if (totalLocations > 0) {
        progressParts.push(
          Math.min(
            (locationsInvestigated / totalLocations) * 100,
            100
          )
        );
      }

      if (totalSuspects > 0) {
        progressParts.push(
          Math.min(
            (suspectsInterrogated / totalSuspects) * 100,
            100
          )
        );
      }

      const progress =
        progressParts.length > 0
          ? Math.round(
              progressParts.reduce(
                (sum, value) => sum + value,
                0
              ) / progressParts.length
            )
          : 0;

      return {
        id: session._id.toString(),

        caseId: gameCase?._id?.toString(),

        title: gameCase?.title ?? "Unknown Case",

        description: gameCase?.description ?? "",

        difficulty: gameCase?.difficulty ?? "unknown",

        setting: gameCase?.setting ?? "",

        status: session.status,

        progress: {
          percentage: progress,

          evidence: {
            found: evidenceFound,
            total: totalEvidence,
          },

          locations: {
            investigated: locationsInvestigated,
            total: totalLocations,
          },

          suspects: {
            interrogated: suspectsInterrogated,
            total: totalSuspects,
          },
        },

        result: session.result
          ? {
              correctCulprit:
                session.result.correctCulprit,

              correctMotive:
                session.result.correctMotive,

              correctMethod:
                session.result.correctMethod,

              score: session.result.score,
            }
          : null,

        startedAt: session.startedAt,

        completedAt: session.completedAt ?? null,

        updatedAt: session.updatedAt,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: formattedSessions.length,
        sessions: formattedSessions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch game sessions:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch game sessions",
      },
      { status: 500 }
    );
  }
}