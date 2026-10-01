"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getSession,
  investigateLocation,
  discoverEvidence,
  interrogateSuspect,
  submitAccusation,
} from "@/lib/api";

export default function GamePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [investigating, setInvestigating] = useState<string | null>(null);
  const [examiningEvidence, setExaminingEvidence] = useState<string | null>(
    null
  );
  const [interrogatingSuspect, setInterrogatingSuspect] = useState<
    string | null
  >(null);

  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedSuspect, setSelectedSuspect] = useState<any>(null);

  const [showAccusation, setShowAccusation] = useState(false);

  const [accusation, setAccusation] = useState({
    suspectId: "",
    motive: "",
    method: "",
    reasoning: "",
  });

  const [submittingAccusation, setSubmittingAccusation] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [error, setError] = useState("");

  async function loadSession() {
    try {
      setLoading(true);
      setError("");

      const response = await getSession(sessionId);

      setData(response);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load investigation"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08090b] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin mx-auto" />

          <p className="text-xs tracking-widest uppercase text-slate-600 mt-4">
            Loading investigation...
          </p>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-[#08090b] text-slate-200 flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-red-500/20 bg-red-500/[0.04] rounded-2xl p-6 text-center">
          <p className="text-xs tracking-widest uppercase text-red-400">
            Investigation Error
          </p>

          <p className="text-sm text-slate-400 mt-3">{error}</p>

          <button
            onClick={loadSession}
            className="mt-5 px-4 py-2 rounded-lg border border-white/10 text-xs text-slate-300 hover:bg-white/5 transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const { session, case: caseData } = data;

  /*
   * ---------------------------------------------------------
   * Derived data
   * ---------------------------------------------------------
   */

  const discoveredLocationIds = new Set(
    session.discoveredLocations
  );

  const discoveredEvidenceIds = new Set(
    session.discoveredEvidence
  );

  const interrogatedSuspectIds = new Set(
    session.interrogatedSuspects
  );

  const locationMap = new Map(
    caseData.locations.map((location: any) => [
      location.id,
      location,
    ])
  );

  const evidenceMap = new Map(
    caseData.evidence.map((evidence: any) => [
      evidence.id,
      evidence,
    ])
  );

  const visibleEvidence = caseData.evidence.filter(
    (evidence: any) =>
      discoveredLocationIds.has(evidence.locationId)
  );

  const locationEvidence = selectedLocation
    ? caseData.evidence.filter(
        (evidence: any) =>
          evidence.locationId === selectedLocation.id
      )
    : [];

  const discoveredEvidenceCount =
    session.discoveredEvidence.length;

  const discoveredLocationCount =
    session.discoveredLocations.length;

  const interrogatedSuspectCount =
    session.interrogatedSuspects.length;

  const totalInvestigationItems =
    caseData.locations.length +
    caseData.evidence.length +
    caseData.suspects.length;

  const completedInvestigationItems =
    discoveredLocationCount +
    discoveredEvidenceCount +
    interrogatedSuspectCount;

  const progress =
    totalInvestigationItems === 0
      ? 0
      : Math.round(
          (completedInvestigationItems /
            totalInvestigationItems) *
            100
        );

  /*
   * ---------------------------------------------------------
   * Location investigation
   * ---------------------------------------------------------
   */

  async function handleInvestigate(locationId: string) {
    const location = locationMap.get(locationId);

    if (!location) return;

    const alreadyInvestigated =
      discoveredLocationIds.has(locationId);

    // Already investigated -> simply reopen modal.
    if (alreadyInvestigated) {
      setSelectedLocation(location);
      return;
    }

    try {
      setInvestigating(locationId);
      setError("");

      await investigateLocation(
        sessionId,
        locationId
      );

      setData((prev: any) => {
        if (!prev) return prev;

        if (
          prev.session.discoveredLocations.includes(
            locationId
          )
        ) {
          return prev;
        }

        return {
          ...prev,
          session: {
            ...prev.session,
            discoveredLocations: [
              ...prev.session.discoveredLocations,
              locationId,
            ],
          },
        };
      });

      setSelectedLocation(location);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to investigate location"
      );
    } finally {
      setInvestigating(null);
    }
  }

  /*
   * ---------------------------------------------------------
   * Evidence
   * ---------------------------------------------------------
   */

  async function handleExamineEvidence(
    evidenceId: string
  ) {
    try {
      setExaminingEvidence(evidenceId);
      setError("");

      await discoverEvidence(
        sessionId,
        evidenceId
      );

      setData((prev: any) => {
        if (!prev) return prev;

        const alreadyDiscovered =
          prev.session.discoveredEvidence.includes(
            evidenceId
          );

        if (alreadyDiscovered) {
          return prev;
        }

        return {
          ...prev,
          session: {
            ...prev.session,
            discoveredEvidence: [
              ...prev.session.discoveredEvidence,
              evidenceId,
            ],
          },
        };
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to examine evidence"
      );
    } finally {
      setExaminingEvidence(null);
    }
  }

  /*
   * ---------------------------------------------------------
   * Suspect interrogation
   * ---------------------------------------------------------
   */

  async function handleInterrogateSuspect(
    suspectId: string
  ) {
    try {
      setInterrogatingSuspect(suspectId);
      setError("");

      const response =
        await interrogateSuspect(
          sessionId,
          suspectId
        );

      setSelectedSuspect(response.suspect);

      setData((prev: any) => {
        if (!prev) return prev;

        const alreadyInterrogated =
          prev.session.interrogatedSuspects.includes(
            suspectId
          );

        if (alreadyInterrogated) {
          return prev;
        }

        return {
          ...prev,
          session: {
            ...prev.session,
            interrogatedSuspects: [
              ...prev.session.interrogatedSuspects,
              suspectId,
            ],
          },
        };
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to interrogate suspect"
      );
    } finally {
      setInterrogatingSuspect(null);
    }
  }

  /*
   * ---------------------------------------------------------
   * Accusation
   * ---------------------------------------------------------
   */

  async function handleSubmitAccusation() {
    if (!accusation.suspectId) {
      setError("Please select a suspect.");
      return;
    }

    if (!accusation.motive.trim()) {
      setError("Please enter a motive.");
      return;
    }

    if (!accusation.method.trim()) {
      setError("Please enter the method.");
      return;
    }

    if (!accusation.reasoning.trim()) {
      setError("Please provide your reasoning.");
      return;
    }

    try {
      setSubmittingAccusation(true);
      setError("");

      const response =
        await submitAccusation(
          sessionId,
          accusation
        );

      setResult(response.result);

      /*
       * Update local state instead of calling loadSession().
       * This avoids a full page reload/loading state.
       */
      setData((prev: any) => {
        if (!prev) return prev;

        return {
          ...prev,
          session: {
            ...prev.session,
            status: "completed",
            accusation: {
              ...accusation,
              submittedAt: new Date(),
            },
            result: response.result,
          },
        };
      });

      setShowAccusation(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit accusation"
      );
    } finally {
      setSubmittingAccusation(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#08090b] text-slate-200">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-white/10 bg-[#0a0b0e]">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-8">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <p className="text-[10px] tracking-[0.25em] uppercase text-emerald-500">
                  CaseZero
                </p>

                <span className="text-slate-700">/</span>

                <p className="text-[10px] tracking-[0.2em] uppercase text-slate-600">
                  Investigation
                </p>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <h1 className="text-2xl font-semibold text-slate-100 truncate">
                  {caseData.title}
                </h1>

                <span
                  className={`shrink-0 text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 rounded border ${
                    session.status === "completed"
                      ? "text-slate-500 border-white/10 bg-white/[0.02]"
                      : "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.05]"
                  }`}
                >
                  {session.status === "completed"
                    ? "Completed"
                    : "Active"}
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-3 max-w-3xl leading-6">
                {caseData.description}
              </p>
            </div>

            {/* Header stats */}
            <div className="hidden lg:grid grid-cols-4 gap-8 shrink-0">
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-slate-600">
                  Locations
                </p>

                <p className="text-xl font-semibold mt-1">
                  {caseData.locations.length}
                </p>
              </div>

              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-slate-600">
                  Suspects
                </p>

                <p className="text-xl font-semibold mt-1">
                  {caseData.suspects.length}
                </p>
              </div>

              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-slate-600">
                  Evidence
                </p>

                <p className="text-xl font-semibold mt-1">
                  {caseData.evidence.length}
                </p>
              </div>

              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-slate-600">
                  Interrogated
                </p>

                <p className="text-xl font-semibold mt-1">
                  {interrogatedSuspectCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="max-w-[1600px] mx-auto px-6 pt-5">
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-red-400">
              {error}
            </p>

            <button
              onClick={() => setError("")}
              className="text-xs text-slate-600 hover:text-slate-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* =================================================
              LEFT SIDEBAR
          ================================================= */}

          <aside className="col-span-12 lg:col-span-3 xl:col-span-2 space-y-5">
            {/* Locations */}
            <div className="rounded-xl border border-white/10 bg-[#0b0d10] overflow-hidden">
              <div className="px-4 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-slate-600">
                    Locations
                  </p>

                  <span className="text-[10px] text-slate-700">
                    {discoveredLocationCount}/
                    {caseData.locations.length}
                  </span>
                </div>
              </div>

              <div className="p-2">
                {caseData.locations.map(
                  (location: any) => {
                    const investigated =
                      discoveredLocationIds.has(
                        location.id
                      );

                    const isInvestigating =
                      investigating === location.id;

                    return (
                      <button
                        key={location.id}
                        onClick={() =>
                          handleInvestigate(
                            location.id
                          )
                        }
                        disabled={isInvestigating}
                        className={`
                          group w-full text-left rounded-lg px-3 py-3
                          transition-all duration-200
                          border
                          ${
                            investigated
                              ? "bg-emerald-500/[0.06] border-emerald-500/10 text-emerald-300"
                              : "border-transparent text-slate-400 hover:bg-white/[0.03] hover:border-white/5 hover:text-slate-200"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`
                              w-2 h-2 rounded-full shrink-0 transition-all
                              ${
                                investigated
                                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                  : "bg-slate-700 group-hover:bg-slate-500"
                              }
                            `}
                          />

                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">
                              {location.name}
                            </p>

                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {isInvestigating
                                ? "Investigating..."
                                : investigated
                                ? "Investigated"
                                : "Unexplored"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Suspects */}
            <div className="rounded-xl border border-white/10 bg-[#0b0d10] overflow-hidden">
              <div className="px-4 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-slate-600">
                    Suspects
                  </p>

                  <span className="text-[10px] text-slate-700">
                    {interrogatedSuspectCount}/
                    {caseData.suspects.length}
                  </span>
                </div>
              </div>

              <div className="p-2">
                {caseData.suspects.map(
                  (suspect: any) => {
                    const interrogated =
                      interrogatedSuspectIds.has(
                        suspect.id
                      );

                    const isInterrogating =
                      interrogatingSuspect ===
                      suspect.id;

                    return (
                      <button
                        key={suspect.id}
                        onClick={() =>
                          handleInterrogateSuspect(
                            suspect.id
                          )
                        }
                        disabled={isInterrogating}
                        className={`
                          group w-full text-left rounded-lg px-3 py-3
                          transition-all duration-200
                          border
                          ${
                            interrogated
                              ? "bg-amber-500/[0.06] border-amber-500/10 text-amber-300"
                              : "border-transparent text-slate-400 hover:bg-white/[0.03] hover:border-white/5 hover:text-slate-200"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`
                              w-2 h-2 rounded-full shrink-0 transition-all
                              ${
                                interrogated
                                  ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]"
                                  : "bg-slate-700 group-hover:bg-slate-500"
                              }
                            `}
                          />

                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">
                              {suspect.name}
                            </p>

                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {isInterrogating
                                ? "Interrogating..."
                                : interrogated
                                ? "Interrogated"
                                : suspect.occupation ||
                                  "Suspect"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </aside>

          {/* =================================================
              CENTER
          ================================================= */}

          <section className="col-span-12 lg:col-span-6 xl:col-span-7">
            <div className="rounded-xl border border-white/10 bg-[#0b0d10] overflow-hidden">
              {/* Center header */}
              <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] text-slate-600 uppercase">
                      Investigation
                    </p>

                    <h2 className="text-xl font-semibold mt-1">
                      Evidence & Findings
                    </h2>

                    <p className="text-xs text-slate-600 mt-2">
                      Examine discovered clues and connect
                      them to the case.
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-semibold">
                      {discoveredEvidenceCount}
                    </p>

                    <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                      Clues
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5">
                  <p className="text-[10px] text-slate-600">
                    {discoveredEvidenceCount} /{" "}
                    {caseData.evidence.length} discovered
                  </p>

                  <div className="w-32 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${
                          caseData.evidence.length ===
                          0
                            ? 0
                            : (discoveredEvidenceCount /
                                caseData.evidence
                                  .length) *
                              100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div className="p-5">
                {visibleEvidence.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-xl py-14 text-center">
                    <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto">
                      <span className="text-slate-600">
                        ?
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-4">
                      No evidence has been discovered
                      yet.
                    </p>

                    <p className="text-xs text-slate-700 mt-2">
                      Investigate a location to uncover
                      clues.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {visibleEvidence.map(
                      (
                        evidence: any,
                        index: number
                      ) => {
                        const discovered =
                          discoveredEvidenceIds.has(
                            evidence.id
                          );

                        const location =
                          locationMap.get(
                            evidence.locationId
                          );

                        return (
                          <div
                            key={evidence.id}
                            className={`
                              rounded-xl border p-5 transition-all
                              ${
                                discovered
                                  ? "border-emerald-500/15 bg-emerald-500/[0.035]"
                                  : "border-white/10 bg-white/[0.015]"
                              }
                            `}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-[9px] tracking-[0.18em] uppercase text-slate-600">
                                  Evidence #
                                  {String(
                                    index + 1
                                  ).padStart(2, "0")}
                                </p>

                                <h3 className="text-sm font-medium text-slate-200 mt-2">
                                  {evidence.name}
                                </h3>
                              </div>

                              {discovered && (
                                <span className="shrink-0 text-[9px] uppercase tracking-wider text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded">
                                  Found
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 leading-6 mt-3">
                              {evidence.description}
                            </p>

                            {location && (
                              <div className="flex items-center gap-2 mt-4">
                                <span className="text-[10px] text-slate-700 uppercase tracking-wider">
                                  Location
                                </span>

                                <span className="text-[10px] text-slate-500">
                                  {location.name}
                                </span>
                              </div>
                            )}

                            <div className="mt-5">
                              <button
                                onClick={() =>
                                  handleExamineEvidence(
                                    evidence.id
                                  )
                                }
                                disabled={
                                  discovered ||
                                  examiningEvidence ===
                                    evidence.id
                                }
                                className={`
                                  text-xs px-3 py-2 rounded-lg border transition
                                  ${
                                    discovered
                                      ? "border-emerald-500/10 text-emerald-400/60 cursor-default"
                                      : "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                  }
                                `}
                              >
                                {examiningEvidence ===
                                evidence.id
                                  ? "Examining..."
                                  : discovered
                                  ? "Evidence Examined"
                                  : "Examine Evidence"}
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="col-span-12 lg:col-span-3 xl:col-span-3">
            <div className="rounded-xl border border-white/10 bg-[#0b0d10] overflow-hidden">
              <div className="px-5 py-5 border-b border-white/10">
                <p className="text-[10px] tracking-[0.2em] text-slate-600 uppercase">
                  Case File
                </p>

                <h2 className="text-lg font-semibold mt-1">
                  Investigation Status
                </h2>
              </div>

              <div className="p-5">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Overall Progress
                    </p>

                    <p className="text-xs text-slate-400">
                      {progress}%
                    </p>
                  </div>

                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mt-3">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Locations
                    </p>

                    <p className="text-xl font-semibold mt-2">
                      {discoveredLocationCount}
                      <span className="text-xs text-slate-700">
                        /{caseData.locations.length}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Evidence
                    </p>

                    <p className="text-xl font-semibold mt-2">
                      {discoveredEvidenceCount}
                      <span className="text-xs text-slate-700">
                        /{caseData.evidence.length}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Suspects
                    </p>

                    <p className="text-xl font-semibold mt-2">
                      {interrogatedSuspectCount}
                      <span className="text-xs text-slate-700">
                        /{caseData.suspects.length}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Status
                    </p>

                    <p className="text-sm font-semibold mt-3 text-emerald-400">
                      {session.status === "completed"
                        ? "Closed"
                        : "Active"}
                    </p>
                  </div>
                </div>

                {/* Notes placeholder */}
                <div className="mt-6 rounded-xl border border-dashed border-white/10 p-5">
                  <p className="text-[10px] tracking-[0.18em] uppercase text-slate-600">
                    Investigator Notes
                  </p>

                  <p className="text-xs text-slate-700 mt-3 leading-5">
                    Record observations and build your
                    theory here.
                  </p>
                </div>

                {/* Accusation */}
                <button
                  onClick={() => {
                    setError("");

                    setAccusation({
                      suspectId:
                        accusation.suspectId ||
                        "",
                      motive:
                        accusation.motive || "",
                      method:
                        accusation.method || "",
                      reasoning:
                        accusation.reasoning || "",
                    });

                    setShowAccusation(true);
                  }}
                  disabled={
                    session.status === "completed"
                  }
                  className={`
                    w-full mt-5 py-3 rounded-xl text-xs font-medium border transition
                    ${
                      session.status === "completed"
                        ? "border-white/5 text-slate-700 cursor-not-allowed"
                        : "border-red-500/20 bg-red-500/[0.04] text-red-400 hover:bg-red-500/[0.08]"
                    }
                  `}
                >
                  {session.status === "completed"
                    ? "Accusation Submitted"
                    : "Make Accusation"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* =====================================================
          LOCATION INVESTIGATION MODAL
      ===================================================== */}

      {selectedLocation && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() =>
            setSelectedLocation(null)
          }
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0d0f12] border border-white/10 rounded-2xl shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-emerald-500 uppercase">
                  Location Investigation
                </p>

                <h2 className="text-xl font-semibold text-slate-100 mt-1">
                  {selectedLocation.name}
                </h2>

                <p className="text-xs text-slate-600 mt-1">
                  Examine the scene for clues and
                  inconsistencies.
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedLocation(null)
                }
                className="w-8 h-8 shrink-0 rounded-lg border border-white/10 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Scene */}
              <section>
                <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase mb-2">
                  Scene
                </p>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-sm leading-7 text-slate-300">
                    {selectedLocation.description}
                  </p>
                </div>
              </section>

              {/* Discoverable details */}
              {selectedLocation.discoverableDetails &&
                selectedLocation
                  .discoverableDetails.length >
                  0 && (
                  <section>
                    <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase mb-3">
                      Discoverable Details
                    </p>

                    <div className="space-y-3">
                      {selectedLocation.discoverableDetails.map(
                        (
                          detail: string,
                          index: number
                        ) => (
                          <div
                            key={index}
                            className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
                          >
                            <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                              <span className="text-[10px] text-emerald-400">
                                {index + 1}
                              </span>
                            </div>

                            <p className="text-sm leading-6 text-slate-300">
                              {detail}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

              {/* Evidence at location */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase">
                    Evidence at Scene
                  </p>

                  <span className="text-[10px] text-slate-600">
                    {locationEvidence.length} clues
                  </span>
                </div>

                <div className="space-y-3">
                  {locationEvidence.length > 0 ? (
                    locationEvidence.map(
                      (evidence: any) => {
                        const discovered =
                          discoveredEvidenceIds.has(
                            evidence.id
                          );

                        return (
                          <div
                            key={evidence.id}
                            className={`
                              rounded-xl border p-4 transition
                              ${
                                discovered
                                  ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                                  : "border-white/10 bg-white/[0.02]"
                              }
                            `}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {evidence.name}
                                </p>

                                <p className="text-xs text-slate-500 mt-1 leading-5">
                                  {evidence.description}
                                </p>
                              </div>

                              {discovered && (
                                <span className="shrink-0 text-[9px] uppercase tracking-wider text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded">
                                  Found
                                </span>
                              )}
                            </div>

                            <div className="mt-4">
                              <button
                                onClick={() =>
                                  handleExamineEvidence(
                                    evidence.id
                                  )
                                }
                                disabled={
                                  discovered ||
                                  examiningEvidence ===
                                    evidence.id
                                }
                                className={`
                                  text-xs px-3 py-2 rounded-lg border transition
                                  ${
                                    discovered
                                      ? "border-emerald-500/10 text-emerald-400/60 cursor-default"
                                      : "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                  }
                                `}
                              >
                                {examiningEvidence ===
                                evidence.id
                                  ? "Examining..."
                                  : discovered
                                  ? "Evidence Examined"
                                  : "Examine Evidence"}
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
                      <p className="text-xs text-slate-600">
                        No evidence has been recorded at
                        this location.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          INTERROGATION MODAL
      ===================================================== */}

      {selectedSuspect && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() =>
            setSelectedSuspect(null)
          }
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0d0f12] border border-white/10 rounded-2xl shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-amber-500 uppercase">
                  Interrogation
                </p>

                <h2 className="text-xl font-semibold text-slate-100 mt-1">
                  {selectedSuspect.name}
                </h2>

                <p className="text-xs text-slate-600 mt-1">
                  {selectedSuspect.age
                    ? `${selectedSuspect.age} years old`
                    : "Age unknown"}
                  {" • "}
                  {selectedSuspect.occupation ||
                    "Occupation unknown"}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedSuspect(null)
                }
                className="w-8 h-8 shrink-0 rounded-lg border border-white/10 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Relationship */}
              <section>
                <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase mb-2">
                  Relationship to Victim
                </p>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-sm text-slate-300">
                    {selectedSuspect.relationshipToVictim ||
                      "No information available."}
                  </p>
                </div>
              </section>

              {/* Alibi */}
              <section>
                <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase mb-2">
                  Alibi
                </p>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-sm text-slate-300 leading-6">
                    {selectedSuspect.alibi ||
                      "No alibi provided."}
                  </p>
                </div>
              </section>

              {/* Personality */}
              {selectedSuspect.personality && (
                <section>
                  <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase mb-2">
                    Personality
                  </p>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-sm text-slate-400 leading-6">
                      {selectedSuspect.personality}
                    </p>
                  </div>
                </section>
              )}

              {/* Statements */}
              <section>
                <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase mb-3">
                  Interview Transcript
                </p>

                <div className="space-y-3">
                  {selectedSuspect.statements &&
                  selectedSuspect.statements.length >
                    0 ? (
                    selectedSuspect.statements.map(
                      (
                        statement: string,
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                        >
                          <div className="flex gap-3">
                            <span className="text-[10px] text-amber-500/70 pt-0.5">
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            <p className="text-sm leading-6 text-slate-300">
                              {statement}
                            </p>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
                      <p className="text-xs text-slate-600">
                        No statements available.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ACCUSATION MODAL
      ===================================================== */}

      {showAccusation && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() =>
            setShowAccusation(false)
          }
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0d0f12] border border-white/10 rounded-2xl shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-red-400 uppercase">
                  Final Decision
                </p>

                <h2 className="text-xl font-semibold mt-1">
                  Make Your Accusation
                </h2>

                <p className="text-xs text-slate-600 mt-1">
                  State who you believe is responsible
                  and explain your reasoning.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowAccusation(false)
                }
                className="w-8 h-8 rounded-lg border border-white/10 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Suspect */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-slate-600">
                  Suspect
                </label>

                <select
                  value={accusation.suspectId}
                  onChange={(e) =>
                    setAccusation({
                      ...accusation,
                      suspectId:
                        e.target.value,
                    })
                  }
                  className="w-full mt-2 bg-[#090a0c] border border-white/10 rounded-lg px-3 py-3 text-sm text-slate-300 outline-none focus:border-white/20"
                >
                  <option value="">
                    Select suspect
                  </option>

                  {caseData.suspects.map(
                    (suspect: any) => (
                      <option
                        key={suspect.id}
                        value={suspect.id}
                      >
                        {suspect.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Motive */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-slate-600">
                  Motive
                </label>

                <textarea
                  value={accusation.motive}
                  onChange={(e) =>
                    setAccusation({
                      ...accusation,
                      motive: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Why did they do it?"
                  className="w-full mt-2 bg-[#090a0c] border border-white/10 rounded-lg px-3 py-3 text-sm text-slate-300 placeholder:text-slate-700 outline-none focus:border-white/20 resize-none"
                />
              </div>

              {/* Method */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-slate-600">
                  Method
                </label>

                <textarea
                  value={accusation.method}
                  onChange={(e) =>
                    setAccusation({
                      ...accusation,
                      method: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="How was the crime committed?"
                  className="w-full mt-2 bg-[#090a0c] border border-white/10 rounded-lg px-3 py-3 text-sm text-slate-300 placeholder:text-slate-700 outline-none focus:border-white/20 resize-none"
                />
              </div>

              {/* Reasoning */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-slate-600">
                  Reasoning
                </label>

                <textarea
                  value={accusation.reasoning}
                  onChange={(e) =>
                    setAccusation({
                      ...accusation,
                      reasoning:
                        e.target.value,
                    })
                  }
                  rows={6}
                  placeholder="Explain how the evidence connects the suspect, motive, and method..."
                  className="w-full mt-2 bg-[#090a0c] border border-white/10 rounded-lg px-3 py-3 text-sm text-slate-300 placeholder:text-slate-700 outline-none focus:border-white/20 resize-none"
                />

                <p className="text-[10px] text-slate-700 mt-2">
                  {accusation.reasoning.length} characters
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitAccusation}
                disabled={
                  submittingAccusation
                }
                className="w-full py-3.5 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 hover:bg-red-500/[0.12] transition text-xs font-medium disabled:opacity-50"
              >
                {submittingAccusation
                  ? "Evaluating..."
                  : "Submit Final Accusation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          RESULT MODAL
      ===================================================== */}

      {result && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setResult(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0d0f12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="px-6 py-6 border-b border-white/10">
              <p className="text-[10px] tracking-[0.2em] text-slate-600 uppercase">
                Investigation Complete
              </p>

              <h2 className="text-2xl font-semibold mt-2">
                Case Evaluation
              </h2>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  Final Score
                </p>

                <p className="text-5xl font-semibold mt-3">
                  {result.score}
                </p>

                <p className="text-xs text-slate-600 mt-1">
                  / 100
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <div
                  className={`rounded-xl border p-4 text-center ${
                    result.correctCulprit
                      ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                      : "border-red-500/20 bg-red-500/[0.04]"
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Culprit
                  </p>

                  <p
                    className={`text-xs mt-2 ${
                      result.correctCulprit
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {result.correctCulprit
                      ? "Correct"
                      : "Incorrect"}
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-4 text-center ${
                    result.correctMotive
                      ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                      : "border-red-500/20 bg-red-500/[0.04]"
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Motive
                  </p>

                  <p
                    className={`text-xs mt-2 ${
                      result.correctMotive
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {result.correctMotive
                      ? "Correct"
                      : "Incorrect"}
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-4 text-center ${
                    result.correctMethod
                      ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                      : "border-red-500/20 bg-red-500/[0.04]"
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Method
                  </p>

                  <p
                    className={`text-xs mt-2 ${
                      result.correctMethod
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {result.correctMethod
                      ? "Correct"
                      : "Incorrect"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setResult(null)}
                className="w-full mt-5 py-3 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
              >
                Close Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}