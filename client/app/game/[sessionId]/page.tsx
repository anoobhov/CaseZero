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

  // async function handleInvestigate(locationId: string) {
  //   try {
  //     setInvestigating(locationId);
  //     setError("");

  //     await investigateLocation(sessionId, locationId);

  //     // Refresh session state
  //     await loadSession();

      
  //   } catch (error) {
  //     setError(
  //       error instanceof Error
  //         ? error.message
  //         : "Failed to investigate location"
  //     );
  //   } finally {
  //     setInvestigating(null);
  //   }
  // }


  async function handleInvestigate(locationId: string) {
  try {
    setInvestigating(locationId);
    setError("");

    const result = await investigateLocation(
      sessionId,
      locationId
    );

    setData((prev: any) => {
      if (!prev) return prev;

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


  // async function handleExamineEvidence(evidenceId: string) {
  // try {
  //   setExaminingEvidence(evidenceId);
  //   setError("");

  //   await discoverEvidence(sessionId, evidenceId);

  //   await loadSession();
  // } catch (error) {
  //   setError(
  //     error instanceof Error
  //       ? error.message
  //       : "Failed to examine evidence"
  //   );
  // } finally {
  //   setExaminingEvidence(null);
  // }
// }


async function handleExamineEvidence(evidenceId: string) {
  try {
    setExaminingEvidence(evidenceId);
    setError("");

    await discoverEvidence(
      sessionId,
      evidenceId
    );

    setData((prev: any) => {
      if (!prev) return prev;

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

// async function handleInterrogateSuspect(suspectId: string) {
//   try {
//     setInterrogatingSuspect(suspectId);
//     setError("");

//     const result = await interrogateSuspect(
//       sessionId,
//       suspectId
//     );

//     setSelectedSuspect(result.suspect);

//     await loadSession();
//   } catch (error) {
//     setError(
//       error instanceof Error
//         ? error.message
//         : "Failed to interrogate suspect"
//     );
//   } finally {
//     setInterrogatingSuspect(null);
//   }
// }
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

//   return (
//     <main className="min-h-screen bg-slate-950 text-white p-8">
//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div>
//           <p className="text-sm text-slate-500 uppercase tracking-wider">
//             CaseZero
//           </p>

//           <h1 className="text-4xl font-bold mt-2">
//             {caseData.title}
//           </h1>

//           <p className="mt-3 text-slate-400 max-w-3xl">
//             {caseData.description}
//           </p>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="mt-6 bg-red-950 border border-red-800 text-red-300 rounded-lg p-4">
//             {error}
//           </div>
//         )}

//         {/* Progress */}
//         <section className="mt-8 grid grid-cols-3 gap-4">

//           <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
//             <p className="text-slate-400 text-sm">
//               Locations Investigated
//             </p>

//             <p className="text-3xl font-bold mt-2">
//               {session.discoveredLocations.length}
//             </p>
//           </div>

//           <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
//             <p className="text-slate-400 text-sm">
//               Evidence Found
//             </p>

//             <p className="text-3xl font-bold mt-2">
//               {session.discoveredEvidence.length}
//             </p>
//           </div>

//           <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
//             <p className="text-slate-400 text-sm">
//               Suspects Interrogated
//             </p>

//             <p className="text-3xl font-bold mt-2">
//               {session.interrogatedSuspects.length}
//             </p>
//           </div>

//         </section>

//         {/* Locations */}
//         <section className="mt-10">

//           <h2 className="text-2xl font-semibold">
//             Locations
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

//             {caseData.locations.map((location: any) => {
//               const investigated =
//                 session.discoveredLocations.includes(location.id);

//               const isLoading =
//                 investigating === location.id;

//               return (
//                 <div
//                   key={location.id}
//                   className="bg-slate-900 border border-slate-800 rounded-xl p-5"
//                 >
//                   <div className="flex items-start justify-between gap-3">

//                     <h3 className="text-lg font-semibold">
//                       {location.name}
//                     </h3>

//                     {investigated && (
//                       <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
//                         Investigated
//                       </span>
//                     )}

//                   </div>

//                   <p className="text-slate-400 text-sm mt-3">
//                     {location.description}
//                   </p>

//                   <button
//                     onClick={() =>
//                       handleInvestigate(location.id)
//                     }
//                     disabled={investigated || isLoading}
//                     className="mt-5 w-full bg-white text-black rounded-lg py-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
//                   >
//                     {isLoading
//                       ? "Investigating..."
//                       : investigated
//                       ? "Investigated"
//                       : "Investigate"}
//                   </button>

//                 </div>
//               );
//             })}

//           </div>

//         </section>



//         {/* Evidence */}
// <section className="mt-12">

//   <h2 className="text-2xl font-semibold">
//     Evidence
//   </h2>

//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

//     {caseData.evidence
//       .filter((evidence: any) =>
//         session.discoveredLocations.includes(
//           evidence.locationId
//         )
//       )
//       .map((evidence: any) => {

//         const discovered =
//           session.discoveredEvidence.includes(
//             evidence.id
//           );

//         const isLoading =
//           examiningEvidence === evidence.id;

//         return (
//           <div
//             key={evidence.id}
//             className="bg-slate-900 border border-slate-800 rounded-xl p-5"
//           >

//             <div className="flex items-start justify-between gap-3">

//               <h3 className="text-lg font-semibold">
//                 {evidence.name}
//               </h3>

//               {discovered && (
//                 <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
//                   Discovered
//                 </span>
//               )}

//             </div>

//             <p className="text-sm text-slate-400 mt-3">
//               {evidence.description}
//             </p>

//             <button
//               onClick={() =>
//                 handleExamineEvidence(evidence.id)
//               }
//               disabled={discovered || isLoading}
//               className="mt-5 w-full bg-white text-black rounded-lg py-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               {isLoading
//                 ? "Examining..."
//                 : discovered
//                 ? "Evidence Examined"
//                 : "Examine Evidence"}
//             </button>

//           </div>
//         );
//       })}

//   </div>

//   {caseData.evidence.filter((evidence: any) =>
//     session.discoveredLocations.includes(
//       evidence.locationId
//     )
//   ).length === 0 && (
//     <p className="text-slate-500 mt-4">
//       No evidence discovered yet.
//     </p>
//   )}

// </section>

//         {/* Suspects */}
// <section className="mt-12">

//   <h2 className="text-2xl font-semibold">
//     Suspects
//   </h2>

//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

//     {caseData.suspects.map((suspect: any) => {
//       const interrogated =
//         session.interrogatedSuspects.includes(
//           suspect.id
//         );

//       const isLoading =
//         interrogatingSuspect === suspect.id;

//       return (
//         <div
//           key={suspect.id}
//           className="bg-slate-900 border border-slate-800 rounded-xl p-5"
//         >

//           <div className="flex items-start justify-between gap-3">

//             <h3 className="text-lg font-semibold">
//               {suspect.name}
//             </h3>

//             {interrogated && (
//               <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">
//                 Interrogated
//               </span>
//             )}

//           </div>

//           <p className="text-sm text-slate-400 mt-2">
//             {suspect.occupation}
//           </p>

//           <p className="text-sm text-slate-500 mt-1">
//             {suspect.relationshipToVictim}
//           </p>

//           <button
//             onClick={() =>
//               handleInterrogateSuspect(suspect.id)
//             }
//             disabled={isLoading}
//             className="mt-5 w-full bg-white text-black rounded-lg py-2 font-medium disabled:opacity-40"
//           >
//             {isLoading
//               ? "Interrogating..."
//               : interrogated
//               ? "Interrogate Again"
//               : "Interrogate"}
//           </button>

//         </div>
//       );
//     })}

//   </div>

// </section>


// {selectedSuspect && (
//   <section className="mt-10 bg-slate-900 border border-slate-800 rounded-xl p-6">

//     <div className="flex items-center justify-between">

//       <div>
//         <p className="text-sm text-slate-500 uppercase tracking-wider">
//           Interrogation
//         </p>

//         <h2 className="text-2xl font-semibold mt-1">
//           {selectedSuspect.name}
//         </h2>
//       </div>

//       <button
//         onClick={() => setSelectedSuspect(null)}
//         className="text-slate-400 hover:text-white"
//       >
//         Close
//       </button>

//     </div>

//     <div className="mt-6">

//       <h3 className="text-lg font-medium">
//         Statements
//       </h3>

//       <div className="mt-4 space-y-4">

//         {selectedSuspect.statements.map(
//           (statement: string, index: number) => (
//             <div
//               key={index}
//               className="border-l-2 border-slate-600 pl-4"
//             >
//               <p className="text-slate-300">
//                 "{statement}"
//               </p>
//             </div>
//           )
//         )}

//       </div>

//     </div>

//   </section>
// )}

// {/* accuse button */}
// {session.status === "in_progress" && (
//   <section className="mt-12">

//     <button
//       onClick={() => setShowAccusation(true)}
//       className="w-full bg-red-700 hover:bg-red-600 text-white rounded-xl py-4 font-semibold text-lg"
//     >
//       Make Final Accusation
//     </button>

//   </section>
// )}


// {showAccusation && (
//   <section className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">

//     <div className="flex items-center justify-between">

//       <div>
//         <p className="text-sm text-slate-500 uppercase tracking-wider">
//           Final Decision
//         </p>

//         <h2 className="text-2xl font-semibold mt-1">
//           Who committed the crime?
//         </h2>
//       </div>

//       <button
//         onClick={() => setShowAccusation(false)}
//         className="text-slate-400 hover:text-white"
//       >
//         Cancel
//       </button>

//     </div>

//     <div className="mt-6 space-y-6">

//       {/* Suspect */}
//       <div>
//         <label className="block text-sm text-slate-400 mb-2">
//           Culprit
//         </label>

//         <select
//           value={accusation.suspectId}
//           onChange={(e) =>
//             setAccusation({
//               ...accusation,
//               suspectId: e.target.value,
//             })
//           }
//           className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
//         >
//           <option value="">
//             Select a suspect
//           </option>

//           {caseData.suspects.map((suspect: any) => (
//             <option
//               key={suspect.id}
//               value={suspect.id}
//             >
//               {suspect.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Motive */}
//       <div>
//         <label className="block text-sm text-slate-400 mb-2">
//           Motive
//         </label>

//         <input
//           type="text"
//           value={accusation.motive}
//           onChange={(e) =>
//             setAccusation({
//               ...accusation,
//               motive: e.target.value,
//             })
//           }
//           placeholder="Why did they do it?"
//           className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
//         />
//       </div>

//       {/* Method */}
//       <div>
//         <label className="block text-sm text-slate-400 mb-2">
//           Method
//         </label>

//         <input
//           type="text"
//           value={accusation.method}
//           onChange={(e) =>
//             setAccusation({
//               ...accusation,
//               method: e.target.value,
//             })
//           }
//           placeholder="How was the crime committed?"
//           className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3"
//         />
//       </div>

//       {/* Reasoning */}
//       <div>
//         <label className="block text-sm text-slate-400 mb-2">
//           Your Reasoning
//         </label>

//         <textarea
//           value={accusation.reasoning}
//           onChange={(e) =>
//             setAccusation({
//               ...accusation,
//               reasoning: e.target.value,
//             })
//           }
//           placeholder="Explain how the evidence led you to this conclusion..."
//           rows={6}
//           className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 resize-none"
//         />
//       </div>

//       <button
//         onClick={handleSubmitAccusation}
//         disabled={submittingAccusation}
//         className="w-full bg-red-700 hover:bg-red-600 rounded-lg py-3 font-semibold disabled:opacity-50"
//       >
//         {submittingAccusation
//           ? "Submitting..."
//           : "Submit Final Accusation"}
//       </button>

//     </div>

//   </section>
// )}


// {/* result */}
// {result && (
//   <section className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">

//     <p className="text-sm text-slate-500 uppercase tracking-wider">
//       Investigation Complete
//     </p>

//     <h2 className="text-3xl font-bold mt-2">
//       Your Result
//     </h2>

//     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">

//       <div className="bg-slate-800 rounded-lg p-4">
//         <p className="text-slate-400 text-sm">
//           Culprit
//         </p>

//         <p className="text-xl font-semibold mt-1">
//           {result.correctCulprit
//             ? "Correct"
//             : "Incorrect"}
//         </p>
//       </div>

//       <div className="bg-slate-800 rounded-lg p-4">
//         <p className="text-slate-400 text-sm">
//           Motive
//         </p>

//         <p className="text-xl font-semibold mt-1">
//           {result.correctMotive
//             ? "Correct"
//             : "Incorrect"}
//         </p>
//       </div>

//       <div className="bg-slate-800 rounded-lg p-4">
//         <p className="text-slate-400 text-sm">
//           Method
//         </p>

//         <p className="text-xl font-semibold mt-1">
//           {result.correctMethod
//             ? "Correct"
//             : "Incorrect"}
//         </p>
//       </div>

//       <div className="bg-slate-800 rounded-lg p-4">
//         <p className="text-slate-400 text-sm">
//           Score
//         </p>

//         <p className="text-3xl font-bold mt-1">
//           {result.score}
//         </p>
//       </div>

//     </div>

//   </section>
// )}

//       </div>
//     </main>
//   );


return (
  <main className="min-h-screen bg-[#08090b] text-white">

    {/* Header */}
    <header className="border-b border-white/10 bg-[#0d0f12]">

      <div className="max-w-[1600px] mx-auto px-6 py-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs tracking-[0.25em] text-slate-500 uppercase">
              CaseZero Investigation
            </p>

            <h1 className="text-2xl font-bold mt-1">
              {caseData.title}
            </h1>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">
              INVESTIGATION STATUS
            </p>

            <p className="text-sm text-emerald-400 mt-1">
              {session.status === "in_progress"
                ? "ACTIVE"
                : "COMPLETED"}
            </p>
          </div>

        </div>

        <p className="text-sm text-slate-400 mt-3 max-w-4xl">
          {caseData.description}
        </p>

      </div>

    </header>


    {/* Main Investigation Interface */}
    <div className="max-w-[1600px] mx-auto p-6">

      <div className="grid grid-cols-12 gap-5 min-h-[calc(100vh-180px)]">


        {/* LEFT SIDEBAR */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2">

          <div className="bg-[#0d0f12] border border-white/10 rounded-xl overflow-hidden">

            <div className="px-5 py-4 border-b border-white/10">

              <p className="text-xs tracking-widest text-slate-500">
                LOCATIONS
              </p>

            </div>


            <div className="p-3 space-y-1">

              {caseData.locations.map((location: any) => {

                const investigated =
                  session.discoveredLocations.includes(
                    location.id
                  );

                return (
                  <button
                    key={location.id}
                    onClick={() =>
                      handleInvestigate(location.id)
                    }
                    className={`
                      w-full text-left rounded-lg px-4 py-3
                      transition
                      ${
                        investigated
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "text-slate-300 hover:bg-white/5"
                      }
                    `}
                  >

                    <div className="flex items-center gap-3">

                      <span
                        className={`
                          w-2 h-2 rounded-full
                          ${
                            investigated
                              ? "bg-emerald-400"
                              : "bg-slate-600"
                          }
                        `}
                      />

                      <span className="text-sm">
                        {location.name}
                      </span>

                    </div>

                  </button>
                );
              })}

            </div>

          </div>


          {/* Suspects */}
          <div className="bg-[#0d0f12] border border-white/10 rounded-xl overflow-hidden mt-5">

            <div className="px-5 py-4 border-b border-white/10">

              <p className="text-xs tracking-widest text-slate-500">
                SUSPECTS
              </p>

            </div>

            <div className="p-3 space-y-1">

              {caseData.suspects.map((suspect: any) => {

                const interrogated =
                  session.interrogatedSuspects.includes(
                    suspect.id
                  );

                return (
                  <button
                    key={suspect.id}
                    onClick={() =>
                      handleInterrogateSuspect(
                        suspect.id
                      )
                    }
                    className={`
                      w-full text-left rounded-lg px-4 py-3
                      transition
                      ${
                        interrogated
                          ? "bg-amber-500/10 text-amber-300"
                          : "text-slate-300 hover:bg-white/5"
                      }
                    `}
                  >

                    <div className="flex items-center gap-3">

                      <span
                        className={`
                          w-2 h-2 rounded-full
                          ${
                            interrogated
                              ? "bg-amber-400"
                              : "bg-slate-600"
                          }
                        `}
                      />

                      <span className="text-sm">
                        {suspect.name}
                      </span>

                    </div>

                  </button>
                );
              })}

            </div>

          </div>

        </aside>


        {/* CENTER */}
        <section className="col-span-12 lg:col-span-6 xl:col-span-7">

          <div className="bg-[#0d0f12] border border-white/10 rounded-xl min-h-full">

            <div className="px-6 py-5 border-b border-white/10">

              <p className="text-xs tracking-widest text-slate-500">
                INVESTIGATION
              </p>

              <h2 className="text-xl font-semibold mt-1">
                Evidence & Findings
              </h2>

            </div>


            <div className="p-6">

              {/* Evidence */}
              <div>

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold">
                    Evidence
                  </h3>

                  <span className="text-xs text-slate-500">
                    {session.discoveredEvidence.length} discovered
                  </span>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

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
                          className="border border-white/10 bg-black/20 rounded-lg p-4"
                        >

                          <div className="flex justify-between gap-3">

                            <h4 className="font-medium">
                              {evidence.name}
                            </h4>

                            {discovered && (
                              <span className="text-[10px] uppercase tracking-wider text-emerald-400">
                                Found
                              </span>
                            )}

                          </div>

                          <p className="text-sm text-slate-500 mt-2">
                            {evidence.description}
                          </p>

                          <button
                            onClick={() =>
                              handleExamineEvidence(
                                evidence.id
                              )
                            }
                            disabled={
                              discovered || isLoading
                            }
                            className="mt-4 text-xs border border-white/10 rounded-md px-3 py-2 hover:bg-white/5 disabled:opacity-30"
                          >
                            {isLoading
                              ? "Examining..."
                              : discovered
                              ? "Examined"
                              : "Examine"}
                          </button>

                        </div>
                      );
                    })}

                </div>

              </div>


              {/* Interrogation */}
              {selectedSuspect && (
                <div className="mt-10 pt-8 border-t border-white/10">

                  <div className="flex justify-between">

                    <div>

                      <p className="text-xs tracking-widest text-slate-500">
                        INTERROGATION
                      </p>

                      <h3 className="text-xl font-semibold mt-1">
                        {selectedSuspect.name}
                      </h3>

                    </div>

                    <button
                      onClick={() =>
                        setSelectedSuspect(null)
                      }
                      className="text-slate-500 hover:text-white"
                    >
                      Close
                    </button>

                  </div>


                  <div className="mt-6 space-y-4">

                    {selectedSuspect.statements.map(
                      (
                        statement: string,
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="border-l-2 border-amber-500/40 pl-4"
                        >

                          <p className="text-slate-300 leading-relaxed">
                            "{statement}"
                          </p>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>

        </section>


        {/* RIGHT SIDEBAR */}
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


              {/* Evidence count */}

              <div>

                <p className="text-xs text-slate-500">
                  EVIDENCE
                </p>

                <p className="text-2xl font-semibold mt-1">
                  {session.discoveredEvidence.length}
                </p>

              </div>


              {/* Suspect count */}

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

    {showAccusation && (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">

    <div className="w-full max-w-2xl bg-[#0d0f12] border border-white/10 rounded-xl">

      {/* Header */}
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
          onClick={() => setShowAccusation(false)}
          className="text-slate-500 hover:text-white text-xl"
        >
          ×
        </button>

      </div>

      {/* Form */}
      <div className="p-6 space-y-5">

        {/* Suspect */}
        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Who is the culprit?
          </label>

          <select
            value={accusation.suspectId}
            onChange={(e) =>
              setAccusation((prev) => ({
                ...prev,
                suspectId: e.target.value,
              }))
            }
            className="w-full bg-[#15181d] border border-white/10 rounded-lg px-4 py-3 text-white"
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
            What was the motive?
          </label>

          <input
            type="text"
            value={accusation.motive}
            onChange={(e) =>
              setAccusation((prev) => ({
                ...prev,
                motive: e.target.value,
              }))
            }
            placeholder="Why did they commit the crime?"
            className="w-full bg-[#15181d] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600"
          />

        </div>

        {/* Method */}
        <div>

          <label className="block text-sm text-slate-400 mb-2">
            How was the crime committed?
          </label>

          <input
            type="text"
            value={accusation.method}
            onChange={(e) =>
              setAccusation((prev) => ({
                ...prev,
                method: e.target.value,
              }))
            }
            placeholder="Describe the method..."
            className="w-full bg-[#15181d] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600"
          />

        </div>

        {/* Reasoning */}
        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Explain your reasoning
          </label>

          <textarea
            value={accusation.reasoning}
            onChange={(e) =>
              setAccusation((prev) => ({
                ...prev,
                reasoning: e.target.value,
              }))
            }
            placeholder="Explain how the evidence and statements led you to this conclusion..."
            rows={6}
            className="w-full bg-[#15181d] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 resize-none"
          />

          <p className="text-xs text-slate-600 mt-2">
            Explain the chain of evidence that supports your accusation.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-900 rounded-lg p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Submit */}
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


{result && (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">

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