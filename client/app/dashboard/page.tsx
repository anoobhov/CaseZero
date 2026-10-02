"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Plus,
  ArrowRight,
  Clock3,
  CheckCircle2,
  XCircle,
  Trophy,
  Search,
  ChevronRight,
  RefreshCw,
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

interface Stats {
  totalCases: number;
  solved: number;
  failed: number;
  inProgress: number;
  completed: number;
  successRate: number;
  averageScore: number;
  bestScore: number;
}

export default function DashboardPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [sessionsResponse, statsResponse] =
        await Promise.all([
          fetch("/api/sessions"),
          fetch("/api/stats"),
        ]);

      const sessionsData = await sessionsResponse.json();
      const statsData = await statsResponse.json();

      if (!sessionsResponse.ok || !sessionsData.success) {
        throw new Error(
          sessionsData.message ||
            "Failed to load investigations"
        );
      }

      if (!statsResponse.ok || !statsData.success) {
        throw new Error(
          statsData.message ||
            "Failed to load statistics"
        );
      }

      setSessions(sessionsData.sessions || []);
      setStats(statsData.stats);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // -----------------------------------------
  // Helpers
  // -----------------------------------------

  function difficultyClass(difficulty: string) {
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

  // Only show active investigations here.
  const activeSessions = sessions.filter(
    (session) => session.status === "in_progress"
  );

  // Recent completed cases.
  const recentCompleted = sessions
    .filter((session) => session.status === "completed")
    .slice(0, 4);

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08090b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="animate-pulse space-y-8">

            <div className="space-y-3">
              <div className="h-4 w-28 rounded bg-white/10" />
              <div className="h-10 w-72 rounded bg-white/10" />
              <div className="h-4 w-96 max-w-full rounded bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>

            <div className="h-64 rounded-2xl border border-white/10 bg-white/[0.03]" />

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

            <XCircle className="mx-auto mb-4 h-10 w-10 text-red-400" />

            <h1 className="text-xl font-semibold">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              onClick={loadDashboard}
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              CASEZERO
            </div>

            <h1 className="mt-1 text-xl font-semibold">
              Investigator Dashboard
            </h1>
          </div>

          <button
            onClick={() => router.push("/cases/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            New Case
          </button>

        </div>
      </header>

      {/* =========================================
          CONTENT
      ========================================= */}

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* INTRO */}

        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Investigation Command Center
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome back, Investigator.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review your investigation record, continue unfinished
            cases, or begin a new mystery.
          </p>
        </section>

        {/* =========================================
            STATS
        ========================================= */}

        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* Total */}

          <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5">

            <div className="flex items-center justify-between">

              <span className="text-xs uppercase tracking-wider text-slate-500">
                Total Cases
              </span>

              <Search className="h-4 w-4 text-slate-500" />

            </div>

            <div className="mt-4 text-3xl font-semibold">
              {stats?.totalCases ?? 0}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Investigations started
            </p>

          </div>

          {/* Solved */}

          <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5">

            <div className="flex items-center justify-between">

              <span className="text-xs uppercase tracking-wider text-slate-500">
                Solved
              </span>

              <CheckCircle2 className="h-4 w-4 text-emerald-400" />

            </div>

            <div className="mt-4 text-3xl font-semibold text-emerald-400">
              {stats?.solved ?? 0}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Correct culprit identified
            </p>

          </div>

          {/* In Progress */}

          <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5">

            <div className="flex items-center justify-between">

              <span className="text-xs uppercase tracking-wider text-slate-500">
                In Progress
              </span>

              <Clock3 className="h-4 w-4 text-yellow-400" />

            </div>

            <div className="mt-4 text-3xl font-semibold text-yellow-400">
              {stats?.inProgress ?? 0}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Investigations awaiting you
            </p>

          </div>

          {/* Success Rate */}

          <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5">

            <div className="flex items-center justify-between">

              <span className="text-xs uppercase tracking-wider text-slate-500">
                Success Rate
              </span>

              <Trophy className="h-4 w-4 text-orange-400" />

            </div>

            <div className="mt-4 text-3xl font-semibold">
              {stats?.successRate ?? 0}%
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Of completed investigations
            </p>

          </div>

        </section>

        {/* =========================================
            CONTINUE INVESTIGATION
        ========================================= */}

        <section className="mt-10">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h3 className="text-lg font-semibold">
                Continue Investigation
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Pick up where you left off.
              </p>
            </div>

            {activeSessions.length > 0 && (
              <button
                onClick={() => router.push("/sessions")}
                className="text-sm text-slate-400 transition hover:text-white"
              >
                View all
              </button>
            )}

          </div>

          {activeSessions.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">

              <Clock3 className="mx-auto h-8 w-8 text-slate-600" />

              <h4 className="mt-4 font-medium">
                No active investigations
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Start a new case when you're ready.
              </p>

              <button
                onClick={() => router.push("/cases/new")}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
                Generate a Case
              </button>

            </div>

          ) : (

            <div className="grid gap-4 lg:grid-cols-2">

              {activeSessions.slice(0, 4).map((session) => (

                <div
                  key={session.id}
                  className="group rounded-2xl border border-white/10 bg-[#0d0f12] p-5 transition hover:border-white/20"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${difficultyClass(
                            session.difficulty
                          )}`}
                        >
                          {session.difficulty}
                        </span>

                        <span className="text-xs text-emerald-400">
                          ACTIVE
                        </span>

                      </div>

                      <h4 className="mt-3 truncate text-lg font-semibold">
                        {session.title}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        {session.setting}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        router.push(`/game/${session.id}`)
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition group-hover:bg-white/10"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>

                  </div>

                  {/* Progress */}

                  <div className="mt-6">

                    <div className="mb-2 flex items-center justify-between text-xs">

                      <span className="text-slate-500">
                        Investigation progress
                      </span>

                      <span className="font-medium text-slate-300">
                        {session.progress.percentage}%
                      </span>

                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">

                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{
                          width: `${session.progress.percentage}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* Progress details */}

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                    <span>
                      Evidence{" "}
                      <span className="text-slate-300">
                        {session.progress.evidence.found}/
                        {session.progress.evidence.total}
                      </span>
                    </span>

                    <span>
                      Locations{" "}
                      <span className="text-slate-300">
                        {session.progress.locations.investigated}/
                        {session.progress.locations.total}
                      </span>
                    </span>

                    <span>
                      Suspects{" "}
                      <span className="text-slate-300">
                        {session.progress.suspects.interrogated}/
                        {session.progress.suspects.total}
                      </span>
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* =========================================
            NEW CASE CTA
        ========================================= */}

        <section className="mt-10">

          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-7">

            <div className="relative z-10 max-w-2xl">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                New Investigation
              </p>

              <h3 className="mt-2 text-2xl font-semibold">
                Ready for another case?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Generate a completely new mystery and choose the
                difficulty of your investigation.
              </p>

              <button
                onClick={() => router.push("/cases/new")}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Generate New Case
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>

            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          </div>

        </section>

        {/* =========================================
            RECENT COMPLETED
        ========================================= */}

        <section className="mt-10 pb-12">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h3 className="text-lg font-semibold">
                Recent Investigations
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your latest completed cases.
              </p>
            </div>

            {sessions.length > 0 && (
              <button
                onClick={() => router.push("/sessions")}
                className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
              >
                View history
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

          </div>

          {recentCompleted.length === 0 ? (

            <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-8 text-center">

              <p className="text-sm text-slate-500">
                No completed investigations yet.
              </p>

            </div>

          ) : (

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f12]">

              {recentCompleted.map((session, index) => (

                <div
                  key={session.id}
                  className={`flex items-center justify-between gap-4 p-5 ${
                    index !== recentCompleted.length - 1
                      ? "border-b border-white/10"
                      : ""
                  }`}
                >

                  <div className="flex min-w-0 items-center gap-4">

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        session.result?.correctCulprit
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {session.result?.correctCulprit ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">

                      <h4 className="truncate text-sm font-medium">
                        {session.title}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">

                        <span className="uppercase">
                          {session.difficulty}
                        </span>

                        <span>
                          {formatDate(
                            session.completedAt ||
                              session.updatedAt
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="shrink-0 text-right">

                    <div
                      className={`text-sm font-semibold ${
                        session.result?.correctCulprit
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {session.result?.correctCulprit
                        ? "SOLVED"
                        : "FAILED"}
                    </div>

                    {typeof session.result?.score ===
                      "number" && (
                      <div className="mt-1 text-xs text-slate-500">
                        Score: {session.result.score}
                      </div>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}