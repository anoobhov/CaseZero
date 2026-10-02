import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import GameSession from "@/models/GameSession";

export async function GET() {
  try {
    await connectDB();

    const sessions = await GameSession.find()
      .select("status result startedAt completedAt")
      .lean();

    // -----------------------------------------
    // Basic counts
    // -----------------------------------------

    const totalCases = sessions.length;

    const inProgress = sessions.filter(
      (session) => session.status === "in_progress"
    ).length;

    const completed = sessions.filter(
      (session) => session.status === "completed"
    );

    /*
      A case is considered solved when the culprit
      was identified correctly.

      result.correctCulprit is only available after
      an accusation has been submitted.
    */
    const solved = completed.filter(
      (session) => session.result?.correctCulprit === true
    ).length;

    const failed = completed.filter(
      (session) => session.result?.correctCulprit === false
    ).length;

    // -----------------------------------------
    // Scores
    // -----------------------------------------

    const scores = completed
      .map((session) => session.result?.score)
      .filter(
        (score): score is number =>
          typeof score === "number"
      );

    const totalScore = scores.reduce(
      (sum, score) => sum + score,
      0
    );

    const averageScore =
      scores.length > 0
        ? Math.round(totalScore / scores.length)
        : 0;

    // -----------------------------------------
    // Success rate
    // -----------------------------------------

    const successRate =
      completed.length > 0
        ? Math.round((solved / completed.length) * 100)
        : 0;

    // -----------------------------------------
    // Best score
    // -----------------------------------------

    const bestScore =
      scores.length > 0 ? Math.max(...scores) : 0;

    // -----------------------------------------
    // Response
    // -----------------------------------------

    return NextResponse.json(
      {
        success: true,

        stats: {
          totalCases,

          solved,

          failed,

          inProgress,

          completed: completed.length,

          successRate,

          averageScore,

          bestScore,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch stats:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}