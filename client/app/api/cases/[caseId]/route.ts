import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    await connectDB();

    const foundCase = await Case.findById(caseId).lean();

    if (!foundCase) {
      return NextResponse.json(
        {
          success: false,
          message: "Case not found",
        },
        { status: 404 }
      );
    }

    // Never expose the solution to the player
    const { solution, ...safeCase } = foundCase;

    safeCase.evidence = safeCase.evidence.map(
      (evidence: any) => {
        const { hiddenTruth, ...publicEvidence } = evidence;

        return publicEvidence;
      }
    );

    return NextResponse.json({
      success: true,
      case: safeCase,
    });
  } catch (error) {
    console.error("Failed to fetch case:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch case",
      },
      { status: 500 }
    );
  }
}