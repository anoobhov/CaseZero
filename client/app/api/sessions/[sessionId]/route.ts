// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";

// import { connectDB } from "@/lib/mongodb";
// import GameSession from "@/models/GameSession";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ sessionId: string }> }
// ) {
//   try {
//     const { sessionId } = await params;

//     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid sessionId",
//         },
//         { status: 400 }
//       );
//     }

//     await connectDB();

//     const session = await GameSession.findById(sessionId).lean();

//     if (!session) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Game session not found",
//         },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       session,
//     });
//   } catch (error) {
//     console.error("Failed to fetch game session:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch game session",
//       },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";
import GameSession from "@/models/GameSession";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sessionId",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find session
    const session = await GameSession.findById(sessionId).lean();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Game session not found",
        },
        { status: 404 }
      );
    }

    // Find associated case
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

    // Remove solution
    const safeCase = {
      ...foundCase,
    };

    delete safeCase.solution;

    // Remove hidden truth from evidence
    safeCase.evidence = safeCase.evidence.map((evidence: any) => {
      const { hiddenTruth, ...publicEvidence } = evidence;

      return publicEvidence;
    });

    return NextResponse.json({
      success: true,

      session: {
        id: session._id,
        caseId: session.caseId,
        status: session.status,

        discoveredLocations: session.discoveredLocations,
        discoveredEvidence: session.discoveredEvidence,
        interrogatedSuspects: session.interrogatedSuspects,

        unlockedInformation: session.unlockedInformation,
        notes: session.notes,

        accusation: session.accusation,
        result: session.result,

        startedAt: session.startedAt,
        completedAt: session.completedAt,
      },

      case: safeCase,
    });
  } catch (error) {
    console.error("Failed to fetch game session:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch game session",
      },
      { status: 500 }
    );
  }
}