"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

interface Session {
  id: string;
  caseId: string;
  title: string;
  description: string;
  difficulty: string;
  setting: string;
  status: "in_progress" | "completed";

  progress: {
    percentage: number;

    evidence: {
      found: number;
      total: number;
    };

    locations: {
      investigated: number;
      total: number;
    };

    suspects: {
      interrogated: number;
      total: number;
    };
  };

  result: {
    correctCulprit: boolean;
    correctMotive: boolean;
    correctMethod: boolean;
    score: number;
  } | null;

  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

type FilterType =
  | "all"
  | "in_progress"
  | "solved"
  | "failed";

export default function SessionsPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] =
    useState<FilterType>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSessions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/sessions"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load investigations"
        );
      }

      setSessions(data.sessions || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load investigations"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  // -----------------------------------------
  // Helpers
  // -----------------------------------------

  function difficultyClass(
    difficulty: string
  ) {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-emerald-400 border-emerald-400/20 bg-emerald-400/5";

      case "medium":
        return "text-yellow-400 border-yellow-400/20 bg-yellow-400/5";

      case "hard":
        return "text-orange-400 border-orange-400/20 bg-orange-400/5";

      case "expert":
        return "text-red-400 border-red-400/20 bg-red-400/5";

      default:
        return "text-slate-400 border-white/10 bg-white/[0.03]";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getSessionStatus(
    session: Session
  ) {
    if (session.status === "in_progress") {
      return "in_progress";
    }

    if (
      session.result?.correctCulprit === true
    ) {
      return "solved";
    }

    return "failed";
  }

  // -----------------------------------------
  // Filtering
  // -----------------------------------------

  const filteredSessions =
    sessions.filter((session) => {
      if (filter === "all") {
        return true;
      }

      return (
        getSessionStatus(session) === filter
      );
    });

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08090b] text-white">

        <div className="mx-auto max-w-6xl px-6 py-10">

          <div className="animate-pulse space-y-8">

            <div className="space-y-3">
              <div className="h-4 w-28 rounded bg-white/10" />
              <div className="h-9 w-72 rounded bg-white/10" />
              <div className="h-4 w-96 max-w-full rounded bg-white/5" />
            </div>

            <div className="h-12 rounded-xl bg-white/5" />

            <div className="space-y-4">

              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-40 rounded-2xl border border-white/10 bg-white/[0.03]"
                  />
                )
              )}

            </div>

          </div>

        </div>

      </main>
    );
  }

  // -----------------------------------------
  // Error
  // -----------------------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-[#08090b] text-white">

        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">

          <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">

            <XCircle className="mx-auto h-10 w-10 text-red-400" />

            <h1 className="mt-4 text-xl font-semibold">
              Unable to load investigations
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              onClick={loadSessions}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08090b] text-white">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="border-b border-white/10 bg-[#090a0d]/80 backdrop-blur">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
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
          CONTENT
      ========================================= */}

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* TITLE */}

        <section>

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Investigation Archive
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Your Investigations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review your previous investigations or
            continue a case that is still open.
          </p>

        </section>

        {/* =========================================
            FILTERS
        ========================================= */}

        <section className="mt-8">

          <div className="flex flex-wrap items-center gap-2">

            <div className="mr-2 flex items-center gap-2 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              FILTER
            </div>

            {[
              {
                id: "all" as FilterType,
                label: "All",
              },
              {
                id: "in_progress" as FilterType,
                label: "In Progress",
              },
              {
                id: "solved" as FilterType,
                label: "Solved",
              },
              {
                id: "failed" as FilterType,
                label: "Failed",
              },
            ].map((item) => (

              <button
                key={item.id}
                onClick={() =>
                  setFilter(item.id)
                }
                className={`
                  rounded-lg border px-4 py-2
                  text-xs font-medium
                  transition
                  ${
                    filter === item.id
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                {item.label}
              </button>

            ))}

          </div>

        </section>

        {/* =========================================
            RESULTS COUNT
        ========================================= */}

        <div className="mt-8 flex items-center justify-between">

          <p className="text-sm text-slate-500">
            {filteredSessions.length}{" "}
            {filteredSessions.length === 1
              ? "investigation"
              : "investigations"}
          </p>

          <button
            onClick={loadSessions}
            className="inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>

        </div>

        {/* =========================================
            EMPTY STATE
        ========================================= */}

        {filteredSessions.length === 0 ? (

          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">

            <Search className="mx-auto h-9 w-9 text-slate-600" />

            <h2 className="mt-4 font-medium">
              No investigations found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {filter === "all"
                ? "You haven't started an investigation yet."
                : "There are no investigations in this category."}
            </p>

            {filter === "all" && (
              <button
                onClick={() =>
                  router.push("/cases/new")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Start an Investigation
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

          </div>

        ) : (

          /* =======================================
             SESSION LIST
          ======================================= */

          <div className="mt-5 space-y-4">

            {filteredSessions.map((session) => {

              const sessionStatus =
                getSessionStatus(session);

              const solved =
                sessionStatus === "solved";

              const inProgress =
                sessionStatus === "in_progress";

              return (
                <div
                  key={session.id}
                  className="group rounded-2xl border border-white/10 bg-[#0d0f12] p-6 transition hover:border-white/20"
                >

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* LEFT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span
                          className={`
                            rounded-md border
                            px-2 py-1
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            ${difficultyClass(
                              session.difficulty
                            )}
                          `}
                        >
                          {session.difficulty}
                        </span>

                        {inProgress && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-400">

                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />

                            In Progress

                          </span>
                        )}

                        {solved && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">

                            <CheckCircle2 className="h-3.5 w-3.5" />

                            Solved

                          </span>
                        )}

                        {!inProgress &&
                          !solved && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">

                              <XCircle className="h-3.5 w-3.5" />

                              Failed

                            </span>
                          )}

                      </div>

                      <h2 className="mt-3 text-xl font-semibold">
                        {session.title}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {session.setting}
                      </p>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                        {session.description}
                      </p>

                      {/* Progress */}

                      <div className="mt-5 max-w-xl">

                        <div className="mb-2 flex items-center justify-between text-xs">

                          <span className="text-slate-500">
                            Investigation progress
                          </span>

                          <span className="text-slate-300">
                            {session.progress.percentage}%
                          </span>

                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">

                          <div
                            className={`h-full rounded-full transition-all ${
                              solved
                                ? "bg-emerald-400"
                                : "bg-yellow-400"
                            }`}
                            style={{
                              width: `${session.progress.percentage}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* Details */}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">

                        <span>
                          Evidence{" "}
                          <span className="text-slate-300">
                            {
                              session.progress
                                .evidence.found
                            }
                            /
                            {
                              session.progress
                                .evidence.total
                            }
                          </span>
                        </span>

                        <span>
                          Locations{" "}
                          <span className="text-slate-300">
                            {
                              session.progress
                                .locations
                                .investigated
                            }
                            /
                            {
                              session.progress
                                .locations.total
                            }
                          </span>
                        </span>

                        <span>
                          Suspects{" "}
                          <span className="text-slate-300">
                            {
                              session.progress
                                .suspects
                                .interrogated
                            }
                            /
                            {
                              session.progress
                                .suspects.total
                            }
                          </span>
                        </span>

                        <span>
                          Started{" "}
                          <span className="text-slate-300">
                            {formatDate(
                              session.startedAt
                            )}
                          </span>
                        </span>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">

                      {session.result && (
                        <div className="text-left lg:text-right">

                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            Final Score
                          </p>

                          <p
                            className={`mt-1 text-2xl font-semibold ${
                              solved
                                ? "text-emerald-400"
                                : "text-slate-300"
                            }`}
                          >
                            {session.result.score}
                          </p>

                        </div>
                      )}

                      {inProgress && (
                        <button
                          onClick={() =>
                            router.push(
                              `/game/${session.id}`
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
                        >
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}

                      {!inProgress && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">

                          <Clock3 className="h-3.5 w-3.5" />

                          {formatDate(
                            session.completedAt ||
                              session.updatedAt
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* =========================================
            BOTTOM CTA
        ========================================= */}

        <div className="mt-10 border-t border-white/10 pt-8">

          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <h3 className="font-medium">
                Looking for another mystery?
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Generate a completely new investigation.
              </p>

            </div>

            <button
              onClick={() =>
                router.push("/cases/new")
              }
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10"
            >
              New Case
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}