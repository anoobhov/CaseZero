
"use client";
import ThemeToggle from "@/components/ThemeToggle";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  Fingerprint,
  Plus,
  // RefreshCw,
  Search,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
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

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [sessionsResponse, statsResponse] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/stats"),
      ]);

      const sessionsData = await sessionsResponse.json();
      const statsData = await statsResponse.json();

      if (!sessionsResponse.ok || !sessionsData.success) {
        throw new Error(
          sessionsData.message || "Failed to load investigations"
        );
      }

      if (!statsResponse.ok || !statsData.success) {
        throw new Error(
          statsData.message || "Failed to load statistics"
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
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeSessions = sessions.filter(
    (session) => session.status === "in_progress"
  );

  const recentCompleted = sessions
    .filter((session) => session.status === "completed")
    .slice(0, 4);

  function difficultyClass(difficulty: string) {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "difficulty-easy";
      case "medium":
        return "difficulty-medium";
      case "hard":
        return "difficulty-hard";
      case "expert":
        return "difficulty-expert";
      default:
        return "difficulty-default";
    }
  }

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="dashboard-shell">
        <div className="dashboard-grid-bg" />

        <div className="dashboard-container loading-container">
          <div className="loading-heading">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-description" />
          </div>

          <div className="stats-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="skeleton-stat" key={i}>
                <div className="skeleton skeleton-label" />
                <div className="skeleton skeleton-number" />
                <div className="skeleton skeleton-description" />
              </div>
            ))}
          </div>

          <div className="skeleton-section">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </div>
        </div>

        <DashboardStyles />
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-shell">
        <div className="dashboard-grid-bg" />

        <div className="error-screen">
          <div className="error-card">
            <div className="error-icon">
              <XCircle size={30} />
            </div>

            <div className="section-eyebrow">SYSTEM ERROR // 500</div>

            <h1>Unable to load dashboard</h1>

            <p>{error}</p>

            
          </div>
        </div>

        <DashboardStyles />
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-grid-bg" />
      <div className="dashboard-glow dashboard-glow-one" />
      <div className="dashboard-glow dashboard-glow-two" />

      {/* Navigation */}
      <header className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <button
            type="button"
            className="dashboard-brand"
            onClick={() => router.push("/")}
            aria-label="Go to CaseZero home"
          >
            <span className="brand-mark">C</span>

            <span className="brand-word">
              CASE<span>ZERO</span>
            </span>
          </button>

          <div className="nav-center">
            <span className="online-dot" />
            INVESTIGATION SYSTEM ONLINE
          </div>

          <ThemeToggle />

        </div>
      </header>

      <div className="dashboard-container">
        {/* Hero */}
        <section className="dashboard-hero">
          <div className="hero-copy">
            <div className="section-eyebrow">
              <span className="eyebrow-line" />
              INVESTIGATION COMMAND CENTER
            </div>

            <h1>
              The truth is
              <br />
              <span>in the details.</span>
            </h1>

            <p>
              Every suspect has a story. Every clue has a purpose.
              Review your record, resume an investigation, or take
              on a new mystery.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                onClick={() => router.push("/cases/new")}
                className="primary-button"
              >
                <Plus size={17} />
                New investigation
                <ArrowUpRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => router.push("/sessions")}
                className="secondary-button"
              >
                <FileSearch size={16} />
                Case archive
              </button>
            </div>
          </div>

          <div className="hero-file" aria-hidden="true">
            <div className="hero-file-top">
              <span>CONFIDENTIAL</span>
              <Shield size={17} />
            </div>

            <div className="hero-file-symbol">
              <Fingerprint size={76} strokeWidth={0.9} />
            </div>

            <div className="hero-file-id">CASEZERO // DETECTIVE UNIT</div>

            <div className="file-redaction file-redaction-long" />
            <div className="file-redaction file-redaction-short" />
            <div className="file-redaction file-redaction-medium" />

            <div className="hero-file-bottom">
              <span>CLASSIFIED RECORD</span>
              <span className="hero-file-stamp">ACTIVE</span>
            </div>
          </div>

          <div className="hero-index" aria-hidden="true">
            CZ / 001
          </div>
        </section>

        {/* Statistics */}
        <section className="stats-section">
          <div className="section-heading">
            <div>
              <div className="section-eyebrow">YOUR RECORD</div>
              <h2>Investigation statistics</h2>
            </div>

            <div className="live-label">
              <Activity size={14} />
              LIVE OVERVIEW
            </div>
          </div>

          <div className="stats-grid">
            <StatCard
              icon={<Search size={19} />}
              label="Total cases"
              value={stats?.totalCases ?? 0}
              detail="Investigations started"
              accent="red"
            />

            <StatCard
              icon={<CheckCircle2 size={19} />}
              label="Cases solved"
              value={stats?.solved ?? 0}
              detail="Correct culprit identified"
              accent="green"
            />

            <StatCard
              icon={<Clock3 size={19} />}
              label="In progress"
              value={stats?.inProgress ?? 0}
              detail="Awaiting your attention"
              accent="amber"
            />

            <StatCard
              icon={<Trophy size={19} />}
              label="Success rate"
              value={`${stats?.successRate ?? 0}%`}
              detail="Of completed investigations"
              accent="purple"
            />
          </div>

          <div className="performance-strip">
            <div className="performance-item">
              <div className="performance-icon">
                <Target size={17} />
              </div>
              <div>
                <span className="performance-label">Average score</span>
                <strong>{stats?.averageScore ?? 0}</strong>
              </div>
            </div>

            <div className="performance-divider" />

            <div className="performance-item">
              <div className="performance-icon performance-icon-gold">
                <Trophy size={17} />
              </div>
              <div>
                <span className="performance-label">Personal best</span>
                <strong>{stats?.bestScore ?? 0}</strong>
              </div>
            </div>

            <div className="performance-divider" />

            <div className="performance-item">
              <div className="performance-icon">
                <FileSearch size={17} />
              </div>
              <div>
                <span className="performance-label">Completed cases</span>
                <strong>{stats?.completed ?? 0}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Active investigations */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <div className="section-eyebrow">PICK UP WHERE YOU LEFT OFF</div>
              <h2>Active investigations</h2>
              <p className="section-description">
                Unfinished cases are waiting for your next move.
              </p>
            </div>

            {activeSessions.length > 0 && (
              <button
                type="button"
                className="text-link"
                onClick={() => router.push("/sessions")}
              >
                All investigations
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {activeSessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Fingerprint size={31} />
              </div>

              <div className="section-eyebrow">NO OPEN CASES</div>

              <h3>A clean slate. A new mystery.</h3>

              <p>
                You have no active investigations. Generate a case
                and put your detective skills to the test.
              </p>

              <button
                type="button"
                onClick={() => router.push("/cases/new")}
                className="primary-button"
              >
                <Plus size={17} />
                Generate a case
              </button>
            </div>
          ) : (
            <div className="investigation-grid">
              {activeSessions.slice(0, 4).map((session, index) => (
                <article
                  className="investigation-card"
                  key={session.id}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="investigation-card-top">
                    <div className="case-card-icon">
                      <FileSearch size={21} />
                    </div>

                    <span className="active-badge">
                      <span className="online-dot" />
                      IN PROGRESS
                    </span>
                  </div>

                  <div className="case-badges">
                    <span
                      className={`difficulty-badge ${difficultyClass(
                        session.difficulty
                      )}`}
                    >
                      {session.difficulty}
                    </span>

                    <span className="case-code">
                      CASE / {String(index + 1).padStart(3, "0")}
                    </span>
                  </div>

                  <h3>{session.title}</h3>

                  <p className="case-setting">
                    {session.setting || "Location classified"}
                  </p>

                  {session.description && (
                    <p className="case-description">
                      {session.description}
                    </p>
                  )}

                  <div className="progress-heading">
                    <span>Investigation progress</span>
                    <strong>
                      {session.progress.percentage}%
                    </strong>
                  </div>

                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-label="Investigation progress"
                    aria-valuenow={session.progress.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, session.progress.percentage)
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="case-metrics">
                    <div>
                      <Search size={14} />
                      <span>
                        {session.progress.evidence.found}/
                        {session.progress.evidence.total}
                      </span>
                      <small>Evidence</small>
                    </div>

                    <div>
                      <Target size={14} />
                      <span>
                        {session.progress.locations.investigated}/
                        {session.progress.locations.total}
                      </span>
                      <small>Locations</small>
                    </div>

                    <div>
                      <Users size={14} />
                      <span>
                        {session.progress.suspects.interrogated}/
                        {session.progress.suspects.total}
                      </span>
                      <small>Suspects</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/game/${session.id}`)}
                    className="resume-button"
                  >
                    Resume investigation
                    <ArrowRight size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* New case call to action */}
        <section className="new-case-banner">
          <div className="banner-glow" />

          <div className="banner-content">
            <div className="section-eyebrow">
              <Sparkles size={14} />
              THE NEXT MYSTERY AWAITS
            </div>

            <h2>
              Think you have
              <br />
              <span>what it takes?</span>
            </h2>

            <p>
              A new case. A fresh set of suspects. A truth waiting
              to be uncovered. Your next investigation starts here.
            </p>

            <button
              type="button"
              onClick={() => router.push("/cases/new")}
              className="primary-button"
            >
              Generate new case
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="banner-art" aria-hidden="true">
            <div className="banner-ring banner-ring-one" />
            <div className="banner-ring banner-ring-two" />
            <div className="banner-ring banner-ring-three" />
            <Fingerprint size={100} strokeWidth={0.8} />
            <span className="banner-art-label">TRUTH / EVIDENCE</span>
          </div>
        </section>

        {/* Recent completed cases */}
        <section className="dashboard-section recent-section">
          <div className="section-heading">
            <div>
              <div className="section-eyebrow">YOUR CASE HISTORY</div>
              <h2>Recent investigations</h2>
              <p className="section-description">
                Revisit your verdicts and review your performance.
              </p>
            </div>

            {sessions.length > 0 && (
              <button
                type="button"
                className="text-link"
                onClick={() => router.push("/sessions")}
              >
                View archive
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {recentCompleted.length === 0 ? (
            <div className="empty-history">
              <div className="empty-history-icon">
                <CalendarDays size={22} />
              </div>

              <div>
                <h3>Your case history starts here.</h3>
                <p>
                  Completed investigations will appear here after
                  you submit your verdict.
                </p>
              </div>
            </div>
          ) : (
            <div className="history-list">
              {recentCompleted.map((session, index) => {
                const solved = Boolean(
                  session.result?.correctCulprit
                );

                return (
                  <button
                    type="button"
                    key={session.id}
                    className="history-row"
                    onClick={() =>
                      router.push(
                        `/game/${session.id}?mode=review`
                      )
                    }
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div
                      className={`history-status ${
                        solved ? "history-solved" : "history-failed"
                      }`}
                    >
                      {solved ? (
                        <CheckCircle2 size={21} />
                      ) : (
                        <XCircle size={21} />
                      )}
                    </div>

                    <div className="history-info">
                      <h3>{session.title}</h3>

                      <div className="history-meta">
                        <span>{session.difficulty}</span>
                        <span className="meta-separator">/</span>
                        <span>
                          {formatDate(
                            session.completedAt || session.updatedAt
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="history-result">
                      <span
                        className={
                          solved ? "result-solved" : "result-failed"
                        }
                      >
                        {solved ? "SOLVED" : "FAILED"}
                      </span>

                      {typeof session.result?.score === "number" && (
                        <small>Score: {session.result.score}</small>
                      )}
                    </div>

                    <ChevronRight
                      className="history-chevron"
                      size={18}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <button
            type="button"
            className="footer-brand"
            onClick={() => router.push("/")}
          >
            CASE<span>ZERO</span>
          </button>

          <p>OBSERVE. INVESTIGATE. SOLVE.</p>

          <span className="footer-version">CZ // 01.0</span>
        </footer>
      </div>

      <DashboardStyles />
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail: string;
  accent: "red" | "green" | "amber" | "purple";
}) {
  return (
    <article className={`stat-card stat-${accent}`}>
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>

      <div className="stat-value">{value}</div>

      <p className="stat-detail">{detail}</p>

      <div className="stat-card-line" />
    </article>
  );
}

function DashboardStyles() {
  return (
    
    <style jsx global>{`


      
      /* Theme toggle on dashboard */

      .theme-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        min-height: 40px;
        padding: 0 13px;
        border: 1px solid rgba(255, 255, 255, 0.13);
        background: rgba(255, 255, 255, 0.035);
        color: #dedee2;
        font-family: monospace;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1px;
        cursor: pointer;
        transition: background 0.25s, color 0.25s, border-color 0.25s;
      }

      .theme-toggle:hover {
        border-color: rgba(237, 52, 61, 0.5);
        background: rgba(237, 52, 61, 0.09);
        color: #ff6970;
      }

      .theme-toggle:focus-visible {
        outline: 2px solid #ed343d;
        outline-offset: 4px;
      }

      /* Dashboard: light mode */

      html[data-theme="light"] .dashboard-shell {
        --cz-bg: #f4f5f8;
        --cz-panel: #ffffff;
        --cz-red: #c92332;
        --cz-text: #191a20;
        --cz-muted: #606472;
        background: #f4f5f8;
        color: #191a20;
      }

      html[data-theme="light"] .dashboard-grid-bg {
        background-image:
          linear-gradient(rgba(20, 20, 30, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(20, 20, 30, 0.035) 1px, transparent 1px);
      }

      html[data-theme="light"] .dashboard-glow {
        opacity: 0.035;
      }

      html[data-theme="light"] .dashboard-nav {
        border-color: rgba(20, 20, 30, 0.1);
        background: rgba(255, 255, 255, 0.9);
      }

      html[data-theme="light"] .brand-word,
      html[data-theme="light"] .dashboard-hero h1,
      html[data-theme="light"] .section-heading h2,
      html[data-theme="light"] .stat-value,
      html[data-theme="light"] .investigation-card h3,
      html[data-theme="light"] .banner-content h2,
      html[data-theme="light"] .history-info h3,
      html[data-theme="light"] .empty-state h3,
      html[data-theme="light"] .empty-history h3,
      html[data-theme="light"] .error-card h1 {
        color: #191a20;
      }

      html[data-theme="light"] .dashboard-hero h1 span,
      html[data-theme="light"] .banner-content h2 span {
        color: #c92332;
        text-shadow: none;
      }

      html[data-theme="light"] .nav-center,
      html[data-theme="light"] .section-eyebrow,
      html[data-theme="light"] .section-description,
      html[data-theme="light"] .hero-copy > p,
      html[data-theme="light"] .stat-label,
      html[data-theme="light"] .stat-detail,
      html[data-theme="light"] .performance-label,
      html[data-theme="light"] .case-setting,
      html[data-theme="light"] .case-description,
      html[data-theme="light"] .progress-heading,
      html[data-theme="light"] .case-metrics small,
      html[data-theme="light"] .case-code,
      html[data-theme="light"] .history-meta,
      html[data-theme="light"] .history-result small,
      html[data-theme="light"] .empty-state p,
      html[data-theme="light"] .empty-history p,
      html[data-theme="light"] .banner-content > p,
      html[data-theme="light"] .dashboard-footer > p,
      html[data-theme="light"] .footer-version {
        color: #606472;
      }

      html[data-theme="light"] .nav-refresh {
        border-color: rgba(20, 20, 30, 0.13);
        background: #fff;
        color: #515462;
      }

      html[data-theme="light"] .nav-refresh:hover {
        border-color: rgba(201, 35, 50, 0.4);
        color: #c92332;
        background: #fff5f5;
      }

      html[data-theme="light"] .primary-button {
        border-color: #c92332;
        background: #c92332;
        color: #fff;
      }

      html[data-theme="light"] .primary-button:hover {
        background: #a91d2a;
      }

      html[data-theme="light"] .secondary-button {
        border-color: rgba(20, 20, 30, 0.14);
        background: #fff;
        color: #292b33;
      }

      html[data-theme="light"] .secondary-button:hover {
        border-color: rgba(20, 20, 30, 0.25);
        background: #f8f8fa;
      }

      html[data-theme="light"] .hero-file {
        border-color: rgba(20, 20, 30, 0.12);
        background: linear-gradient(145deg, #fff, #f4f4f7);
        box-shadow: 0 20px 60px rgba(20, 20, 30, 0.09);
      }

      html[data-theme="light"] .hero-file::before {
        border-color: rgba(20, 20, 30, 0.12);
        background: #e8e8ed;
      }

      html[data-theme="light"] .hero-file-top,
      html[data-theme="light"] .hero-file-bottom,
      html[data-theme="light"] .hero-file-id {
        color: #515462;
      }

      html[data-theme="light"] .hero-file-symbol {
        border-color: rgba(20, 20, 30, 0.09);
        color: rgba(201, 35, 50, 0.65);
      }

      html[data-theme="light"] .file-redaction {
        background: rgba(20, 20, 30, 0.1);
      }

      html[data-theme="light"] .hero-index {
        color: #858894;
      }

      html[data-theme="light"] .live-label {
        border-color: rgba(20, 120, 75, 0.16);
        background: rgba(20, 120, 75, 0.045);
        color: #18764c;
      }

      html[data-theme="light"] .stat-card,
      html[data-theme="light"] .investigation-card {
        border-color: rgba(20, 20, 30, 0.1);
        background: linear-gradient(145deg, #fff, #fafafd);
        box-shadow: 0 4px 18px rgba(20, 20, 30, 0.025);
      }

      html[data-theme="light"] .stat-card:hover,
      html[data-theme="light"] .investigation-card:hover {
        border-color: rgba(201, 35, 50, 0.28);
        background: #fff;
        box-shadow: 0 12px 30px rgba(20, 20, 30, 0.07);
      }

      html[data-theme="light"] .stat-icon {
        border-color: rgba(20, 20, 30, 0.08);
        background: #f3f3f6;
      }

      html[data-theme="light"] .stat-green .stat-value {
        color: #18764c;
      }

      html[data-theme="light"] .performance-strip {
        border-color: rgba(20, 20, 30, 0.09);
        background: rgba(255, 255, 255, 0.75);
      }

      html[data-theme="light"] .performance-item strong {
        color: #191a20;
      }

      html[data-theme="light"] .performance-divider {
        background: rgba(20, 20, 30, 0.12);
      }

      html[data-theme="light"] .case-card-icon {
        border-color: rgba(201, 35, 50, 0.16);
        background: rgba(201, 35, 50, 0.05);
        color: #c92332;
      }

      html[data-theme="light"] .active-badge {
        border-color: rgba(20, 120, 75, 0.15);
        background: rgba(20, 120, 75, 0.045);
        color: #18764c;
      }

      html[data-theme="light"] .case-metrics {
        border-color: rgba(20, 20, 30, 0.09);
      }

      html[data-theme="light"] .case-metrics span {
        color: #343640;
      }

      html[data-theme="light"] .resume-button {
        border-color: rgba(201, 35, 50, 0.2);
        background: rgba(201, 35, 50, 0.045);
        color: #9e202c;
      }

      html[data-theme="light"] .resume-button:hover {
        border-color: rgba(201, 35, 50, 0.4);
        background: rgba(201, 35, 50, 0.09);
        color: #801b25;
      }

      html[data-theme="light"] .empty-state,
      html[data-theme="light"] .empty-history {
        border-color: rgba(20, 20, 30, 0.13);
        background: rgba(255, 255, 255, 0.7);
      }

      html[data-theme="light"] .empty-icon,
      html[data-theme="light"] .empty-history-icon {
        border-color: rgba(20, 20, 30, 0.1);
        background: rgba(201, 35, 50, 0.04);
        color: #c92332;
      }

      html[data-theme="light"] .new-case-banner {
        border-color: rgba(201, 35, 50, 0.2);
        background: linear-gradient(
          110deg,
          rgba(201, 35, 50, 0.055),
          rgba(255, 255, 255, 0.8)
        );
      }

      html[data-theme="light"] .banner-glow {
        opacity: 0.35;
      }

      html[data-theme="light"] .banner-ring {
        border-color: rgba(201, 35, 50, 0.17);
      }

      html[data-theme="light"] .banner-art {
        color: rgba(201, 35, 50, 0.6);
      }

      html[data-theme="light"] .banner-art-label {
        color: #606472;
      }

      html[data-theme="light"] .history-list {
        border-color: rgba(20, 20, 30, 0.1);
        background: rgba(255, 255, 255, 0.7);
      }

      html[data-theme="light"] .history-row + .history-row {
        border-color: rgba(20, 20, 30, 0.09);
      }

      html[data-theme="light"] .history-row:hover {
        background: rgba(20, 20, 30, 0.035);
      }

      html[data-theme="light"] .history-chevron {
        color: #777b86;
      }

      html[data-theme="light"] .dashboard-footer {
        border-color: rgba(20, 20, 30, 0.1);
      }

      html[data-theme="light"] .text-link {
        color: #515462;
      }

      html[data-theme="light"] .text-link:hover {
        color: #c92332;
      }

      html[data-theme="light"] .error-card {
        border-color: rgba(201, 35, 50, 0.2);
        background: #fff;
        box-shadow: 0 15px 50px rgba(20, 20, 30, 0.05);
      }

      html[data-theme="light"] .error-card p {
        color: #606472;
      }

      html[data-theme="light"] .skeleton {
        background: linear-gradient(
          90deg,
          #e8e9ee,
          #f8f8fa,
          #e8e9ee
        );
        background-size: 200% 100%;
      }

      html[data-theme="light"] .skeleton-stat,
      html[data-theme="light"] .skeleton-card {
        border-color: rgba(20, 20, 30, 0.08);
      }

      html[data-theme="light"] .theme-toggle {
        border-color: rgba(20, 20, 30, 0.14);
        background: #fff;
        color: #343640;
      }

      html[data-theme="light"] .theme-toggle:hover {
        border-color: rgba(201, 35, 50, 0.4);
        color: #c92332;
      }

      @media (max-width: 650px) {
        .theme-toggle {
          min-height: 35px;
          padding: 0 9px;
          font-size: 8px;
        }
      }

      .dashboard-shell {
        --cz-bg: #08090c;
        --cz-panel: #0e1015;
        --cz-red: #ed343d;
        --cz-text: #f4f2ef;
        --cz-muted: #9295a1;
        position: relative;
        isolation: isolate;
        min-height: 100vh;
        overflow: hidden;
        background: var(--cz-bg);
        color: var(--cz-text);
        font-family: Arial, Helvetica, sans-serif;
      }

      .dashboard-grid-bg {
        position: absolute;
        inset: 0;
        z-index: -3;
        pointer-events: none;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: linear-gradient(to bottom, black, transparent 90%);
      }

      .dashboard-glow {
        position: absolute;
        z-index: -2;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        filter: blur(130px);
        opacity: 0.09;
        pointer-events: none;
        animation: cz-glow 9s ease-in-out infinite alternate;
      }

      .dashboard-glow-one {
        top: 80px;
        left: -250px;
        background: #ed343d;
      }

      .dashboard-glow-two {
        top: 900px;
        right: -300px;
        background: #a51c3c;
        animation-delay: -4s;
      }

      .dashboard-nav {
        position: relative;
        z-index: 2;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
        background: rgba(8, 9, 12, 0.86);
        backdrop-filter: blur(16px);
      }

      .dashboard-nav-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        max-width: 1320px;
        min-height: 76px;
        margin: 0 auto;
        padding: 0 32px;
      }

      .dashboard-brand,
      .footer-brand {
        display: inline-flex;
        align-items: center;
        gap: 11px;
        border: 0;
        background: transparent;
        color: var(--cz-text);
        cursor: pointer;
      }

      .brand-mark {
        display: grid;
        width: 37px;
        height: 37px;
        place-items: center;
        border: 1px solid rgba(237, 52, 61, 0.7);
        background: rgba(237, 52, 61, 0.07);
        color: var(--cz-red);
        font-family: Georgia, serif;
        font-size: 25px;
        box-shadow: 0 0 22px rgba(237, 52, 61, 0.08);
      }

      .brand-word {
        font-size: 17px;
        font-weight: 900;
        letter-spacing: 2px;
      }

      .brand-word span,
      .footer-brand span {
        color: var(--cz-red);
      }

      .nav-center {
        display: flex;
        align-items: center;
        gap: 9px;
        color: #8c8f99;
        font-family: monospace;
        font-size: 10px;
        letter-spacing: 1.5px;
      }

      .online-dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        flex: 0 0 auto;
        border-radius: 50%;
        background: #6de2a1;
        box-shadow: 0 0 11px rgba(109, 226, 161, 0.55);
        animation: cz-blink 2s infinite;
      }

      .nav-refresh {
        display: grid;
        width: 39px;
        height: 39px;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.025);
        color: #a5a7b0;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .nav-refresh:hover {
        border-color: rgba(237, 52, 61, 0.4);
        color: white;
        background: rgba(237, 52, 61, 0.08);
      }

      .nav-refresh:hover svg {
        animation: cz-spin 0.8s ease;
      }

      .dashboard-container {
        position: relative;
        max-width: 1320px;
        margin: 0 auto;
        padding: 0 32px;
      }

      .dashboard-hero {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 45px;
        min-height: 390px;
        padding: 65px 0 60px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .hero-copy {
        position: relative;
        z-index: 1;
        max-width: 660px;
        animation: cz-fade-up 0.7s ease both;
      }

      .section-eyebrow {
        display: flex;
        align-items: center;
        gap: 9px;
        color: #a2a4ae;
        font-family: monospace;
        font-size: 10px;
        letter-spacing: 2px;
        line-height: 1.6;
      }

      .eyebrow-line {
        display: inline-block;
        width: 22px;
        height: 2px;
        background: var(--cz-red);
      }

      .dashboard-hero h1 {
        margin: 22px 0 16px;
        color: var(--cz-text);
        font-size: clamp(44px, 6vw, 70px);
        font-weight: 900;
        letter-spacing: -3.5px;
        line-height: 1.04;
      }

      .dashboard-hero h1 span {
        color: var(--cz-red);
        text-shadow: 0 0 35px rgba(237, 52, 61, 0.1);
      }

      .hero-copy > p {
        max-width: 555px;
        margin: 0;
        color: var(--cz-muted);
        font-size: 14px;
        line-height: 1.9;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
      }

      .primary-button,
      .secondary-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 46px;
        padding: 0 18px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.35px;
        cursor: pointer;
        transition:
          transform 0.22s ease,
          background 0.22s ease,
          box-shadow 0.22s ease,
          border-color 0.22s ease;
      }

      .primary-button {
        border: 1px solid #fa5960;
        background: var(--cz-red);
        color: white;
        box-shadow: 0 5px 22px rgba(237, 52, 61, 0.09);
      }

      .primary-button:hover {
        transform: translateY(-2px);
        background: #ff454e;
        box-shadow: 0 9px 27px rgba(237, 52, 61, 0.2);
      }

      .secondary-button {
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.025);
        color: #dedee2;
      }

      .secondary-button:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.25);
        background: rgba(255, 255, 255, 0.06);
      }

      .primary-button:focus-visible,
      .secondary-button:focus-visible,
      .nav-refresh:focus-visible,
      .dashboard-brand:focus-visible,
      .footer-brand:focus-visible,
      .text-link:focus-visible,
      .history-row:focus-visible,
      .resume-button:focus-visible {
        outline: 2px solid white;
        outline-offset: 4px;
      }

      .hero-file {
        position: relative;
        width: 270px;
        min-width: 240px;
        padding: 23px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.045), transparent),
          #0d0e13;
        box-shadow: 0 25px 90px rgba(0, 0, 0, 0.35);
        transform: rotate(3deg);
        animation: cz-file-float 7s ease-in-out infinite;
      }

      .hero-file::before {
        position: absolute;
        top: -7px;
        left: 16px;
        width: 70px;
        height: 7px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-bottom: 0;
        background: #17181e;
        content: "";
      }

      .hero-file-top,
      .hero-file-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        color: #9b9da7;
        font-family: monospace;
        font-size: 9px;
        letter-spacing: 1.5px;
      }

      .hero-file-top svg {
        color: var(--cz-red);
      }

      .hero-file-symbol {
        display: grid;
        height: 155px;
        place-items: center;
        margin: 12px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        color: rgba(237, 52, 61, 0.65);
      }

      .hero-file-id {
        margin-bottom: 17px;
        color: #d0cdd0;
        font-family: monospace;
        font-size: 9px;
        letter-spacing: 1.1px;
      }

      .file-redaction {
        height: 4px;
        margin: 8px 0;
        background: rgba(255, 255, 255, 0.11);
      }

      .file-redaction-long {
        width: 100%;
      }

      .file-redaction-short {
        width: 56%;
      }

      .file-redaction-medium {
        width: 77%;
        margin-bottom: 23px;
      }

      .hero-file-stamp {
        padding: 4px 6px;
        border: 1px solid rgba(237, 52, 61, 0.4);
        color: #ff6970;
      }

      .hero-index {
        position: absolute;
        right: 0;
        bottom: 20px;
        color: #50515b;
        font-family: monospace;
        font-size: 10px;
        letter-spacing: 2px;
      }

      .stats-section {
        padding-top: 42px;
      }

      .section-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 23px;
      }

      .section-heading h2 {
        margin: 8px 0 0;
        color: #f2f0ee;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.7px;
      }

      .live-label {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 10px;
        border: 1px solid rgba(109, 226, 161, 0.13);
        background: rgba(109, 226, 161, 0.035);
        color: #83dbaa;
        font-family: monospace;
        font-size: 9px;
        letter-spacing: 1px;
        white-space: nowrap;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 15px;
      }

      .stat-card {
        position: relative;
        min-width: 0;
        padding: 21px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.085);
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.035),
          rgba(255, 255, 255, 0.008)
        );
        transition:
          transform 0.25s ease,
          border-color 0.25s ease,
          background 0.25s ease;
        animation: cz-fade-up 0.55s ease both;
      }

      .stat-card:hover {
        transform: translateY(-4px);
        border-color: rgba(255, 255, 255, 0.17);
        background: rgba(255, 255, 255, 0.035);
      }

      .stat-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .stat-label {
        color: #9b9da7;
        font-size: 11px;
        font-weight: 600;
      }

      .stat-icon {
        display: grid;
        width: 37px;
        height: 37px;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.035);
      }

      .stat-red .stat-icon {
        color: #ff6970;
        background: rgba(237, 52, 61, 0.075);
      }

      .stat-green .stat-icon {
        color: #6de2a1;
        background: rgba(109, 226, 161, 0.065);
      }

      .stat-amber .stat-icon {
        color: #f3c56d;
        background: rgba(243, 197, 109, 0.065);
      }

      .stat-purple .stat-icon {
        color: #c4a6ff;
        background: rgba(196, 166, 255, 0.065);
      }

      .stat-value {
        margin-top: 23px;
        color: #f5f3f0;
        font-size: clamp(30px, 3vw, 39px);
        font-weight: 850;
        letter-spacing: -1.5px;
        line-height: 1.1;
      }

      .stat-green .stat-value {
        color: #72e1a4;
      }

      .stat-detail {
        margin: 8px 0 0;
        color: #777b86;
        font-size: 11px;
        line-height: 1.6;
      }

      .stat-card-line {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 2px;
        background: rgba(255, 255, 255, 0.05);
        transition: background 0.25s ease;
      }

      .stat-red .stat-card-line {
        background: rgba(237, 52, 61, 0.55);
      }

      .stat-green .stat-card-line {
        background: rgba(109, 226, 161, 0.5);
      }

      .stat-amber .stat-card-line {
        background: rgba(243, 197, 109, 0.5);
      }

      .stat-purple .stat-card-line {
        background: rgba(196, 166, 255, 0.5);
      }

      .performance-strip {
        display: flex;
        align-items: center;
        gap: 28px;
        margin-top: 15px;
        padding: 17px 22px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        background: rgba(255, 255, 255, 0.018);
      }

      .performance-item {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .performance-icon {
        display: grid;
        width: 36px;
        height: 36px;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid rgba(237, 52, 61, 0.17);
        background: rgba(237, 52, 61, 0.055);
        color: #ff737a;
      }

      .performance-icon-gold {
        border-color: rgba(243, 197, 109, 0.17);
        background: rgba(243, 197, 109, 0.055);
        color: #f3c56d;
      }

      .performance-item > div:last-child {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .performance-label {
        color: #8c8f99;
        font-size: 10px;
      }

      .performance-item strong {
        color: #f0eeec;
        font-size: 18px;
        font-weight: 800;
      }

      .performance-divider {
        width: 1px;
        height: 32px;
        flex: 0 0 auto;
        background: rgba(255, 255, 255, 0.1);
      }

      .dashboard-section {
        padding-top: 65px;
      }

      .section-description {
        margin: 8px 0 0;
        color: #858894;
        font-size: 12px;
        line-height: 1.7;
      }

      .text-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 8px 0;
        border: 0;
        background: transparent;
        color: #b3b5be;
        font-size: 11px;
        cursor: pointer;
        transition: color 0.2s ease;
        white-space: nowrap;
      }

      .text-link:hover {
        color: #ff6970;
      }

      .investigation-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .investigation-card {
        min-width: 0;
        padding: 23px;
        border: 1px solid rgba(255, 255, 255, 0.085);
        background: linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.03),
          rgba(255, 255, 255, 0.008)
        );
        transition:
          transform 0.25s ease,
          border-color 0.25s ease,
          box-shadow 0.25s ease;
        animation: cz-fade-up 0.55s ease both;
      }

      .investigation-card:hover {
        transform: translateY(-4px);
        border-color: rgba(237, 52, 61, 0.3);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.18);
      }

      .investigation-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .case-card-icon {
        display: grid;
        width: 44px;
        height: 44px;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid rgba(237, 52, 61, 0.2);
        background: rgba(237, 52, 61, 0.065);
        color: #ff6970;
      }

      .active-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 9px;
        border: 1px solid rgba(109, 226, 161, 0.12);
        background: rgba(109, 226, 161, 0.035);
        color: #84dbaa;
        font-family: monospace;
        font-size: 8px;
        letter-spacing: 1px;
        white-space: nowrap;
      }

      .active-badge .online-dot {
        width: 6px;
        height: 6px;
      }

      .case-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-top: 21px;
      }

      .difficulty-badge {
        padding: 5px 8px;
        border: 1px solid;
        border-radius: 2px;
        font-family: monospace;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.7px;
        text-transform: uppercase;
      }

      .difficulty-easy {
        border-color: rgba(109, 226, 161, 0.22);
        background: rgba(109, 226, 161, 0.055);
        color: #77dda4;
      }

      .difficulty-medium {
        border-color: rgba(243, 197, 109, 0.22);
        background: rgba(243, 197, 109, 0.055);
        color: #f0c56f;
      }

      .difficulty-hard {
        border-color: rgba(255, 155, 93, 0.22);
        background: rgba(255, 155, 93, 0.055);
        color: #ffa16c;
      }

      .difficulty-expert {
        border-color: rgba(237, 52, 61, 0.25);
        background: rgba(237, 52, 61, 0.07);
        color: #ff7077;
      }

      .difficulty-default {
        border-color: rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.035);
        color: #aeb0ba;
      }

      .case-code {
        color: #777b86;
        font-family: monospace;
        font-size: 9px;
        letter-spacing: 1px;
      }

      .investigation-card h3 {
        margin: 15px 0 6px;
        overflow: hidden;
        color: #f4f2ef;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: -0.5px;
        text-overflow: ellipsis;
      }

      .case-setting {
        margin: 0;
        color: #a2a4ae;
        font-size: 11px;
      }

      .case-description {
        display: -webkit-box;
        min-height: 39px;
        margin: 13px 0 0;
        overflow: hidden;
        color: #858894;
        font-size: 11px;
        line-height: 1.8;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .progress-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 25px;
        margin-bottom: 10px;
        color: #898c97;
        font-size: 10px;
      }

      .progress-heading strong {
        color: #f1efed;
        font-family: monospace;
        font-size: 12px;
      }

      .progress-track {
        height: 4px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.075);
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #a91d2b, #ed343d, #ff737a);
        box-shadow: 0 0 12px rgba(237, 52, 61, 0.24);
        transition: width 0.7s ease;
      }

      .case-metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-top: 19px;
        padding: 14px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.065);
        border-bottom: 1px solid rgba(255, 255, 255, 0.065);
      }

      .case-metrics > div {
        display: grid;
        grid-template-columns: 15px 1fr;
        align-items: center;
        gap: 5px;
        min-width: 0;
      }

      .case-metrics svg {
        color: #ff7077;
      }

      .case-metrics span {
        overflow: hidden;
        color: #dedce0;
        font-family: monospace;
        font-size: 11px;
        text-overflow: ellipsis;
      }

      .case-metrics small {
        grid-column: 2;
        color: #777b86;
        font-size: 9px;
      }

      .resume-button {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-height: 43px;
        margin-top: 18px;
        padding: 0 13px;
        border: 1px solid rgba(237, 52, 61, 0.22);
        background: rgba(237, 52, 61, 0.055);
        color: #f2c6c8;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .resume-button svg {
        color: #ff737a;
        transition: transform 0.2s ease;
      }

      .resume-button:hover {
        border-color: rgba(237, 52, 61, 0.55);
        background: rgba(237, 52, 61, 0.12);
        color: white;
      }

      .resume-button:hover svg {
        transform: translateX(3px);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 55px 22px;
        border: 1px dashed rgba(255, 255, 255, 0.13);
        background: rgba(255, 255, 255, 0.012);
        text-align: center;
      }

      .empty-icon {
        display: grid;
        width: 62px;
        height: 62px;
        place-items: center;
        margin-bottom: 22px;
        border: 1px solid rgba(237, 52, 61, 0.18);
        background: rgba(237, 52, 61, 0.055);
        color: #ff737a;
      }

      .empty-state h3 {
        margin: 12px 0 0;
        color: #eeecea;
        font-size: 20px;
        font-weight: 800;
      }

      .empty-state p {
        max-width: 410px;
        margin: 10px 0 22px;
        color: #9295a1;
        font-size: 12px;
        line-height: 1.9;
      }

      .new-case-banner {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 30px;
        min-height: 305px;
        margin-top: 66px;
        padding: 40px 45px;
        overflow: hidden;
        border: 1px solid rgba(237, 52, 61, 0.23);
        background:
          linear-gradient(
            110deg,
            rgba(237, 52, 61, 0.105),
            rgba(237, 52, 61, 0.015) 58%,
            transparent
          ),
          #0d0e13;
      }

      .banner-content {
        position: relative;
        z-index: 1;
        max-width: 510px;
      }

      .banner-content .section-eyebrow {
        color: #ff7a80;
      }

      .banner-content h2 {
        margin: 19px 0 12px;
        color: #f4f2ef;
        font-size: clamp(32px, 4vw, 47px);
        font-weight: 900;
        letter-spacing: -1.8px;
        line-height: 1.12;
      }

      .banner-content h2 span {
        color: #ff5a63;
      }

      .banner-content > p {
        max-width: 430px;
        margin: 0;
        color: #a0a2ac;
        font-size: 12px;
        line-height: 1.9;
      }

      .banner-content .primary-button {
        margin-top: 23px;
      }

      .banner-glow {
        position: absolute;
        top: -180px;
        right: 60px;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: rgba(237, 52, 61, 0.09);
        filter: blur(80px);
        pointer-events: none;
      }

      .banner-art {
        position: relative;
        display: grid;
        width: 235px;
        height: 235px;
        flex: 0 0 auto;
        place-items: center;
        color: rgba(255, 92, 101, 0.7);
      }

      .banner-ring {
        position: absolute;
        border: 1px solid rgba(237, 52, 61, 0.18);
        border-radius: 50%;
        animation: cz-ring 9s linear infinite;
      }

      .banner-ring-one {
        inset: 0;
      }

      .banner-ring-two {
        inset: 20px;
        border-style: dashed;
        animation-direction: reverse;
        animation-duration: 18s;
      }

      .banner-ring-three {
        inset: 43px;
        border-color: rgba(237, 52, 61, 0.28);
      }

      .banner-art > svg {
        filter: drop-shadow(0 0 18px rgba(237, 52, 61, 0.2));
      }

      .banner-art-label {
        position: absolute;
        bottom: -2px;
        color: #89818a;
        font-family: monospace;
        font-size: 8px;
        letter-spacing: 2px;
        white-space: nowrap;
      }

      .recent-section {
        padding-bottom: 65px;
      }

      .history-list {
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.085);
        background: rgba(255, 255, 255, 0.012);
      }

      .history-row {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 17px;
        padding: 19px 22px;
        border: 0;
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
        transition: background 0.2s ease;
        animation: cz-fade-up 0.5s ease both;
      }

      .history-row + .history-row {
        border-top: 1px solid rgba(255, 255, 255, 0.065);
      }

      .history-row:hover {
        background: rgba(255, 255, 255, 0.035);
      }

      .history-status {
        display: grid;
        width: 43px;
        height: 43px;
        flex: 0 0 auto;
        place-items: center;
      }

      .history-solved {
        border: 1px solid rgba(109, 226, 161, 0.15);
        background: rgba(109, 226, 161, 0.055);
        color: #6de2a1;
      }

      .history-failed {
        border: 1px solid rgba(237, 52, 61, 0.16);
        background: rgba(237, 52, 61, 0.055);
        color: #ff737a;
      }

      .history-info {
        flex: 1;
        min-width: 0;
      }

      .history-info h3 {
        margin: 0;
        overflow: hidden;
        color: #e9e7e5;
        font-size: 13px;
        font-weight: 700;
        text-overflow: ellipsis;
      }

      .history-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 9px;
        margin-top: 7px;
        color: #858894;
        font-size: 10px;
      }

      .meta-separator {
        color: #51535d;
      }

      .history-result {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
        flex: 0 0 auto;
      }

      .history-result > span {
        font-family: monospace;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1px;
      }

      .result-solved {
        color: #6de2a1;
      }

      .result-failed {
        color: #ff737a;
      }

      .history-result small {
        color: #858894;
        font-size: 10px;
      }

      .history-chevron {
        flex: 0 0 auto;
        color: #666974;
        transition:
          transform 0.2s ease,
          color 0.2s ease;
      }

      .history-row:hover .history-chevron {
        transform: translateX(3px);
        color: #ff737a;
      }

      .empty-history {
        display: flex;
        align-items: center;
        gap: 17px;
        padding: 25px;
        border: 1px solid rgba(255, 255, 255, 0.085);
        background: rgba(255, 255, 255, 0.012);
      }

      .empty-history-icon {
        display: grid;
        width: 46px;
        height: 46px;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.09);
        color: #a3a5ae;
      }

      .empty-history h3 {
        margin: 0;
        color: #e9e7e5;
        font-size: 13px;
        font-weight: 700;
      }

      .empty-history p {
        margin: 6px 0 0;
        color: #858894;
        font-size: 11px;
        line-height: 1.7;
      }

      .dashboard-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        min-height: 80px;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .footer-brand {
        padding: 8px 0;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 1.5px;
      }

      .dashboard-footer > p,
      .footer-version {
        color: #777b86;
        font-family: monospace;
        font-size: 9px;
        letter-spacing: 1.3px;
      }

      .skeleton {
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.035),
          rgba(255, 255, 255, 0.09),
          rgba(255, 255, 255, 0.035)
        );
        background-size: 200% 100%;
        animation: cz-shimmer 1.5s linear infinite;
      }

      .loading-container {
        padding-top: 55px;
        padding-bottom: 60px;
      }

      .loading-heading {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 38px;
      }

      .skeleton-label {
        width: 150px;
        height: 11px;
      }

      .skeleton-title {
        width: 330px;
        max-width: 90%;
        height: 37px;
      }

      .skeleton-description {
        width: 430px;
        max-width: 90%;
        height: 13px;
      }

      .stats-grid .skeleton-stat {
        display: flex;
        flex-direction: column;
        gap: 19px;
        padding: 23px;
        border: 1px solid rgba(255, 255, 255, 0.07);
      }

      .skeleton-number {
        width: 90px;
        height: 36px;
      }

      .skeleton-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 50px;
      }

      .skeleton-card {
        height: 115px;
        border: 1px solid rgba(255, 255, 255, 0.07);
      }

      .error-screen {
        display: flex;
        min-height: 85vh;
        align-items: center;
        justify-content: center;
        padding: 25px;
      }

      .error-card {
        width: 100%;
        max-width: 450px;
        padding: 35px;
        border: 1px solid rgba(237, 52, 61, 0.22);
        background: #0e1015;
        text-align: center;
        animation: cz-fade-up 0.5s ease both;
      }

      .error-icon {
        display: grid;
        width: 60px;
        height: 60px;
        place-items: center;
        margin: 0 auto 23px;
        border: 1px solid rgba(237, 52, 61, 0.2);
        background: rgba(237, 52, 61, 0.07);
        color: #ff737a;
      }

      .error-card .section-eyebrow {
        justify-content: center;
      }

      .error-card h1 {
        margin: 15px 0 10px;
        font-size: 23px;
        font-weight: 800;
      }

      .error-card p {
        margin: 0;
        color: #9295a1;
        font-size: 12px;
        line-height: 1.8;
        overflow-wrap: anywhere;
      }

      .error-card .primary-button {
        margin-top: 24px;
      }

      @keyframes cz-fade-up {
        from {
          opacity: 0;
          transform: translateY(15px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes cz-file-float {
        0%, 100% {
          transform: translateY(0) rotate(3deg);
        }
        50% {
          transform: translateY(-9px) rotate(1deg);
        }
      }

      @keyframes cz-glow {
        from {
          opacity: 0.06;
          transform: scale(0.9);
        }
        to {
          opacity: 0.14;
          transform: scale(1.12);
        }
      }

      @keyframes cz-blink {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.35;
        }
      }

      @keyframes cz-spin {
        from {
          transform: rotate(0);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes cz-ring {
        from {
          transform: rotate(0);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes cz-shimmer {
        from {
          background-position: 100% 0;
        }
        to {
          background-position: -100% 0;
        }
      }

      @media (max-width: 950px) {
        .dashboard-hero {
          gap: 25px;
        }

        .hero-file {
          width: 225px;
          min-width: 205px;
          padding: 18px;
        }

        .hero-file-symbol {
          height: 125px;
        }

        .stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .banner-art {
          width: 180px;
          height: 180px;
        }

        .banner-art > svg {
          width: 80px;
          height: 80px;
        }
      }

      @media (max-width: 650px) {
        .dashboard-nav-inner {
          min-height: 66px;
          padding: 0 19px;
        }

        .brand-word {
          font-size: 15px;
        }

        .nav-center {
          gap: 6px;
          font-size: 8px;
          letter-spacing: 0.4px;
        }

        .nav-refresh {
          width: 34px;
          height: 34px;
        }

        .dashboard-container {
          padding: 0 19px;
        }

        .dashboard-hero {
          min-height: 0;
          padding: 53px 0 42px;
        }

        .hero-copy {
          max-width: 100%;
        }

        .dashboard-hero h1 {
          margin-top: 19px;
          font-size: clamp(42px, 11vw, 61px);
          letter-spacing: -2.6px;
        }

        .hero-copy > p {
          max-width: 100%;
          font-size: 12px;
        }

        .hero-actions {
          gap: 9px;
        }

        .primary-button,
        .secondary-button {
          min-height: 43px;
          padding: 0 12px;
          font-size: 10px;
        }

        .hero-file {
          display: none;
        }

        .hero-index {
          bottom: 12px;
          font-size: 8px;
        }

        .stats-section {
          padding-top: 37px;
        }

        .section-heading {
          align-items: flex-start;
          gap: 12px;
        }

        .section-heading h2 {
          font-size: 21px;
        }

        .section-heading .section-eyebrow {
          font-size: 9px;
          letter-spacing: 1.3px;
        }

        .live-label {
          padding: 7px;
          font-size: 8px;
        }

        .stats-grid {
          gap: 10px;
        }

        .stat-card {
          padding: 15px;
        }

        .stat-label {
          font-size: 10px;
        }

        .stat-icon {
          width: 31px;
          height: 31px;
        }

        .stat-value {
          margin-top: 19px;
          font-size: 31px;
        }

        .stat-detail {
          font-size: 10px;
        }

        .performance-strip {
          flex-wrap: wrap;
          gap: 18px;
          padding: 15px;
        }

        .performance-item {
          flex: 1 1 40%;
        }

        .performance-divider {
          display: none;
        }

        .dashboard-section {
          padding-top: 49px;
        }

        .section-description {
          max-width: 100%;
          font-size: 11px;
        }

        .text-link {
          font-size: 10px;
        }

        .investigation-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 13px;
        }

        .investigation-card {
          padding: 19px;
        }

        .new-case-banner {
          min-height: 0;
          margin-top: 49px;
          padding: 28px 22px;
        }

        .banner-content h2 {
          font-size: 37px;
        }

        .banner-art {
          display: none;
        }

        .banner-content > p {
          font-size: 11px;
        }

        .recent-section {
          padding-bottom: 40px;
        }

        .history-row {
          gap: 11px;
          padding: 15px 12px;
        }

        .history-status {
          width: 35px;
          height: 35px;
        }

        .history-info h3 {
          font-size: 11px;
        }

        .history-meta {
          gap: 5px;
          font-size: 9px;
        }

        .history-result > span {
          font-size: 9px;
        }

        .history-result small {
          font-size: 9px;
        }

        .history-chevron {
          width: 15px;
          height: 15px;
        }

        .dashboard-footer {
          min-height: 72px;
          gap: 10px;
        }

        .dashboard-footer > p,
        .footer-version {
          font-size: 8px;
          letter-spacing: 0.5px;
        }

        .footer-brand {
          font-size: 11px;
        }
      }

      @media (max-width: 390px) {
        .nav-center {
          max-width: 120px;
          line-height: 1.5;
        }

        .section-heading {
          flex-direction: column;
        }

        .live-label {
          align-self: flex-start;
        }

        .hero-actions > button {
          font-size: 9px;
        }

        .case-metrics {
          gap: 5px;
        }

        .case-metrics > div {
          grid-template-columns: 13px 1fr;
          gap: 3px;
        }

        .case-metrics span {
          font-size: 10px;
        }

        .history-row {
          gap: 8px;
        }

        .history-result {
          gap: 4px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .dashboard-shell *,
        .dashboard-shell *::before,
        .dashboard-shell *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}
