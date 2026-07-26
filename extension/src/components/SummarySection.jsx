import "./SummarySection.css";
import { useBuyWise } from "../context/BuyWiseContext";
import DEFAULT_SUMMARY from "../data/defaultSummary";

export default function SummarySection() {
  const { decision } = useBuyWise();

  const summary = decision?.summary ?? {};

  const executiveSummary =
    summary.executiveSummary ?? DEFAULT_SUMMARY.executiveSummary;
  const executiveHeroNote =
    summary.executiveHeroNote ?? DEFAULT_SUMMARY.executiveHeroNote;

  const strengths = summary.strengths ?? DEFAULT_SUMMARY.strengths ?? [];
  const tradeoffs = summary.tradeoffs ?? DEFAULT_SUMMARY.tradeoffs ?? [];
  const hiddenInsights =
    summary.hiddenInsights ?? DEFAULT_SUMMARY.hiddenInsights ?? [];

  const bestFor = summary.bestFor ?? DEFAULT_SUMMARY.bestFor ?? [];
  const avoidIf = summary.avoidIf ?? DEFAULT_SUMMARY.avoidIf ?? [];

  const bottomLine =
    summary.bottomLine ?? DEFAULT_SUMMARY.bottomLine;
  const decisionStrength =
    summary.decisionStrength ?? DEFAULT_SUMMARY.decisionStrength;

  const hasStrengths = strengths.length > 0;
  const hasTradeoffs = tradeoffs.length > 0;
  const hasHiddenInsights = hiddenInsights.length > 0;
  const hasBestFor = bestFor.length > 0;
  const hasAvoidIf = avoidIf.length > 0;

  return (
    <section className="bw-summary">
      {/* Hero / Executive Brief */}
      <header className="bw-summary-hero">
        <div className="bw-summary-hero-left">
          <span className="bw-summary-eyebrow">BUYWISE SUMMARY</span>
          <h2 className="bw-summary-heading">Executive Brief</h2>
          {executiveHeroNote && (
            <p className="bw-summary-hero-note">
              {executiveHeroNote}
            </p>
          )}
        </div>

        <div className="bw-summary-hero-right">
          <span className="bw-summary-ai-badge">
            Generated using BuyWise Intelligence
          </span>
        </div>
      </header>

      {/* Executive Summary – editorial hero */}
      <p className="bw-summary-executive">
        {executiveSummary}
      </p>

      <div className="bw-summary-divider" />

      {/* Why BuyWise Recommends It */}
      {hasStrengths && (
        <section className="bw-summary-section">
          <h3 className="bw-summary-section-heading">
            Why BuyWise Recommends It
          </h3>

          <div className="bw-summary-card-grid">
            {strengths.map((item, index) => (
              <article
                key={index}
                className="bw-summary-card bw-summary-card-fade-up"
              >
                <div className="bw-summary-card-inner">
                  <h4 className="bw-summary-card-title">
                    {item.title}
                  </h4>
                  <p className="bw-summary-card-description">
                    {item.description}
                  </p>
                  {typeof item.confidence === "number" && (
                    <span className="bw-summary-card-confidence">
                      {item.confidence}% confidence
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasStrengths && <div className="bw-summary-divider" />}

      {/* Trade-offs */}
      {hasTradeoffs && (
        <section className="bw-summary-section">
          <h3 className="bw-summary-section-heading">Trade-offs</h3>

          <div className="bw-summary-card-grid">
            {tradeoffs.map((item, index) => (
              <article
                key={index}
                className="bw-summary-card bw-summary-card-tradeoff bw-summary-card-fade-up"
              >
                <div className="bw-summary-card-inner">
                  <h4 className="bw-summary-card-title">
                    {item.title}
                  </h4>
                  <p className="bw-summary-card-description">
                    {item.description}
                  </p>
                  {typeof item.confidence === "number" && (
                    <span className="bw-summary-card-confidence">
                      {item.confidence}% confidence
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasTradeoffs && <div className="bw-summary-divider" />}

      {/* Things You Might Miss / Hidden Insights */}
      {hasHiddenInsights && (
        <section className="bw-summary-section">
          <h3 className="bw-summary-section-heading">Things You Might Miss</h3>

          <div className="bw-summary-card-grid">
            {hiddenInsights.map((item, index) => (
              <article
                key={index}
                className="bw-summary-card bw-summary-card-editor bw-summary-card-fade-up"
              >
                <div className="bw-summary-card-inner">
                  <div className="bw-summary-editor-label">
                    {item.tag || "Interesting Observation"}
                  </div>
                  <div className="bw-summary-editor-divider" />
                  <h4 className="bw-summary-card-title">
                    {item.title}
                  </h4>
                  <p className="bw-summary-card-description">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasHiddenInsights && <div className="bw-summary-divider" />}

      {/* Best For */}
      {hasBestFor && (
        <section className="bw-summary-section">
          <h3 className="bw-summary-section-heading">Best For</h3>

          <div className="bw-summary-pill-row">
            {bestFor.map((item, index) => (
              <span
                key={index}
                className="bw-summary-pill bw-summary-pill-check"
              >
                <span className="bw-summary-pill-icon" aria-hidden="true" />
                <span className="bw-summary-pill-label">{item.label}</span>
                {item.reason && (
                  <span className="bw-summary-pill-reason">
                    {item.reason}
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {hasBestFor && <div className="bw-summary-divider" />}

      {/* Maybe Skip If... */}
      {hasAvoidIf && (
        <section className="bw-summary-section">
          <h3 className="bw-summary-section-heading">Maybe Skip If...</h3>

          <div className="bw-summary-card-grid">
            {avoidIf.map((item, index) => (
              <article
                key={index}
                className="bw-summary-card bw-summary-card-soft bw-summary-card-fade-up"
              >
                <div className="bw-summary-card-inner">
                  <h4 className="bw-summary-card-title">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="bw-summary-card-description">
                      {item.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasAvoidIf && <div className="bw-summary-divider" />}

      {/* Bottom Line – editorial quote */}
      <section className="bw-summary-section">
        <h3 className="bw-summary-section-heading">Bottom Line</h3>
        <div className="bw-summary-bottom-line-card">
          <p className="bw-summary-bottom-line">
            {bottomLine}
          </p>
          {decisionStrength && (
            <span className="bw-summary-bottom-line-strength">
              Overall assessment: {decisionStrength} recommendation
            </span>
          )}
        </div>
      </section>

      <div className="bw-summary-divider" />

      {/* Footer AI note */}
      <footer className="bw-summary-footer">
        <p className="bw-summary-footer-text">
          BuyWise combines pricing, customer reviews, product quality,
          long-term ownership costs, market positioning and your shopping
          preferences before generating every recommendation. The summary
          above represents the combined outcome of all these signals rather
          than a single metric.
        </p>
      </footer>
    </section>
  );
}