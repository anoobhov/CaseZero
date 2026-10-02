"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Loader2,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

type Difficulty = "easy" | "medium" | "hard" | "expert";

const difficulties = [
  {
    id: "easy" as Difficulty,
    name: "Easy",
    description:
      "A straightforward investigation with clearer clues and simpler connections.",
    icon: Shield,
    color: "emerald",
  },
  {
    id: "medium" as Difficulty,
    name: "Medium",
    description:
      "A balanced mystery requiring careful investigation and connecting evidence.",
    icon: Zap,
    color: "yellow",
  },
  {
    id: "hard" as Difficulty,
    name: "Hard",
    description:
      "A complex case with misleading clues, conflicting statements, and hidden connections.",
    icon: Brain,
    color: "orange",
  },
  {
    id: "expert" as Difficulty,
    name: "Expert",
    description:
      "A demanding investigation where almost every detail may matter.",
    icon: Sparkles,
    color: "red",
  },
];

export default function NewCasePage() {
  const router = useRouter();

  const [difficulty, setDifficulty] =
    useState<Difficulty>("medium");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerateCase() {
    try {
      setGenerating(true);
      setError("");

      // -----------------------------------------
      // STEP 1
      // Generate the case
      // -----------------------------------------

      const caseResponse = await fetch(
        "/api/cases/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            difficulty,
          }),
        }
      );

      const caseData = await caseResponse.json();

      if (!caseResponse.ok || !caseData.success) {
        throw new Error(
          caseData.message ||
            "Failed to generate case"
        );
      }

      // -----------------------------------------
      // STEP 2
      // Get generated case ID
      // -----------------------------------------

      const caseId =
        caseData.case?._id ||
        caseData.case?.id;

      if (!caseId) {
        throw new Error(
          "Case was generated but no case ID was returned."
        );
      }

      // -----------------------------------------
      // STEP 3
      // Create game session
      // -----------------------------------------

      const sessionResponse = await fetch(
        "/api/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caseId,
          }),
        }
      );

      const sessionData =
        await sessionResponse.json();

      if (
        !sessionResponse.ok ||
        !sessionData.success
      ) {
        throw new Error(
          sessionData.message ||
            "Failed to create game session"
        );
      }

      // -----------------------------------------
      // STEP 4
      // Start investigation
      // -----------------------------------------

      const sessionId =
        sessionData.session?.id;

      if (!sessionId) {
        throw new Error(
          "Session was created but no session ID was returned."
        );
      }

      router.push(`/game/${sessionId}`);
    } catch (error) {
      console.error(
        "Failed to generate investigation:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

      setGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08090b] text-white">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="border-b border-white/10 bg-[#090a0d]/80 backdrop-blur">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            CASEZERO
          </div>

        </div>

      </header>

      {/* =========================================
          MAIN
      ========================================= */}

      <div className="mx-auto max-w-5xl px-6 py-14">

        {/* TITLE */}

        <div className="mx-auto max-w-2xl text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            New Investigation
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Choose your case.
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            Select the difficulty of your investigation.
            CaseZero will generate a unique mystery with
            suspects, locations, evidence, motives and a
            hidden solution.
          </p>

        </div>

        {/* =========================================
            DIFFICULTY CARDS
        ========================================= */}

        <div className="mt-12 grid gap-4 md:grid-cols-2">

          {difficulties.map((item) => {

            const Icon = item.icon;

            const selected =
              difficulty === item.id;

            return (
              <button
                key={item.id}
                onClick={() =>
                  setDifficulty(item.id)
                }
                disabled={generating}
                className={`
                  group relative overflow-hidden
                  rounded-2xl border p-6
                  text-left transition-all
                  ${
                    selected
                      ? "border-emerald-500/50 bg-emerald-500/[0.07]"
                      : "border-white/10 bg-[#0d0f12] hover:border-white/20 hover:bg-[#101216]"
                  }
                  ${
                    generating
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }
                `}
              >

                {/* Selection indicator */}

                <div
                  className={`
                    absolute right-5 top-5
                    flex h-6 w-6 items-center justify-center
                    rounded-full border
                    transition
                    ${
                      selected
                        ? "border-emerald-400 bg-emerald-400 text-black"
                        : "border-white/10 bg-white/[0.03] text-transparent"
                    }
                  `}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>

                <div
                  className={`
                    flex h-11 w-11 items-center justify-center
                    rounded-xl border
                    ${
                      selected
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                        : "border-white/10 bg-white/[0.03] text-slate-400"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  {item.name}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <div className="mt-5 flex items-center gap-2">

                  <span
                    className={`
                      h-1.5 w-1.5 rounded-full
                      ${
                        selected
                          ? "bg-emerald-400"
                          : "bg-slate-600"
                      }
                    `}
                  />

                  <span className="text-xs uppercase tracking-wider text-slate-500">
                    {item.name} investigation
                  </span>

                </div>

              </button>
            );
          })}

        </div>

        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =========================================
            GENERATE
        ========================================= */}

        <div className="mt-10 flex flex-col items-center">

          <button
            onClick={handleGenerateCase}
            disabled={generating}
            className="
              inline-flex min-w-[240px]
              items-center justify-center gap-3
              rounded-xl
              bg-emerald-500
              px-6 py-3.5
              text-sm font-semibold text-black
              transition
              hover:bg-emerald-400
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Case...
              </>
            ) : (
              <>
                Generate {difficulty} Case
                <ArrowRight className="h-4 w-4" />
              </>
            )}

          </button>

          <p className="mt-4 text-xs text-slate-600">
            Case generation may take a few seconds.
          </p>

        </div>

        {/* =========================================
            GENERATION INFO
        ========================================= */}

        <div className="mx-auto mt-14 max-w-3xl border-t border-white/10 pt-8">

          <div className="grid gap-6 text-center sm:grid-cols-3">

            <div>

              <p className="text-sm font-medium">
                Unique Cases
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Every investigation is generated independently.
              </p>

            </div>

            <div>

              <p className="text-sm font-medium">
                Hidden Solution
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                The culprit and reasoning remain hidden during play.
              </p>

            </div>

            <div>

              <p className="text-sm font-medium">
                Your Investigation
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Explore locations, examine evidence and interrogate suspects.
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}