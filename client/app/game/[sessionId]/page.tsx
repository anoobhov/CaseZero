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
const [examiningEvidence, setExaminingEvidence] = useState<string | null>(
  null);


const [interrogatingSuspect, setInterrogatingSuspect] =
  useState<string | null>(null);

const [selectedSuspect, setSelectedSuspect] =
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

async function handleInterrogateSuspect(suspectId: string) {
  try {
    setInterrogatingSuspect(suspectId);
    setError("");

    const result = await interrogateSuspect(
      sessionId,
      suspectId
    );

    setSelectedSuspect(result.suspect);

    await loadSession();
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
      setError("Please complete the entire accusation.");
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

      const isLoading =
        interrogatingSuspect === suspect.id;

      return (
        <div
          key={suspect.id}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5"
        >

          <div className="flex items-start justify-between gap-3">

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
            onClick={() =>
              handleInterrogateSuspect(suspect.id)
            }
            disabled={isLoading}
            className="mt-5 w-full bg-white text-black rounded-lg py-2 font-medium disabled:opacity-40"
          >
            {isLoading
              ? "Interrogating..."
              : interrogated
              ? "Interrogate Again"
              : "Interrogate"}
          </button>

        </div>
      );
    })}

  </div>

</section>


{selectedSuspect && (
  <section className="mt-10 bg-slate-900 border border-slate-800 rounded-xl p-6">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-500 uppercase tracking-wider">
          Interrogation
        </p>

        <h2 className="text-2xl font-semibold mt-1">
          {selectedSuspect.name}
        </h2>
      </div>

      <button
        onClick={() => setSelectedSuspect(null)}
        className="text-slate-400 hover:text-white"
      >
        Close
      </button>

    </div>

    <div className="mt-6">

      <h3 className="text-lg font-medium">
        Statements
      </h3>

      <div className="mt-4 space-y-4">

        {selectedSuspect.statements.map(
          (statement: string, index: number) => (
            <div
              key={index}
              className="border-l-2 border-slate-600 pl-4"
            >
              <p className="text-slate-300">
                "{statement}"
              </p>
            </div>
          )
        )}

      </div>

    </div>

  </section>
)}

{/* accuse button */}
{session.status === "in_progress" && (
  <section className="mt-12">

    <button
      onClick={() => setShowAccusation(true)}
      className="w-full bg-red-700 hover:bg-red-600 text-white rounded-xl py-4 font-semibold text-lg"
    >
      Make Final Accusation
    </button>

  </section>
)}


{showAccusation && (
  <section className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-500 uppercase tracking-wider">
          Final Decision
        </p>

        <h2 className="text-2xl font-semibold mt-1">
          Who committed the crime?
        </h2>
      </div>

      <button
        onClick={() => setShowAccusation(false)}
        className="text-slate-400 hover:text-white"
      >
        Cancel
      </button>

    </div>

    <div className="mt-6 space-y-6">

      {/* Suspect */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Culprit
        </label>

        <select
          value={accusation.suspectId}
          onChange={(e) =>
            setAccusation({
              ...accusation,
              suspectId: e.target.value,
            })
          }
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
        >
          <option value="">
            Select a suspect
          </option>

          {caseData.suspects.map((suspect: any) => (
            <option
              key={suspect.id}
              value={suspect.id}
            >
              {suspect.name}
            </option>
          ))}
        </select>
      </div>

      {/* Motive */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Motive
        </label>

        <input
          type="text"
          value={accusation.motive}
          onChange={(e) =>
            setAccusation({
              ...accusation,
              motive: e.target.value,
            })
          }
          placeholder="Why did they do it?"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
        />
      </div>

      {/* Method */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Method
        </label>

        <input
          type="text"
          value={accusation.method}
          onChange={(e) =>
            setAccusation({
              ...accusation,
              method: e.target.value,
            })
          }
          placeholder="How was the crime committed?"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
        />
      </div>

      {/* Reasoning */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Your Reasoning
        </label>

        <textarea
          value={accusation.reasoning}
          onChange={(e) =>
            setAccusation({
              ...accusation,
              reasoning: e.target.value,
            })
          }
          placeholder="Explain how the evidence led you to this conclusion..."
          rows={6}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 resize-none"
        />
      </div>

      <button
        onClick={handleSubmitAccusation}
        disabled={submittingAccusation}
        className="w-full bg-red-700 hover:bg-red-600 rounded-lg py-3 font-semibold disabled:opacity-50"
      >
        {submittingAccusation
          ? "Submitting..."
          : "Submit Final Accusation"}
      </button>

    </div>

  </section>
)}



{result && (
  <section className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">

    <p className="text-sm text-slate-500 uppercase tracking-wider">
      Investigation Complete
    </p>

    <h2 className="text-3xl font-bold mt-2">
      Your Result
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">

      <div className="bg-slate-800 rounded-lg p-4">
        <p className="text-slate-400 text-sm">
          Culprit
        </p>

        <p className="text-xl font-semibold mt-1">
          {result.correctCulprit
            ? "Correct"
            : "Incorrect"}
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <p className="text-slate-400 text-sm">
          Motive
        </p>

        <p className="text-xl font-semibold mt-1">
          {result.correctMotive
            ? "Correct"
            : "Incorrect"}
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <p className="text-slate-400 text-sm">
          Method
        </p>

        <p className="text-xl font-semibold mt-1">
          {result.correctMethod
            ? "Correct"
            : "Incorrect"}
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <p className="text-slate-400 text-sm">
          Score
        </p>

        <p className="text-3xl font-bold mt-1">
          {result.score}
        </p>
      </div>

    </div>

  </section>
)}

      </div>
    </main>
  );
}