// import { NextResponse } from "next/server";
// import { generateCase } from "@/lib/gemini";
// import { validateCase } from "@/lib/validateCase";

// export async function POST() {
//   try {
//     const generatedCase = await generateCase();

//     const validatedCase = validateCase(generatedCase);

//     return NextResponse.json({
//       success: true,
//       case: validatedCase,
//     });
//   } catch (error) {
//     console.error("Case generation failed:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to generate case",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Case from "@/models/Case";
import { generateCase } from "@/lib/gemini";
import { validateCase } from "@/lib/validateCase";

export async function POST() {
  try {
    // 1. Generate case using Gemini
    const generatedCase = await generateCase();

    // 2. Validate structure + references
    const validatedCase = validateCase(generatedCase);

    // 3. Connect to MongoDB
    await connectDB();

    // 4. Save the case
    const savedCase = await Case.create(validatedCase);

    // IMPORTANT:
    // Never send the solution or hiddenTruth to the frontend.
    const safeCase = savedCase.toObject();

    delete safeCase.solution;

    safeCase.evidence = safeCase.evidence.map(
      (evidence: any) => {
        const { hiddenTruth, ...publicEvidence } = evidence;
        return publicEvidence;
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Case generated and saved successfully",
        case: safeCase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Case generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate and save case",
      },
      { status: 500 }
    );
  }
}