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
  const [error, setError] = useState("");

  const [examiningEvidence, setExaminingEvidence] =
    useState<string | null>(null);

  const [interrogatingSuspect, setInterrogatingSuspect] =
    useState<string | null>(null);

  const [selectedSuspect, setSelectedSuspect] =
    useState<any>(null);

    const [selectedLocation, setSelectedLocation] =
  useState<any>(null);

  

  const [showAccusation, setShowAccusation] = useState(false);

  const [accusation, setAccusation] = useState({
    suspectId: "",
    motive: "",
    method: "",
    reasoning: "",
  });

  const [submittingAccusation, setSubmittingAccusation] =
    useState(false);

  const [result, setResult] = useState<any>(null);

  async function loadSession() {
    try {
      setLoading(true);

      const result = await getSession(sessionId);

      setData(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load game"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, [sessionId]);

 async function handleInvestigate(locationId: string) {
  const location = caseData.locations.find(
    (location: any) => location.id === locationId
  );

  if (!location) return;

  const alreadyInvestigated =
    session.discoveredLocations.includes(locationId);

  // If already investigated, just open the investigation modal.
  if (alreadyInvestigated) {
    setSelectedLocation(location);
    return;
  }

  try {
    setInvestigating(locationId);
    setError("");

    await investigateLocation(sessionId, locationId);

    setData((prev: any) => {
      if (!prev) return prev;

      const alreadyExists =
        prev.session.discoveredLocations.includes(locationId);

      return {
        ...prev,
        session: {
          ...prev.session,
          discoveredLocations: alreadyExists
            ? prev.session.discoveredLocations
            : [
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

        return {
          ...prev,
          session: {
            ...prev.session,
            discoveredEvidence: alreadyDiscovered
              ? prev.session.discoveredEvidence
              : [
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

  async function handleInterrogateSuspect(
    suspectId: string
  ) {
    try {
      setInterrogatingSuspect(suspectId);
      setError("");

      const result = await interrogateSuspect(
        sessionId,
        suspectId
      );

      setSelectedSuspect(result.suspect);

      setData((prev: any) => {
        if (!prev) return prev;

        const alreadyInterrogated =
          prev.session.interrogatedSuspects.includes(
            suspectId
          );

        return {
          ...prev,
          session: {
            ...prev.session,
            interrogatedSuspects: alreadyInterrogated
              ? prev.session.interrogatedSuspects
              : [
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

  async function handleSubmitAccusation() {
    try {
      if (
        !accusation.suspectId ||
        !accusation.motive.trim() ||
        !accusation.method.trim() ||
        !accusation.reasoning.trim()
      ) {
        setError(
          "Please complete the entire accusation."
        );
        return;
      }

      setSubmittingAccusation(true);
      setError("");

      const response = await submitAccusation(
        sessionId,
        accusation
      );

      setResult(response.result);

      await loadSession();

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08090b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-slate-500 mt-4">
            Loading investigation...
          </p>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-[#08090b] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const { session, case: caseData } = data;

  return (
    <main className="min-h-screen bg-[#08090b] text-white">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-white/10 bg-[#0a0b0e]">
        <div className="max-w-[1600px] mx-auto px-6 py-6">

          <div className="flex items-center justify-between">

            <div>
              <div className="flex items-center gap-3">

                <span className="text-xs font-medium tracking-[0.3em] text-slate-500 uppercase">
                  CaseZero
                </span>

                <span className="text-slate-700">
                  /
                </span>

                <span className="text-xs tracking-[0.2em] text-slate-600 uppercase">
                  Investigation
                </span>

              </div>

              <h1 className="text-3xl font-semibold tracking-tight mt-3">
                {caseData.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">

              <span
                className={`w-2 h-2 rounded-full ${
                  session.status === "in_progress"
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-slate-500"
                }`}
              />

              <div className="text-right">

                <p className="text-[10px] tracking-[0.2em] text-slate-600 uppercase">
                  Investigation
                </p>

                <p
                  className={`text-sm font-medium mt-1 ${
                    session.status === "in_progress"
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {session.status === "in_progress"
                    ? "ACTIVE"
                    : "COMPLETED"}
                </p>

              </div>

            </div>

          </div>

          <div className="mt-5 max-w-4xl">

            <p className="text-sm leading-7 text-slate-400">
              {caseData.description}
            </p>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">

            <div className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
              <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                Locations
              </p>

              <p className="text-lg font-semibold mt-1">
                {caseData.locations.length}
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
              <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                Suspects
              </p>

              <p className="text-lg font-semibold mt-1">
                {caseData.suspects.length}
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
              <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                Evidence
              </p>

              <p className="text-lg font-semibold mt-1">
                {session.discoveredEvidence.length}
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
              <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                Interrogated
              </p>

              <p className="text-lg font-semibold mt-1">
                {session.interrogatedSuspects.length}
              </p>
            </div>

          </div>

        </div>
      </header>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="max-w-[1600px] mx-auto px-6 py-6">

        <div className="grid grid-cols-12 gap-5 items-start">


          {/* =================================================
              LEFT SIDEBAR
          ================================================== */}

          <aside className="col-span-12 lg:col-span-3 xl:col-span-2">

            {/* LOCATIONS */}

            <div className="bg-[#0d0f12] border border-white/10 rounded-xl overflow-hidden">

              <div className="px-5 py-4 border-b border-white/10">

                <p className="text-xs tracking-widest text-slate-500">
                  LOCATIONS
                </p>

              </div>

              <div className="p-3 space-y-1">

                {caseData.locations.map(
                  (location: any) => {

                    const investigated =
                      session.discoveredLocations.includes(
                        location.id
                      );

                    const isLoading =
                      investigating === location.id;

                    return (
                      <button
                        key={location.id}
                        onClick={() =>
                          handleInvestigate(
                            location.id
                          )
                        }
                        disabled={isLoading}
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
                              w-2 h-2 rounded-full transition-all
                              ${
                                investigated
                                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                  : "bg-slate-700 group-hover:bg-slate-500"
                              }
                            `}
                          />

                          <span className="text-sm flex-1">
                            {location.name}
                          </span>

                          {isLoading && (
                            <span className="w-3 h-3 border border-white/10 border-t-emerald-400 rounded-full animate-spin" />
                          )}

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>


            {/* SUSPECTS */}

            <div className="bg-[#0d0f12] border border-white/10 rounded-xl overflow-hidden mt-5">

              <div className="px-5 py-4 border-b border-white/10">

                <p className="text-xs tracking-widest text-slate-500">
                  SUSPECTS
                </p>

              </div>

              <div className="p-3 space-y-1">

                {caseData.suspects.map(
                  (suspect: any) => {

                    const interrogated =
                      session.interrogatedSuspects.includes(
                        suspect.id
                      );

                    const isLoading =
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
                        disabled={isLoading}
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
                              w-2 h-2 rounded-full transition-all
                              ${
                                interrogated
                                  ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]"
                                  : "bg-slate-700 group-hover:bg-slate-500"
                              }
                            `}
                          />

                          <span className="text-sm flex-1">
                            {suspect.name}
                          </span>

                          {isLoading && (
                            <span className="w-3 h-3 border border-white/10 border-t-amber-400 rounded-full animate-spin" />
                          )}

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
          ================================================== */}

          <section className="col-span-12 lg:col-span-6 xl:col-span-7">

            <div className="bg-[#0d0f12] border border-white/10 rounded-xl">

              {/* CENTER HEADER */}

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
                      Examine discovered clues and connect them to the case.
                    </p>

                  </div>

                  <div className="shrink-0 text-right">

                    <p className="text-2xl font-semibold">
                      {session.discoveredEvidence.length}
                    </p>

                    <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                      Clues
                    </p>

                  </div>

                </div>

              </div>


              {/* CONTENT */}

              <div className="p-6">

                {/* =================================================
                    EVIDENCE
                ================================================== */}

                <div>

                  <div className="flex items-center justify-between">

                    <h3 className="font-semibold">
                      Evidence
                    </h3>

                    <span className="text-xs text-slate-600">
                      {session.discoveredEvidence.length} /{" "}
                      {caseData.evidence.length} discovered
                    </span>

                  </div>


                  {caseData.evidence.filter(
                    (evidence: any) =>
                      session.discoveredLocations.includes(
                        evidence.locationId
                      )
                  ).length === 0 ? (

                    <div className="border border-dashed border-white/10 rounded-xl py-14 text-center mt-5">

                      <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto">

                        <span className="text-slate-600">
                          ?
                        </span>

                      </div>

                      <p className="text-sm text-slate-500 mt-4">
                        No evidence has been discovered yet.
                      </p>

                      <p className="text-xs text-slate-700 mt-2">
                        Investigate a location to uncover clues.
                      </p>

                    </div>

                  ) : (

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-5">

                      {caseData.evidence
                        .filter(
                          (evidence: any) =>
                            session.discoveredLocations.includes(
                              evidence.locationId
                            )
                        )
                        .map(
                          (evidence: any) => {

                            const discovered =
                              session.discoveredEvidence.includes(
                                evidence.id
                              );

                            const isLoading =
                              examiningEvidence ===
                              evidence.id;

                            const evidenceNumber =
                              caseData.evidence.findIndex(
                                (item: any) =>
                                  item.id ===
                                  evidence.id
                              ) + 1;

                            const locationName =
                              caseData.locations.find(
                                (location: any) =>
                                  location.id ===
                                  evidence.locationId
                              )?.name ||
                              "Unknown";

                            return (
                              <div
                                key={evidence.id}
                                className={`
                                  group relative overflow-hidden
                                  border rounded-xl p-5
                                  transition-all duration-200
                                  ${
                                    discovered
                                      ? "border-emerald-500/10 bg-emerald-500/[0.025]"
                                      : "border-white/10 bg-black/20 hover:border-white/15 hover:bg-white/[0.02]"
                                  }
                                `}
                              >

                                <div className="flex items-start justify-between gap-4">

                                  <div>

                                    <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase">
                                      Evidence #
                                      {String(
                                        evidenceNumber
                                      ).padStart(
                                        2,
                                        "0"
                                      )}
                                    </p>

                                    <h4 className="font-semibold text-slate-100 mt-1">
                                      {evidence.name}
                                    </h4>

                                  </div>

                                  {discovered && (
                                    <span className="shrink-0 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-400">

                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                                      Found

                                    </span>
                                  )}

                                </div>

                                <p className="text-sm text-slate-500 leading-6 mt-4">
                                  {evidence.description}
                                </p>

                                <div className="mt-5 pt-4 border-t border-white/5">

                                  <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                                    Location
                                  </p>

                                  <p className="text-xs text-slate-400 mt-1">
                                    {locationName}
                                  </p>

                                </div>

                                <button
                                  onClick={() =>
                                    handleExamineEvidence(
                                      evidence.id
                                    )
                                  }
                                  disabled={
                                    discovered ||
                                    isLoading
                                  }
                                  className={`
                                    mt-4 w-full rounded-lg py-2.5
                                    text-xs font-medium
                                    transition-all duration-200
                                    ${
                                      discovered
                                        ? "bg-emerald-500/[0.06] text-emerald-400 border border-emerald-500/10 cursor-default"
                                        : "border border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/15"
                                    }
                                  `}
                                >
                                  {isLoading
                                    ? "Examining..."
                                    : discovered
                                    ? "✓ Evidence Examined"
                                    : "Examine Evidence"}
                                </button>

                              </div>
                            );
                          }
                        )}

                    </div>

                  )}

                </div>


                {/* =====================================================
    INTERROGATION MODAL
====================================================== */}

{selectedSuspect && (
  <div
    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6"
    onClick={() => setSelectedSuspect(null)}
  >

    <div
      className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0d0f12] border border-white/10 rounded-2xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* Header */}

      <div className="sticky top-0 z-10 bg-[#0d0f12] border-b border-white/10 px-6 py-5">

        <div className="flex items-start justify-between">

          <div>

            <div className="flex items-center gap-2">

              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />

              <p className="text-[10px] tracking-[0.2em] text-amber-500 uppercase">
                Interrogation
              </p>

            </div>

            <h2 className="text-2xl font-semibold mt-2">
              {selectedSuspect.name}
            </h2>

            <p className="text-xs text-slate-600 mt-1">
              {selectedSuspect.age
                ? `${selectedSuspect.age} years old`
                : "Age unknown"}

              {selectedSuspect.occupation
                ? ` · ${selectedSuspect.occupation}`
                : ""}
            </p>

          </div>

          {/* Close button */}

          <button
            onClick={() => setSelectedSuspect(null)}
            className="w-9 h-9 rounded-lg border border-white/10 text-slate-500 hover:text-white hover:bg-white/5 transition flex items-center justify-center text-xl"
          >
            ×
          </button>

        </div>

      </div>


      {/* Content */}

      <div className="p-6">

        {/* Relationship + Alibi */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {selectedSuspect.relationshipToVictim && (
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">

              <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                Relationship
              </p>

              <p className="text-sm text-slate-300 mt-2">
                {selectedSuspect.relationshipToVictim}
              </p>

            </div>
          )}

          {selectedSuspect.alibi && (
            <div className="bg-black/20 border border-white/5 rounded-xl p-4">

              <p className="text-[10px] tracking-widest text-slate-600 uppercase">
                Alibi
              </p>

              <p className="text-sm text-slate-300 leading-6 mt-2">
                {selectedSuspect.alibi}
              </p>

            </div>
          )}

        </div>


        {/* Personality */}

        {selectedSuspect.personality && (
          <div className="mt-4 bg-black/20 border border-white/5 rounded-xl p-4">

            <p className="text-[10px] tracking-widest text-slate-600 uppercase">
              Behavioral Profile
            </p>

            <p className="text-sm text-slate-400 leading-6 mt-2">
              {selectedSuspect.personality}
            </p>

          </div>
        )}


        {/* Transcript */}

        <div className="mt-8">

          <div className="flex items-center justify-between mb-5">

            <div>

              <p className="text-[10px] tracking-[0.2em] text-slate-600 uppercase">
                Interview Transcript
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Recorded statements
              </p>

            </div>

            <span className="text-xs text-slate-700">
              {selectedSuspect.statements?.length || 0} statements
            </span>

          </div>


          <div className="space-y-3">

            {selectedSuspect.statements?.map(
              (
                statement: string,
                index: number
              ) => (

                <div
                  key={index}
                  className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-white/10 transition"
                >

                  <div className="flex items-center gap-3 mb-3">

                    <span className="text-[10px] text-slate-700 font-mono">
                      #{String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="text-[10px] tracking-widest text-amber-500/70 uppercase">
                      {selectedSuspect.name}
                    </span>

                  </div>

                  <p className="text-sm text-slate-300 leading-7">
                    "{statement}"
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </div>

  </div>
)}

              </div>

            </div>

          </section>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}

          <aside className="col-span-12 lg:col-span-3">

            <div className="bg-[#0d0f12] border border-white/10 rounded-xl overflow-hidden sticky top-6">

              <div className="px-5 py-4 border-b border-white/10">

                <p className="text-xs tracking-widest text-slate-500">
                  CASE FILE
                </p>

              </div>

              <div className="p-5 space-y-6">

                {/* Progress */}

                <div>

                  <div className="flex justify-between text-xs">

                    <span className="text-slate-500">
                      Investigation Progress
                    </span>

                    <span className="text-slate-300">
                      {session.discoveredEvidence.length}
                    </span>

                  </div>

                  <div className="h-1 bg-white/5 rounded-full mt-2">

                    <div
                      className="h-1 bg-emerald-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          session.discoveredEvidence.length *
                            20
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                {/* Evidence */}

                <div>

                  <p className="text-xs text-slate-500">
                    EVIDENCE
                  </p>

                  <p className="text-2xl font-semibold mt-1">
                    {session.discoveredEvidence.length}
                  </p>

                </div>


                {/* Interrogated */}

                <div>

                  <p className="text-xs text-slate-500">
                    INTERROGATED
                  </p>

                  <p className="text-2xl font-semibold mt-1">
                    {session.interrogatedSuspects.length}
                  </p>

                </div>


                {/* Notes */}

                <div>

                  <p className="text-xs text-slate-500">
                    NOTES
                  </p>

                  <p className="text-sm text-slate-600 mt-2">
                    Notes system coming soon.
                  </p>

                </div>


                {/* Accusation */}

                {session.status === "in_progress" && (

                  <button
                    onClick={() =>
                      setShowAccusation(true)
                    }
                    className="w-full bg-red-600 hover:bg-red-500 transition rounded-lg py-3 text-sm font-semibold"
                  >
                    Make Accusation
                  </button>

                )}

              </div>

            </div>

          </aside>

        </div>

      </div>


      {/* =====================================================
          ACCUSATION MODAL
      ====================================================== */}

      {showAccusation && (

        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">

          <div className="w-full max-w-2xl bg-[#0d0f12] border border-white/10 rounded-xl">

            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

              <div>

                <p className="text-xs tracking-widest text-red-400">
                  FINAL DECISION
                </p>

                <h2 className="text-2xl font-semibold mt-1">
                  Make Your Accusation
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowAccusation(false)
                }
                className="text-slate-500 hover:text-white text-xl"
              >
                ×
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div>

                <label className="block text-sm text-slate-400 mb-2">
                  Who is the culprit?
                </label>

                <select
                  value={accusation.suspectId}
                  onChange={(e) =>
                    setAccusation(
                      (prev) => ({
                        ...prev,
                        suspectId:
                          e.target.value,
                      })
                    )
                  }
                  className="w-full bg-[#15181d] border border-white/10 rounded-lg px-4 py-3 text-white"
                >

                  <option value="">
                    Select a suspect
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


              <div>

                <label className="block text-sm text-slate-400 mb-2">
                  What was the motive?
                </label>

                <input
                  type="text"
                  value={accusation.motive}
                  onChange={(e) =>
                    setAccusation(
                      (prev) => ({
                        ...prev,
                        motive:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="Why did they commit the crime?"
                  className="w-full bg-[#15181d] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600"
                />

              </div>


              <div>

                <label className="block text-sm text-slate-400 mb-2">
                  How was the crime committed?
                </label>

                <input
                  type="text"
                  value={accusation.method}
                  onChange={(e) =>
                    setAccusation(
                      (prev) => ({
                        ...prev,
                        method:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="Describe the method..."
                  className="w-full bg-[#15181d] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600"
                />

              </div>


              <div>

                <label className="block text-sm text-slate-400 mb-2">
                  Explain your reasoning
                </label>

                <textarea
                  value={accusation.reasoning}
                  onChange={(e) =>
                    setAccusation(
                      (prev) => ({
                        ...prev,
                        reasoning:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="Explain how the evidence and statements led you to this conclusion..."
                  rows={6}
                  className="w-full bg-[#15181d] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 resize-none"
                />

                <p className="text-xs text-slate-600 mt-2">
                  Explain the chain of evidence that supports your accusation.
                </p>

              </div>


              {error && (

                <div className="bg-red-950/50 border border-red-900 rounded-lg p-3 text-sm text-red-300">
                  {error}
                </div>

              )}


              <button
                onClick={handleSubmitAccusation}
                disabled={submittingAccusation}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 font-semibold transition"
              >

                {submittingAccusation
                  ? "Submitting Accusation..."
                  : "Submit Final Accusation"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* {/* =====================================================
    LOCATION INVESTIGATION MODAL
====================================================== */}


{selectedLocation && (
  <div
    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6"
    onClick={() => setSelectedLocation(null)}
  >
    <div
      className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0d0f12] border border-white/10 rounded-2xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-emerald-500 uppercase">
            Location Investigation
          </p>

          <h2 className="text-xl font-semibold text-slate-100 mt-1">
            {selectedLocation.name}
          </h2>

          <p className="text-xs text-slate-600 mt-1">
            Examine the scene for clues and inconsistencies.
          </p>
        </div>

        <button
          onClick={() => setSelectedLocation(null)}
          className="w-8 h-8 rounded-lg border border-white/10 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition"
        >
          ×
        </button>
      </div>

      {/* Scene description */}
      <div className="p-6 space-y-6">

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
          selectedLocation.discoverableDetails.length > 0 && (
            <section>
              <p className="text-[10px] tracking-[0.18em] text-slate-600 uppercase mb-3">
                Discoverable Details
              </p>

              <div className="space-y-3">
                {selectedLocation.discoverableDetails.map(
                  (detail: string, index: number) => (
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
              {
                caseData.evidence.filter(
                  (evidence: any) =>
                    evidence.locationId === selectedLocation.id
                ).length
              }{" "}
              clues
            </span>
          </div>

          <div className="space-y-3">
            {caseData.evidence
              .filter(
                (evidence: any) =>
                  evidence.locationId === selectedLocation.id
              )
              .map((evidence: any) => {
                const discovered =
                  session.discoveredEvidence.includes(evidence.id);

                return (
                  <div
                    key={evidence.id}
                    className={`rounded-xl border p-4 transition ${
                      discovered
                        ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
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
                        onClick={() => handleExamineEvidence(evidence.id)}
                        disabled={discovered || examiningEvidence === evidence.id}
                        className={`text-xs px-3 py-2 rounded-lg border transition ${
                          discovered
                            ? "border-emerald-500/10 text-emerald-400/60 cursor-default"
                            : "border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        }`}
                      >
                        {examiningEvidence === evidence.id
                          ? "Examining..."
                          : discovered
                          ? "Evidence Examined"
                          : "Examine Evidence"}
                      </button>
                    </div>
                  </div>
                );
              })}

            {caseData.evidence.filter(
              (evidence: any) =>
                evidence.locationId === selectedLocation.id
            ).length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
                <p className="text-xs text-slate-600">
                  No evidence has been recorded at this location.
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
          RESULT MODAL
      ====================================================== */}

      {result && (

        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">

          <div className="w-full max-w-xl bg-[#0d0f12] border border-white/10 rounded-xl p-8">

            <p className="text-xs tracking-widest text-emerald-400">
              CASE COMPLETE
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Investigation Results
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-8">

              <div className="bg-black/30 rounded-lg p-4">

                <p className="text-sm text-slate-500">
                  Culprit
                </p>

                <p className="text-xl font-semibold mt-1">
                  {result.correctCulprit
                    ? "Correct"
                    : "Incorrect"}
                </p>

              </div>


              <div className="bg-black/30 rounded-lg p-4">

                <p className="text-sm text-slate-500">
                  Motive
                </p>

                <p className="text-xl font-semibold mt-1">
                  {result.correctMotive
                    ? "Correct"
                    : "Incorrect"}
                </p>

              </div>


              <div className="bg-black/30 rounded-lg p-4">

                <p className="text-sm text-slate-500">
                  Method
                </p>

                <p className="text-xl font-semibold mt-1">
                  {result.correctMethod
                    ? "Correct"
                    : "Incorrect"}
                </p>

              </div>


              <div className="bg-black/30 rounded-lg p-4">

                <p className="text-sm text-slate-500">
                  Score
                </p>

                <p className="text-3xl font-bold mt-1">
                  {result.score}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}