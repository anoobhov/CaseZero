"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getSession,
  investigateLocation,
  discoverEvidence,
} from "@/lib/api";

export default function GamePage() {
  const params = useParams();

  const sessionId = params.sessionId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState<string | null>(null);
  const [error, setError] = useState("");
const [examiningEvidence, setExaminingEvidence] = useState<string | null>(
  null
);
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
    try {
      setInvestigating(locationId);
      setError("");

      await investigateLocation(sessionId, locationId);

      // Refresh session state
      await loadSession();
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


  async function handleExamineEvidence(evidenceId: string) {
  try {
    setExaminingEvidence(evidenceId);
    setError("");

    await discoverEvidence(sessionId, evidenceId);

    await loadSession();
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading case...</p>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const { session, case: caseData } = data;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wider">
            CaseZero
          </p>

          <h1 className="text-4xl font-bold mt-2">
            {caseData.title}
          </h1>

          <p className="mt-3 text-slate-400 max-w-3xl">
            {caseData.description}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-950 border border-red-800 text-red-300 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* Progress */}
        <section className="mt-8 grid grid-cols-3 gap-4">

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Locations Investigated
            </p>

            <p className="text-3xl font-bold mt-2">
              {session.discoveredLocations.length}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Evidence Found
            </p>

            <p className="text-3xl font-bold mt-2">
              {session.discoveredEvidence.length}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm">
              Suspects Interrogated
            </p>

            <p className="text-3xl font-bold mt-2">
              {session.interrogatedSuspects.length}
            </p>
          </div>

        </section>

        {/* Locations */}
        <section className="mt-10">

          <h2 className="text-2xl font-semibold">
            Locations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

            {caseData.locations.map((location: any) => {
              const investigated =
                session.discoveredLocations.includes(location.id);

              const isLoading =
                investigating === location.id;

              return (
                <div
                  key={location.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">

                    <h3 className="text-lg font-semibold">
                      {location.name}
                    </h3>

                    {investigated && (
                      <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
                        Investigated
                      </span>
                    )}

                  </div>

                  <p className="text-slate-400 text-sm mt-3">
                    {location.description}
                  </p>

                  <button
                    onClick={() =>
                      handleInvestigate(location.id)
                    }
                    disabled={investigated || isLoading}
                    className="mt-5 w-full bg-white text-black rounded-lg py-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading
                      ? "Investigating..."
                      : investigated
                      ? "Investigated"
                      : "Investigate"}
                  </button>

                </div>
              );
            })}

          </div>

        </section>



        {/* Evidence */}
<section className="mt-12">

  <h2 className="text-2xl font-semibold">
    Evidence
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

    {caseData.evidence
      .filter((evidence: any) =>
        session.discoveredLocations.includes(
          evidence.locationId
        )
      )
      .map((evidence: any) => {

        const discovered =
          session.discoveredEvidence.includes(
            evidence.id
          );

        const isLoading =
          examiningEvidence === evidence.id;

        return (
          <div
            key={evidence.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >

            <div className="flex items-start justify-between gap-3">

              <h3 className="text-lg font-semibold">
                {evidence.name}
              </h3>

              {discovered && (
                <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
                  Discovered
                </span>
              )}

            </div>

            <p className="text-sm text-slate-400 mt-3">
              {evidence.description}
            </p>

            <button
              onClick={() =>
                handleExamineEvidence(evidence.id)
              }
              disabled={discovered || isLoading}
              className="mt-5 w-full bg-white text-black rounded-lg py-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Examining..."
                : discovered
                ? "Evidence Examined"
                : "Examine Evidence"}
            </button>

          </div>
        );
      })}

  </div>

  {caseData.evidence.filter((evidence: any) =>
    session.discoveredLocations.includes(
      evidence.locationId
    )
  ).length === 0 && (
    <p className="text-slate-500 mt-4">
      No evidence discovered yet.
    </p>
  )}

</section>

        {/* Suspects */}
        <section className="mt-12">

          <h2 className="text-2xl font-semibold">
            Suspects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

            {caseData.suspects.map((suspect: any) => {

              const interrogated =
                session.interrogatedSuspects.includes(
                  suspect.id
                );

              return (
                <div
                  key={suspect.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5"
                >

                  <div className="flex items-start justify-between">

                    <h3 className="text-lg font-semibold">
                      {suspect.name}
                    </h3>

                    {interrogated && (
                      <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
                        Interrogated
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-slate-400 mt-2">
                    {suspect.occupation}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    {suspect.relationshipToVictim}
                  </p>

                  <button
                    disabled={interrogated}
                    className="mt-5 w-full border border-slate-700 rounded-lg py-2 disabled:opacity-40"
                  >
                    {interrogated
                      ? "Already Interrogated"
                      : "Interrogate"}
                  </button>

                </div>
              );
            })}

          </div>

        </section>

      </div>
    </main>
  );
}