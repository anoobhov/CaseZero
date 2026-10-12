import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import "./landing.css";

export default function Home() {
  return (
    <main className="landing-page">
      <div className="background-grid" />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="particles" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              animationDelay: `${(i % 8) * -1.7}s`,
              animationDuration: `${12 + (i % 7) * 2}s`,
            }}
          />
        ))}
      </div>


      <nav className="nav">
  <Link href="/" className="brand">
    <span className="brand-icon">C</span>
    <span>
      CASE<span className="brand-accent">ZERO</span>
    </span>
  </Link>

  <div className="nav-status">
    <span className="status-dot" />
    INVESTIGATION SYSTEM ONLINE
  </div>

  <ThemeToggle />
</nav>

      <section className="hero">
        <div className="case-stamp">
          <span className="stamp-line" />
          CLASSIFIED FILE // 001
          <span className="stamp-line" />
        </div>

        <div className="eyebrow">
          <span className="eyebrow-dash" />
          EVERY CRIME LEAVES A TRACE
        </div>

        <h1 className="hero-title">
          SOMEONE
          <br />
          IS <span className="title-accent">LYING.</span>
        </h1>

        <div className="title-underline">
          <span />
        </div>

        <p className="hero-description">
          The evidence is scattered. The suspects have stories.
          <br className="desktop-break" />
          Somewhere in the details lies the truth.
          <br />
          <span className="description-accent">
            Can you find it?
          </span>
        </p>

        <Link href="/dashboard" className="play-button">
          <span className="button-shine" />
          <span className="play-icon" aria-hidden="true">
            ▶
          </span>
          <span className="button-text">PLAY NOW</span>
          <span className="button-arrow" aria-hidden="true">
            ↗
          </span>
        </Link>

        <p className="button-caption">YOUR NEXT CASE AWAITS</p>

        <div className="case-file" aria-hidden="true">
          <div className="file-top">
            <span>CASE FILE</span>
            <span className="file-redacted">REDACTED</span>
          </div>

          <div className="file-number">#0001</div>

          <div className="file-lines">
            <span />
            <span />
            <span />
          </div>

          <div className="file-footer">
            <span>STATUS: UNSOLVED</span>
            <span className="file-cross">✳</span>
          </div>
        </div>

        <div className="crosshair crosshair-left" aria-hidden="true">
          +
        </div>
        <div className="crosshair crosshair-right" aria-hidden="true">
          +
        </div>
      </section>



      {/* How to Play */}
      <section className="how-to-play" id="how-to-play">
        <div className="guide-heading">
          <div className="guide-eyebrow">
            <span className="eyebrow-dash" />
            DETECTIVE FIELD MANUAL
          </div>

          <h2 className="guide-title">
            HOW TO <span>PLAY.</span>
          </h2>

          <p className="guide-description">
            Every case has a story. Every suspect has something to hide.
            Follow the evidence, question everything, and uncover the truth.
          </p>
        </div>

        <div className="gameplay-grid">
          <article className="gameplay-card">
            <div className="step-top">
              <span className="step-number">01</span>
              <span className="step-icon" aria-hidden="true">▤</span>
            </div>
            <div className="step-tag">CASE SELECTION</div>
            <h3>Choose Your Case</h3>
            <p>
              Head to your dashboard, generate a new mystery, and choose
              your preferred difficulty. You can also resume an unfinished
              investigation or review a completed case.
            </p>
            <div className="step-footer">YOUR INVESTIGATION STARTS HERE</div>
          </article>

          <article className="gameplay-card">
            <div className="step-top">
              <span className="step-number">02</span>
              <span className="step-icon" aria-hidden="true">⌕</span>
            </div>
            <div className="step-tag">CRIME SCENE</div>
            <h3>Investigate Locations</h3>
            <p>
              Explore the available locations in the case. Search each
              scene carefully to uncover evidence. New clues can change
              how you interpret the entire crime.
            </p>
            <div className="step-footer">LEAVE NO CORNER UNSEARCHED</div>
          </article>

          <article className="gameplay-card">
            <div className="step-top">
              <span className="step-number">03</span>
              <span className="step-icon" aria-hidden="true">⌖</span>
            </div>
            <div className="step-tag">FORENSIC ANALYSIS</div>
            <h3>Examine Evidence</h3>
            <p>
              Inspect the evidence you discover. Record important details,
              identify contradictions, and look for connections between
              clues, locations, and the people involved.
            </p>
            <div className="step-footer">EVERY DETAIL MATTERS</div>
          </article>

          <article className="gameplay-card">
            <div className="step-top">
              <span className="step-number">04</span>
              <span className="step-icon" aria-hidden="true">◉</span>
            </div>
            <div className="step-tag">SUSPECT INTERROGATION</div>
            <h3>Question Everyone</h3>
            <p>
              Interrogate the suspects and study their statements.
              Compare their accounts with the evidence. Someone's story
              may not add up.
            </p>
            <div className="step-footer">TRUST NOTHING BLINDLY</div>
          </article>

          <article className="gameplay-card">
            <div className="step-top">
              <span className="step-number">05</span>
              <span className="step-icon" aria-hidden="true">⌘</span>
            </div>
            <div className="step-tag">DETECTIVE'S REASONING</div>
            <h3>Connect the Clues</h3>
            <p>
              Piece together the timeline, motives, opportunity, and
              evidence. Eliminate unlikely explanations and build a
              theory that accounts for the facts.
            </p>
            <div className="step-footer">FOLLOW THE LOGIC</div>
          </article>

          <article className="gameplay-card gameplay-card-final">
            <div className="step-top">
              <span className="step-number">06</span>
              <span className="step-icon" aria-hidden="true">⚖</span>
            </div>
            <div className="step-tag">FINAL VERDICT</div>
            <h3>Make Your Accusation</h3>
            <p>
              Identify the culprit, explain the motive and method, and
              submit your reasoning. Your conclusion is evaluated against
              the case solution. Review your result and learn from the case.
            </p>
            <div className="step-footer">CASE CLOSED?</div>
          </article>
        </div>

        <div className="gameplay-bottom">
          <div className="bottom-signal">
            <span className="status-dot" />
            <span>YOUR FIRST CASE IS WAITING</span>
          </div>

          <p>
            Observe the evidence. Challenge the stories.
            <strong> Find the truth.</strong>
          </p>

          <Link href="/dashboard" className="guide-play-button">
            <span>ENTER THE INVESTIGATION</span>
            <span className="guide-arrow">↗</span>
          </Link>
        </div>
      </section>

      <footer className="footer">

        <div className="footer-item">
          <span className="footer-label">YOUR MISSION</span>
          <span className="footer-value">
            OBSERVE. INVESTIGATE. SOLVE.
          </span>
        </div>

        <div className="footer-divider" />

        <div className="footer-item footer-center">
          <span className="footer-label">
            THE TRUTH IS OUT THERE
          </span>
          <span className="footer-value">
            TRUST THE EVIDENCE.
          </span>
        </div>

        <div className="footer-divider" />

        <div className="footer-item footer-right">
          <span className="footer-label">SYSTEM VERSION</span>
          <span className="footer-value">CZ // 01.0</span>
        </div>
      </footer>
    </main>
  );
}
