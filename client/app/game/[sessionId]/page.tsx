
"use client";
import ThemeToggle from "@/components/ThemeToggle";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Fingerprint,
  MapPin,
  Search,
  ShieldAlert,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  getSession,
  investigateLocation,
  discoverEvidence,
  interrogateSuspect,
  submitAccusation,
} from "@/lib/api";

type AnyRecord = Record<string, any>;

type Accusation = {
  suspectId: string;
  motive: string;
  method: string;
  reasoning: string;
};

const EMPTY_ACCUSATION: Accusation = {
  suspectId: "",
  motive: "",
  method: "",
  reasoning: "",
};

const panel =
  "rounded-2xl border border-white/[0.09] bg-[#101216] shadow-[0_12px_40px_rgba(0,0,0,0.12)]";

const label =
  "text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500";

const field =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#090b0e] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function Stat({
  label: statLabel,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <p className={label}>{statLabel}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">
        {value}
      </p>
      {detail && (
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      )}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className={label}>{eyebrow}</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-100">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const sessionId = params.sessionId as string;
  const isReviewMode = searchParams.get("mode") === "review";

  const [data, setData] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"investigation" | "timeline">(
    "investigation"
  );

  const [investigating, setInvestigating] = useState<string | null>(null);
  const [examiningEvidence, setExaminingEvidence] = useState<string | null>(
    null
  );
  const [interrogatingSuspect, setInterrogatingSuspect] = useState<
    string | null
  >(null);

  const [selectedLocation, setSelectedLocation] = useState<AnyRecord | null>(
    null
  );
  const [selectedSuspect, setSelectedSuspect] = useState<AnyRecord | null>(
    null
  );

  const [showAccusation, setShowAccusation] = useState(false);
  const [accusation, setAccusation] =
    useState<Accusation>(EMPTY_ACCUSATION);
  const [submittingAccusation, setSubmittingAccusation] = useState(false);
  const [result, setResult] = useState<AnyRecord | null>(null);

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSession(sessionId);
      setData(response);

      if (response.session?.accusation) {
        setAccusation({
          suspectId: response.session.accusation.suspectId ?? "",
          motive: response.session.accusation.motive ?? "",
          method: response.session.accusation.method ?? "",
          reasoning: response.session.accusation.reasoning ?? "",
        });
      }

      if (response.session?.result) {
        setResult(response.session.result);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load investigation."));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) void loadSession();
  }, [sessionId, loadSession]);

  const session = data?.session;
  const caseData = data?.case;

  const discoveredLocationIds = useMemo(
    () => new Set(session?.discoveredLocations ?? []),
    [session?.discoveredLocations]
  );

  const discoveredEvidenceIds = useMemo(
    () => new Set(session?.discoveredEvidence ?? []),
    [session?.discoveredEvidence]
  );

  const interrogatedSuspectIds = useMemo(
    () => new Set(session?.interrogatedSuspects ?? []),
    [session?.interrogatedSuspects]
  );

  const locationMap = useMemo(
    () =>
      new Map<string, AnyRecord>(
        (caseData?.locations ?? []).map((item: AnyRecord) => [
          item.id,
          item,
        ])
      ),
    [caseData?.locations]
  );

  const suspectMap = useMemo(
    () =>
      new Map<string, AnyRecord>(
        (caseData?.suspects ?? []).map((item: AnyRecord) => [
          item.id,
          item,
        ])
      ),
    [caseData?.suspects]
  );

  const visibleEvidence = useMemo(
    () =>
      (caseData?.evidence ?? []).filter((item: AnyRecord) =>
        discoveredLocationIds.has(item.locationId)
      ),
    [caseData?.evidence, discoveredLocationIds]
  );

  const locationEvidence = useMemo(
    () =>
      selectedLocation
        ? (caseData?.evidence ?? []).filter(
            (item: AnyRecord) =>
              item.locationId === selectedLocation.id
          )
        : [],
    [caseData?.evidence, selectedLocation]
  );

  const discoveredLocationCount = discoveredLocationIds.size;
  const discoveredEvidenceCount = discoveredEvidenceIds.size;
  const interrogatedSuspectCount = interrogatedSuspectIds.size;

  const locations = caseData?.locations ?? [];
  const evidence = caseData?.evidence ?? [];
  const suspects = caseData?.suspects ?? [];
  const timelineEvents = caseData?.timeline ?? [];

  const totalItems = locations.length + evidence.length + suspects.length;
  const completedItems =
    discoveredLocationCount +
    discoveredEvidenceCount +
    interrogatedSuspectCount;

  const progress =
    totalItems === 0
      ? 0
      : Math.min(100, Math.round((completedItems / totalItems) * 100));

  const isCompleted = session?.status === "completed";
  const isReadOnly = isReviewMode || isCompleted;

  const victim = caseData?.victim ?? {};
  const crime = caseData?.crime ?? {};

  const victimName = victim.name || "Identity not recorded";
  const crimeLocation =
    crime.location ||
    "Location not specified in the case file";

  const crimeDate = crime.date || "Date not recorded";
  const crimeTime = crime.time || "Time not recorded";

  const initialFindings =
    crime.description ||
    caseData?.description ||
    "No initial findings have been recorded in the case file.";

  async function handleInvestigate(locationId: string) {
    if (isReadOnly || !session) return;

    const location = locationMap.get(locationId);
    if (!location) return;

    if (discoveredLocationIds.has(locationId)) {
      setSelectedLocation(location);
      return;
    }

    try {
      setInvestigating(locationId);
      setError("");

      await investigateLocation(sessionId, locationId);

      setData((prev: AnyRecord | null) => {
        if (!prev) return prev;

        const current = prev.session.discoveredLocations ?? [];
        if (current.includes(locationId)) return prev;

        return {
          ...prev,
          session: {
            ...prev.session,
            discoveredLocations: [...current, locationId],
          },
        };
      });

      setSelectedLocation(location);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to investigate location."));
    } finally {
      setInvestigating(null);
    }
  }

  async function handleExamineEvidence(evidenceId: string) {
    if (isReadOnly || !session) return;
    if (discoveredEvidenceIds.has(evidenceId)) return;

    try {
      setExaminingEvidence(evidenceId);
      setError("");

      await discoverEvidence(sessionId, evidenceId);

      setData((prev: AnyRecord | null) => {
        if (!prev) return prev;

        const current = prev.session.discoveredEvidence ?? [];
        if (current.includes(evidenceId)) return prev;

        return {
          ...prev,
          session: {
            ...prev.session,
            discoveredEvidence: [...current, evidenceId],
          },
        };
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to examine evidence."));
    } finally {
      setExaminingEvidence(null);
    }
  }

  async function handleInterrogateSuspect(suspectId: string) {
    if (isReadOnly || !session) return;

    try {
      setInterrogatingSuspect(suspectId);
      setError("");

      const response = await interrogateSuspect(sessionId, suspectId);
      setSelectedSuspect(response.suspect);

      setData((prev: AnyRecord | null) => {
        if (!prev) return prev;

        const current = prev.session.interrogatedSuspects ?? [];
        if (current.includes(suspectId)) return prev;

        return {
          ...prev,
          session: {
            ...prev.session,
            interrogatedSuspects: [...current, suspectId],
          },
        };
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to interrogate suspect."));
    } finally {
      setInterrogatingSuspect(null);
    }
  }

  async function handleSubmitAccusation() {
    if (isReadOnly) return;

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

      const response = await submitAccusation(sessionId, accusation);
      setResult(response.result);

      setData((prev: AnyRecord | null) => {
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
    } catch (err) {
      setError(getErrorMessage(err, "Failed to submit accusation."));
    } finally {
      setSubmittingAccusation(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090a0d] text-slate-200">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
          <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-slate-500">
            Opening case file
          </p>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090a0d] p-6 text-slate-200">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#101216] p-7 text-center">
          <ShieldAlert className="mx-auto text-red-400" size={30} />
          <h1 className="mt-4 text-lg font-semibold">Unable to open case</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <button
            onClick={() => void loadSession()}
            className="mt-6 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!data || !session || !caseData) return null;

  const evaluatedResult = session.result ?? result;
  const finalScore = Number(evaluatedResult?.score ?? 0);

  return (
    <main className="casezero-game min-h-screen bg-[#090a0d] text-slate-200 selection:bg-emerald-500/25">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#0c0e12]">
        <div className="mx-auto max-w-[1700px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                <span className="font-bold text-emerald-400">CaseZero</span>
                <span className="text-slate-700">/</span>
                <span className="text-slate-500">
                  {isReviewMode ? "Case archive" : "Investigation room"}
                </span>
                <span
                  className={`ml-1 rounded-full border px-2.5 py-1 ${
                    isCompleted
                      ? "border-slate-600/30 bg-white/[0.03] text-slate-400"
                      : "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400"
                  }`}
                >
                  {isCompleted ? "Closed case" : "Active investigation"}
                </span>
              </div>

              <h1 className="mt-3 truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {caseData.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {caseData.description}
              </p>
            </div>
              
<div className="flex flex-col gap-4 xl:flex-row xl:items-center">
  <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:min-w-[390px]">
    <Stat label="Locations" value={locations.length} />
    <Stat label="Suspects" value={suspects.length} />
    <Stat label="Evidence" value={evidence.length} />
  </div>

  <div className="flex justify-end xl:ml-auto">
    <ThemeToggle />
  </div>
</div>

          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1700px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-300/70 hover:text-red-200"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Case briefing */}
        
<section className={`${panel} mb-5 overflow-hidden`}>
  <div className="grid lg:grid-cols-[0.8fr_1.8fr]">
    {/* Victim */}
    <div className="border-b border-white/[0.07] bg-gradient-to-br from-red-950/20 to-transparent p-4 sm:p-5 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2">
        <div className="rounded-lg border border-red-400/20 bg-red-400/[0.08] p-2 text-red-300">
          <Fingerprint size={15} />
        </div>
        <p className={label}>Case briefing</p>
      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-300/80">
        Deceased
      </p>

      <h2 className="mt-1 text-xl font-semibold text-white">
        {victimName}
      </h2>

      {victim.description && (
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {victim.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {victim.age != null && (
          <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-400">
            Age {victim.age}
          </span>
        )}

        {victim.occupation && (
          <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-400">
            {victim.occupation}
          </span>
        )}

        {crime.type && (
          <span className="rounded-md border border-red-500/15 bg-red-500/[0.05] px-2 py-1 text-[10px] text-red-300">
            {crime.type}
          </span>
        )}
      </div>
    </div>

    {/* Incident details */}
    <div className="p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-3">
          <MapPin size={15} className="mt-0.5 shrink-0 text-emerald-400" />
          <div className="min-w-0">
            <p className={label}>Found at</p>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-200">
              {crimeLocation}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-3">
          <Clock3 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
          <div className="min-w-0">
            <p className={label}>Date & time</p>
            <p className="mt-1 text-xs font-medium text-slate-200">
              {crimeDate}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {crimeTime}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/10 p-3">
        <p className={label}>Initial findings</p>
        <p className="mt-1.5 whitespace-pre-wrap text-xs leading-6 text-slate-300">
          {initialFindings}
        </p>
      </div>
    </div>
  </div>
</section>


        {/* Overall progress */}
        <section className={`${panel} mb-6 p-4 sm:p-5`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={label}>Investigation progress</p>
              <p className="mt-1 text-sm text-slate-400">
                {completedItems} of {totalItems} investigation actions completed
              </p>
            </div>
            <div className="w-full sm:max-w-xs">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-500">Case coverage</span>
                <span className="font-semibold text-emerald-400">
                  {progress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main layout */}
        <div className="grid items-start gap-5 xl:grid-cols-[250px_minmax(0,1fr)_285px]">
          {/* Left sidebar */}
          <aside className="space-y-5">
            <section className={`${panel} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-emerald-400" />
                  <h2 className={label}>Locations</h2>
                </div>
                <span className="text-[11px] text-slate-500">
                  {discoveredLocationCount}/{locations.length}
                </span>
              </div>

              <div className="space-y-1 p-2">
                {locations.map((location: AnyRecord) => {
                  const discovered = discoveredLocationIds.has(location.id);
                  const busy = investigating === location.id;

                  return (
                    <button
                      key={location.id}
                      onClick={() => void handleInvestigate(location.id)}
                      disabled={busy || isReadOnly}
                      className={`group w-full rounded-xl border px-3 py-3 text-left transition ${
                        discovered
                          ? "border-emerald-500/15 bg-emerald-500/[0.05]"
                          : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.025]"
                      } disabled:cursor-default`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            discovered ? "bg-emerald-400" : "bg-slate-700"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-slate-200">
                            {location.name}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {busy
                              ? "Investigating..."
                              : discovered
                                ? "Scene examined"
                                : isReadOnly
                                  ? "Not investigated"
                                  : "Unexplored scene"}
                          </p>
                        </div>
                        {discovered && (
                          <Check size={13} className="text-emerald-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={`${panel} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-amber-400" />
                  <h2 className={label}>Suspects</h2>
                </div>
                <span className="text-[11px] text-slate-500">
                  {interrogatedSuspectCount}/{suspects.length}
                </span>
              </div>

              <div className="space-y-1 p-2">
                {suspects.map((suspect: AnyRecord) => {
                  const interrogated = interrogatedSuspectIds.has(suspect.id);
                  const busy = interrogatingSuspect === suspect.id;

                  return (
                    <button
                      key={suspect.id}
                      onClick={() => void handleInterrogateSuspect(suspect.id)}
                      disabled={busy || isReadOnly}
                      className={`group w-full rounded-xl border px-3 py-3 text-left transition ${
                        interrogated
                          ? "border-amber-500/15 bg-amber-500/[0.05]"
                          : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.025]"
                      } disabled:cursor-default`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            interrogated ? "bg-amber-400" : "bg-slate-700"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-slate-200">
                            {suspect.name}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-slate-500">
                            {busy
                              ? "Interrogating..."
                              : interrogated
                                ? "Interview recorded"
                                : suspect.occupation || "Suspect"}
                          </p>
                        </div>
                        {interrogated && (
                          <Check size={13} className="text-amber-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          {/* Center: tabs */}
          <section className={`${panel} min-w-0 overflow-hidden`}>
            <div className="border-b border-white/[0.07] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className={label}>Detective workspace</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {activeTab === "investigation"
                      ? "Evidence & findings"
                      : "Case timeline"}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {activeTab === "investigation"
                      ? "Review discovered clues and examine evidence at each scene."
                      : "Follow the recorded sequence of events surrounding the incident."}
                  </p>
                </div>
                <span className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-slate-400">
                  {activeTab === "investigation"
                    ? `${discoveredEvidenceCount}/${evidence.length} clues found`
                    : `${timelineEvents.length} recorded events`}
                </span>
              </div>

              <div className="mt-5 flex gap-1 rounded-xl border border-white/[0.07] bg-black/20 p-1">
                <button
                  onClick={() => setActiveTab("investigation")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-xs font-medium transition ${
                    activeTab === "investigation"
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Search size={15} />
                  Investigation
                </button>
                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-xs font-medium transition ${
                    activeTab === "timeline"
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Clock3 size={15} />
                  Timeline
                </button>
              </div>
            </div>

            {/* Investigation tab */}
            {activeTab === "investigation" && (
              <div className="p-4 sm:p-5">
                {visibleEvidence.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/[0.12] px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-slate-500">
                      <Fingerprint size={22} />
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-slate-300">
                      No evidence uncovered
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500">
                      Investigate a location from the left panel to inspect its
                      scene and reveal associated evidence.
                    </p>
                    <button
                      onClick={() => {
                        const firstUnexplored = locations.find(
                          (location: AnyRecord) =>
                            !discoveredLocationIds.has(location.id)
                        );
                        if (firstUnexplored) {
                          void handleInvestigate(firstUnexplored.id);
                        }
                      }}
                      disabled={
                        isReadOnly ||
                        !locations.some(
                          (location: AnyRecord) =>
                            !discoveredLocationIds.has(location.id)
                        )
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2.5 text-xs text-emerald-300 transition hover:bg-emerald-500/[0.1] disabled:opacity-40"
                    >
                      Investigate a scene <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {visibleEvidence.map(
                      (item: AnyRecord, index: number) => {
                        const discovered = discoveredEvidenceIds.has(item.id);
                        const location = locationMap.get(item.locationId);

                        return (
                          <article
                            key={item.id}
                            className={`rounded-xl border p-4 transition ${
                              discovered
                                ? "border-emerald-500/15 bg-emerald-500/[0.035]"
                                : "border-white/[0.08] bg-white/[0.015]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/20 text-slate-400">
                                  <Fingerprint size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className={label}>
                                    Evidence {String(index + 1).padStart(2, "0")}
                                  </p>
                                  <h3 className="mt-1.5 text-sm font-medium text-slate-200">
                                    {item.name}
                                  </h3>
                                </div>
                              </div>
                              {discovered && (
                                <span className="shrink-0 rounded-md border border-emerald-500/15 bg-emerald-500/[0.07] px-2 py-1 text-[9px] uppercase tracking-wider text-emerald-400">
                                  Found
                                </span>
                              )}
                            </div>

                            <p className="mt-4 text-xs leading-6 text-slate-400">
                              {item.description}
                            </p>

                            {location && (
                              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500">
                                <MapPin size={12} />
                                {location.name}
                              </p>
                            )}

                            <button
                              onClick={() => void handleExamineEvidence(item.id)}
                              disabled={
                                discovered ||
                                examiningEvidence === item.id ||
                                isReadOnly
                              }
                              className={`mt-4 w-full rounded-lg border px-3 py-2.5 text-xs transition ${
                                discovered
                                  ? "border-emerald-500/10 text-emerald-400/70"
                                  : "border-white/[0.09] text-slate-300 hover:bg-white/[0.04]"
                              } disabled:cursor-default`}
                            >
                              {examiningEvidence === item.id
                                ? "Examining evidence..."
                                : discovered
                                  ? "Evidence examined"
                                  : isReadOnly
                                    ? "Not examined in this session"
                                    : "Examine evidence"}
                            </button>
                          </article>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Timeline tab */}
            {activeTab === "timeline" && (
              <div className="p-5 sm:p-7">
                <div className="mb-6 rounded-xl border border-white/[0.07] bg-black/15 p-4">
                  <div className="flex items-center gap-2">
                    <Clock3 size={16} className="text-emerald-400" />
                    <p className={label}>Chronological record</p>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Events are shown in the order stored in the generated case.
                    Compare the recorded times with alibis and physical evidence
                    as you investigate.
                  </p>
                </div>

                {timelineEvents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.1] py-12 text-center">
                    <Clock3 className="mx-auto text-slate-600" size={25} />
                    <p className="mt-4 text-sm text-slate-400">
                      No timeline events recorded
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      This case does not contain any timeline entries.
                    </p>
                  </div>
                ) : (
                  <div className="relative ml-2 space-y-0">
                    <div className="absolute bottom-5 left-[11px] top-5 w-px bg-gradient-to-b from-emerald-500/40 via-white/10 to-transparent" />

                    {timelineEvents.map(
                      (event: AnyRecord, index: number) => {
                        const actor =
                          event.actorId === "victim"
                            ? victim.name
                            : suspectMap.get(event.actorId)?.name ??
                              event.actorId ??
                              "Unknown actor";

                        const eventLocation = locationMap.get(
                          event.locationId
                        );

                        return (
                          <article
                            key={event.id ?? `${event.time}-${index}`}
                            className="relative pb-6 pl-9 last:pb-0"
                          >
                            <span className="absolute left-0 top-1 flex h-[23px] w-[23px] items-center justify-center rounded-full border border-emerald-500/25 bg-[#101216]">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            </span>

                            <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-4 transition hover:border-white/[0.12] sm:p-5">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-emerald-300">
                                  <Clock3 size={12} />
                                  {event.time || "Time not recorded"}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-slate-600">
                                  Event {String(index + 1).padStart(2, "0")}
                                </span>
                              </div>

                              <p className="mt-4 text-sm leading-7 text-slate-300">
                                {event.description ||
                                  "No description recorded for this event."}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {event.actorId && (
                                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-black/20 px-2.5 py-1.5 text-[10px] text-slate-400">
                                    <UserRound size={12} />
                                    {actor}
                                  </span>
                                )}
                                {eventLocation && (
                                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-black/20 px-2.5 py-1.5 text-[10px] text-slate-400">
                                    <MapPin size={12} />
                                    {eventLocation.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Right sidebar */}
          <aside className="space-y-5">
            <section className={`${panel} overflow-hidden`}>
              <div className="border-b border-white/[0.07] p-5">
                <p className={label}>Case control</p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Investigation status
                </h2>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Overall progress</span>
                    <span className="font-medium text-emerald-400">
                      {progress}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Stat
                    label="Scenes"
                    value={`${discoveredLocationCount}/${locations.length}`}
                  />
                  <Stat
                    label="Clues"
                    value={`${discoveredEvidenceCount}/${evidence.length}`}
                  />
                  <Stat
                    label="Interviews"
                    value={`${interrogatedSuspectCount}/${suspects.length}`}
                  />
                  <Stat
                    label="Case status"
                    value={isCompleted ? "Closed" : "Open"}
                  />
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <p className={label}>Investigator notes</p>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Compare the timeline, interview statements, and discovered
                    evidence before deciding who is responsible.
                  </p>
                </div>

                {isReviewMode && isCompleted ? (
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <p className="mt-2 text-sm font-medium text-emerald-300">
                      Archived investigation
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      This session is read-only. Your original decision and
                      evaluation are available below.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setError("");
                      setAccusation({
                        suspectId: accusation.suspectId || "",
                        motive: accusation.motive || "",
                        method: accusation.method || "",
                        reasoning: accusation.reasoning || "",
                      });
                      setShowAccusation(true);
                    }}
                    disabled={isCompleted}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShieldAlert size={15} />
                    {isCompleted ? "Accusation submitted" : "Make accusation"}
                  </button>
                )}
              </div>
            </section>

            <section className={`${panel} p-5`}>
              <p className={label}>Case reference</p>
              <p className="mt-3 break-all font-mono text-[11px] leading-5 text-slate-500">
                {sessionId}
              </p>
              <div className="mt-4 border-t border-white/[0.07] pt-4">
                <p className={label}>Difficulty</p>
                <p className="mt-2 text-sm capitalize text-slate-300">
                  {caseData.difficulty || "Not specified"}
                </p>
              </div>
            </section>
          </aside>
        </div>

        {/* Completed investigation review */}
        {isReviewMode && isCompleted && (
          <section className={`${panel} mt-6 p-5 sm:p-7`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className={label}>Case archive</p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Investigation review
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your submitted accusation and evaluation are shown below.
                </p>
              </div>
              <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-wider text-emerald-400">
                Completed
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-black/15 p-6 text-center">
              <p className={label}>Final score</p>
              <p className="mt-3 text-5xl font-semibold text-white">
                {finalScore}
              </p>
              <p className="mt-1 text-xs text-slate-500">out of 100</p>
              <div className="mx-auto mt-5 h-2 max-w-md overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{
                    width: `${Math.min(100, Math.max(0, finalScore))}%`,
                  }}
                />
              </div>
            </div>

            <h3 className="mb-4 mt-7 text-sm font-semibold text-slate-200">
              Submitted accusation
            </h3>

            {session.accusation ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-4 md:col-span-2">
                  <p className={label}>Accused suspect</p>
                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {suspectMap.get(session.accusation.suspectId)?.name ??
                      session.accusation.suspectId ??
                      "Not recorded"}
                  </p>
                </div>

                {[
                  { title: "Motive", value: session.accusation.motive },
                  { title: "Method", value: session.accusation.method },
                  {
                    title: "Reasoning",
                    value: session.accusation.reasoning,
                    full: true,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-xl border border-white/[0.07] bg-white/[0.015] p-4 ${
                      item.full ? "md:col-span-2" : ""
                    }`}
                  >
                    <p className={label}>{item.title}</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {item.value || "Not provided"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-sm text-amber-300">
                No submitted accusation was saved for this session.
              </p>
            )}

            {evaluatedResult && (
              <div className="mt-7">
                <h3 className="mb-4 text-sm font-semibold text-slate-200">
                  Evaluation breakdown
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Culprit",
                      correct: evaluatedResult.correctCulprit,
                    },
                    {
                      label: "Motive",
                      correct: evaluatedResult.correctMotive,
                    },
                    {
                      label: "Method",
                      correct: evaluatedResult.correctMethod,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl border p-4 ${
                        item.correct
                          ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                          : "border-red-500/20 bg-red-500/[0.04]"
                      }`}
                    >
                      <p className={label}>{item.label}</p>
                      <p
                        className={`mt-2 text-sm font-medium ${
                          item.correct ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {item.correct ? "Correct" : "Incorrect"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Location modal */}
      {selectedLocation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setSelectedLocation(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#101216] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6">
              <div>
                <p className={label}>Scene investigation</p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {selectedLocation.name}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Examine the scene and compare its details with other evidence.
                </p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Close location details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <section>
                <p className={label}>Scene description</p>
                <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/15 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {selectedLocation.description ||
                      "No scene description recorded."}
                  </p>
                </div>
              </section>

              {!!selectedLocation.discoverableDetails?.length && (
                <section>
                  <p className={label}>Discoverable details</p>
                  <div className="mt-3 space-y-2">
                    {selectedLocation.discoverableDetails.map(
                      (detail: string, index: number) => (
                        <div
                          key={`${detail}-${index}`}
                          className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.015] p-4"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/[0.08] text-[10px] text-emerald-400">
                            {index + 1}
                          </span>
                          <p className="text-sm leading-6 text-slate-300">
                            {detail}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between gap-3">
                  <p className={label}>Evidence at this scene</p>
                  <span className="text-[10px] text-slate-500">
                    {locationEvidence.length} items
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {locationEvidence.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-500">
                      No evidence is associated with this location.
                    </p>
                  ) : (
                    locationEvidence.map((item: AnyRecord) => {
                      const discovered = discoveredEvidenceIds.has(item.id);
                      const busy = examiningEvidence === item.id;

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-medium text-slate-200">
                              {item.name}
                            </h3>
                            {discovered && (
                              <CheckCircle2
                                size={15}
                                className="shrink-0 text-emerald-400"
                              />
                            )}
                          </div>
                          <p className="mt-2 text-xs leading-6 text-slate-400">
                            {item.description}
                          </p>
                          <button
                            onClick={() => void handleExamineEvidence(item.id)}
                            disabled={discovered || busy || isReadOnly}
                            className="mt-4 rounded-lg border border-white/[0.09] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-50"
                          >
                            {busy
                              ? "Examining..."
                              : discovered
                                ? "Evidence examined"
                                : isReadOnly
                                  ? "Not examined in this session"
                                  : "Examine evidence"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Suspect interrogation modal */}
      {selectedSuspect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setSelectedSuspect(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#101216] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">
                  Suspect interview
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {selectedSuspect.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedSuspect.age != null
                    ? `${selectedSuspect.age} years old`
                    : "Age unknown"}
                  {" · "}
                  {selectedSuspect.occupation || "Occupation unknown"}
                </p>
              </div>
              <button
                onClick={() => setSelectedSuspect(null)}
                className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Close suspect interview"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {[
                {
                  title: "Relationship to victim",
                  value: selectedSuspect.relationshipToVictim,
                },
                { title: "Alibi", value: selectedSuspect.alibi },
                {
                  title: "Personality",
                  value: selectedSuspect.personality,
                },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <section key={item.title}>
                    <p className={label}>{item.title}</p>
                    <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/15 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {item.value}
                      </p>
                    </div>
                  </section>
                ))}

              <section>
                <p className={label}>Interview transcript</p>
                <div className="mt-3 space-y-2">
                  {selectedSuspect.statements?.length ? (
                    selectedSuspect.statements.map(
                      (statement: string, index: number) => (
                        <div
                          key={`${statement}-${index}`}
                          className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.015] p-4"
                        >
                          <span className="pt-1 text-[10px] text-amber-400">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <p className="text-sm leading-7 text-slate-300">
                            {statement}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-500">
                      No interview statements are available.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Accusation modal */}
      {showAccusation && !isReadOnly && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setShowAccusation(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#101216] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400">
                  Final decision
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Submit your accusation
                </h2>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Identify the suspect and connect the motive and method to the
                  evidence you have collected.
                </p>
              </div>
              <button
                onClick={() => setShowAccusation(false)}
                className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Close accusation form"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label htmlFor="accused-suspect" className={label}>
                  Suspect
                </label>
                <select
                  id="accused-suspect"
                  value={accusation.suspectId}
                  onChange={(event) =>
                    setAccusation({
                      ...accusation,
                      suspectId: event.target.value,
                    })
                  }
                  className={field}
                >
                  <option value="">Select a suspect</option>
                  {suspects.map((suspect: AnyRecord) => (
                    <option key={suspect.id} value={suspect.id}>
                      {suspect.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="accusation-motive" className={label}>
                  Motive
                </label>
                <textarea
                  id="accusation-motive"
                  value={accusation.motive}
                  onChange={(event) =>
                    setAccusation({
                      ...accusation,
                      motive: event.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Why would this suspect commit the crime?"
                  className={field}
                />
              </div>

              <div>
                <label htmlFor="accusation-method" className={label}>
                  Method
                </label>
                <textarea
                  id="accusation-method"
                  value={accusation.method}
                  onChange={(event) =>
                    setAccusation({
                      ...accusation,
                      method: event.target.value,
                    })
                  }
                  rows={3}
                  placeholder="How was the crime committed?"
                  className={field}
                />
              </div>

              <div>
                <label htmlFor="accusation-reasoning" className={label}>
                  Reasoning
                </label>
                <textarea
                  id="accusation-reasoning"
                  value={accusation.reasoning}
                  onChange={(event) =>
                    setAccusation({
                      ...accusation,
                      reasoning: event.target.value,
                    })
                  }
                  rows={6}
                  placeholder="Explain how the evidence, timeline, alibis, motive, and method support your conclusion."
                  className={field}
                />
                <p className="mt-2 text-right text-[10px] text-slate-600">
                  {accusation.reasoning.length} characters
                </p>
              </div>

              <button
                onClick={() => void handleSubmitAccusation()}
                disabled={submittingAccusation}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3.5 text-sm font-medium text-red-300 transition hover:bg-red-500/[0.13] disabled:cursor-wait disabled:opacity-50"
              >
                <ShieldAlert size={16} />
                {submittingAccusation
                  ? "Evaluating accusation..."
                  : "Submit final accusation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation modal */}
      {result && !isReviewMode && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setResult(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101216] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/[0.08] p-6">
              <p className={label}>Investigation complete</p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Case evaluation
              </h2>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-6 text-center">
                <p className={label}>Final score</p>
                <p className="mt-3 text-5xl font-semibold text-white">
                  {result.score ?? 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">out of 100</p>
                <div className="mx-auto mt-5 h-2 max-w-xs overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(result.score ?? 0))
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Culprit", correct: result.correctCulprit },
                  { label: "Motive", correct: result.correctMotive },
                  { label: "Method", correct: result.correctMethod },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl border p-3 text-center ${
                      item.correct
                        ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                        : "border-red-500/20 bg-red-500/[0.04]"
                    }`}
                  >
                    <p className={label}>{item.label}</p>
                    <p
                      className={`mt-2 text-xs font-medium ${
                        item.correct ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {item.correct ? "Correct" : "Incorrect"}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setResult(null)}
                className="mt-5 w-full rounded-xl border border-white/[0.09] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.04]"
              >
                Close evaluation
              </button>
            </div>
          </div>
        </div>
      )}
      
<style jsx global>{`
  /* CaseZero game page: shared light theme */
  html[data-theme="light"] .casezero-game {
    background: #f5f6f8 !important;
    color: #20232b !important;
    color-scheme: light;
  }

  html[data-theme="light"] .casezero-game [class~="bg-[#090a0d]"],
  html[data-theme="light"] .casezero-game [class~="bg-[#0c0e12]"],
  html[data-theme="light"] .casezero-game [class~="bg-[#101216]"],
  html[data-theme="light"] .casezero-game [class~="bg-[#090b0e]"] {
    background-color: #ffffff !important;
  }

  html[data-theme="light"] .casezero-game [class~="bg-black/10"],
  html[data-theme="light"] .casezero-game [class~="bg-black/15"],
  html[data-theme="light"] .casezero-game [class~="bg-black/20"] {
    background-color: #f4f5f7 !important;
  }

  html[data-theme="light"] .casezero-game [class~="bg-white/[0.015]"],
  html[data-theme="light"] .casezero-game [class~="bg-white/[0.02]"],
  html[data-theme="light"] .casezero-game [class~="bg-white/[0.025]"],
  html[data-theme="light"] .casezero-game [class~="bg-white/[0.03]"] {
    background-color: #f8f9fb !important;
  }

  html[data-theme="light"] .casezero-game [class~="text-white"],
  html[data-theme="light"] .casezero-game [class~="text-slate-100"],
  html[data-theme="light"] .casezero-game [class~="text-slate-200"] {
    color: #20232b !important;
  }

  html[data-theme="light"] .casezero-game [class~="text-slate-300"] {
    color: #414653 !important;
  }

  html[data-theme="light"] .casezero-game [class~="text-slate-400"] {
    color: #596171 !important;
  }

  html[data-theme="light"] .casezero-game [class~="text-slate-500"] {
    color: #6b7280 !important;
  }

  html[data-theme="light"] .casezero-game [class~="text-slate-600"] {
    color: #7b8494 !important;
  }

  html[data-theme="light"] .casezero-game [class~="text-slate-700"] {
    color: #8b93a1 !important;
  }

  html[data-theme="light"] .casezero-game [class~="border-white/[0.07]"],
  html[data-theme="light"] .casezero-game [class~="border-white/[0.08]"],
  html[data-theme="light"] .casezero-game [class~="border-white/[0.09]"],
  html[data-theme="light"] .casezero-game [class~="border-white/[0.1]"],
  html[data-theme="light"] .casezero-game [class~="border-white/10"],
  html[data-theme="light"] .casezero-game [class~="border-white/[0.12]"] {
    border-color: #e2e5eb !important;
  }

  html[data-theme="light"] .casezero-game [class~="border-transparent"] {
    border-color: transparent;
  }

  html[data-theme="light"] .casezero-game [class~="bg-white/[0.06]"],
  html[data-theme="light"] .casezero-game [class~="bg-white/10"] {
    background-color: #e8ebf0 !important;
  }

  html[data-theme="light"] .casezero-game [class~="bg-white/[0.08]"] {
    background-color: #edf0f4 !important;
  }

  html[data-theme="light"] .casezero-game [class~="bg-white/5"],
  html[data-theme="light"] .casezero-game [class~="hover:bg-white/5"]:hover,
  html[data-theme="light"] .casezero-game [class~="hover:bg-white/[0.04]"]:hover,
  html[data-theme="light"] .casezero-game [class~="hover:bg-white/[0.025]"]:hover {
    background-color: #eef0f4 !important;
  }

  html[data-theme="light"] .casezero-game input,
  html[data-theme="light"] .casezero-game textarea,
  html[data-theme="light"] .casezero-game select {
    background-color: #ffffff !important;
    color: #20232b !important;
    border-color: #dfe3e9 !important;
  }

  html[data-theme="light"] .casezero-game input::placeholder,
  html[data-theme="light"] .casezero-game textarea::placeholder {
    color: #9aa1ad !important;
  }

  html[data-theme="light"] .casezero-game select option {
    background-color: #ffffff;
    color: #20232b;
  }

  html[data-theme="light"] .casezero-game [class~="bg-white/[0.06]"] {
    background-color: #e9edf2 !important;
  }

  html[data-theme="light"] .casezero-game [class~="border-dashed"] {
    border-color: #d6dbe4 !important;
  }

  html[data-theme="light"] .casezero-game [class~="shadow-2xl"] {
    box-shadow: 0 20px 60px rgba(25, 32, 45, 0.18) !important;
  }

  /* Preserve semantic status colors */
  html[data-theme="light"] .casezero-game [class~="text-emerald-400"],
  html[data-theme="light"] .casezero-game [class~="text-emerald-300"] {
    color: #087f5b !important;
  }

  html[data-theme="light"] .casezero-game [class~="text-red-400"],
  html[data-theme="light"] .casezero-game [class~="text-red-300"] {
    color: #c92332 !important;
  }

  html[data-theme="light"] .casezero-game [class~="text-amber-400"] {
    color: #a16207 !important;
  }

  html[data-theme="light"] .casezero-game [class~="text-amber-300"] {
    color: #92400e !important;
  }

  html[data-theme="light"] .casezero-game [class~="bg-emerald-500/[0.04]"],
  html[data-theme="light"] .casezero-game [class~="bg-emerald-500/[0.035]"],
  html[data-theme="light"] .casezero-game [class~="bg-emerald-500/[0.05]"],
  html[data-theme="light"] .casezero-game [class~="bg-emerald-500/[0.06]"],
  html[data-theme="light"] .casezero-game [class~="bg-emerald-500/[0.07]"] {
    background-color: #e9f7f0 !important;
  }

  html[data-theme="light"] .casezero-game [class~="bg-red-500/[0.04]"],
  html[data-theme="light"] .casezero-game [class~="bg-red-500/[0.06]"],
  html[data-theme="light"] .casezero-game [class~="bg-red-500/[0.08]"] {
    background-color: #fff0f0 !important;
  }

  html[data-theme="light"] .casezero-game [class~="bg-amber-500/[0.04]"],
  html[data-theme="light"] .casezero-game [class~="bg-amber-500/[0.05]"] {
    background-color: #fff7e6 !important;
  }

  html[data-theme="light"] .casezero-game [class~="border-emerald-500/15"],
  html[data-theme="light"] .casezero-game [class~="border-emerald-500/20"],
  html[data-theme="light"] .casezero-game [class~="border-emerald-500/25"] {
    border-color: #b8e5d1 !important;
  }

  html[data-theme="light"] .casezero-game [class~="border-red-500/20"],
  html[data-theme="light"] .casezero-game [class~="border-red-400/20"] {
    border-color: #f1c4c8 !important;
  }

  html[data-theme="light"] .casezero-game [class~="border-amber-500/15"],
  html[data-theme="light"] .casezero-game [class~="border-amber-500/20"] {
    border-color: #f0d7a3 !important;
  }

  html[data-theme="light"] .casezero-game [class~="bg-gradient-to-br"] {
    background-image: linear-gradient(
      to bottom right,
      #fff5f5,
      #ffffff,
      #ffffff
    ) !important;
  }

  html[data-theme="light"] .casezero-game [class~="bg-gradient-to-b"] {
    background-image: linear-gradient(
      to bottom,
      #b8e5d1,
      #e2e5eb,
      transparent
    ) !important;
  }

  html[data-theme="light"] .casezero-game [class~="hover:bg-white/5"]:hover,
  html[data-theme="light"] .casezero-game [class~="hover:bg-white/[0.04]"]:hover {
    background-color: #edf0f4 !important;
  }

  @media (prefers-reduced-motion: reduce) {
    html[data-theme="light"] .casezero-game *,
    html[data-theme="dark"] .casezero-game * {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`}</style>
```
    </main>
  );
}
