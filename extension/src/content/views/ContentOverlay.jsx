import { useState } from "react";
import { useBuyWise } from "../context/BuyWiseContext";
import { getComparisonDecision } from "../brain/BuyWiseBrain";
import "./ContentOverlay.css"; // contains popup-container, popup-content, etc.

export default function ContentOverlay() {
  const {
    currentProduct,
    decision,
    setDecision,
    comparisonMode,
    setComparisonMode,
    comparisonBase,
    comparisonTarget,
    comparisonReady,
    setComparisonReady,
    comparisonResult,
    setComparisonResult,
    startComparison,
    clearComparison
  } = useBuyWise();

  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // If no product detected, don't render the overlay
  if (!currentProduct) {
    return null;
  }

  function getStatusText() {
    if (comparisonReady && comparisonBase && comparisonTarget) {
      return "Comparison ready – click Compare now.";
    }
    if (comparisonMode) {
      return "Waiting… open another Amazon/Flipkart product page.";
    }
    return "Compare this product with another.";
  }

  function getStatusClass() {
    if (comparisonReady && comparisonBase && comparisonTarget) {
      return "compare-status compare-status-ready";
    }
    if (comparisonMode) {
      return "compare-status compare-status-waiting";
    }
    return "compare-status compare-status-selecting";
  }

  async function handleStartComparison() {
    // Start comparison with the current page's product
    startComparison(currentProduct);
    setComparisonMode(true);
    setComparisonReady(false);
    setComparisonResult(null);
  }

  async function handleCompareNow() {
    if (!comparisonBase || !comparisonTarget) {
      return;
    }

    setLoading(true);

    try {
      const result = await getComparisonDecision(
        comparisonBase,
        comparisonTarget
      );

      // Store comparison result for downstream UI (chat, summary, etc.)
      setComparisonResult(result);
      setDecision(result);
    } catch (error) {
      console.error("BuyWise Comparison Error", error);
    }

    setLoading(false);
  }

  function handleClearComparison() {
    clearComparison();
    setComparisonReady(false);
    setComparisonResult(null);
  }

  return (
    <div className="popup-container">
      {/* Toggle button to hide/show overlay */}
      <button
        className="toggle-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Hide BuyWise" : "Show BuyWise"}
      >
        <span className="button-icon">🛍</span>
      </button>

      <div className={`popup-content ${open ? "opacity-100" : "opacity-0"}`}>
        <div>
          <strong>BuyWise</strong>
        </div>
        <p className={getStatusClass()}>{getStatusText()}</p>

        <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
          {!comparisonMode && (
            <button
              className="compare-action-button"
              onClick={handleStartComparison}
            >
              Compare this product
            </button>
          )}

          {comparisonMode && !comparisonReady && (
            <button
              className="compare-action-button"
              disabled={true}
            >
              Waiting for second product…
            </button>
          )}

          {comparisonMode && comparisonReady && (
            <button
              className="compare-action-button"
              disabled={loading}
              onClick={handleCompareNow}
            >
              {loading ? "Analyzing both products…" : "Compare now with BuyWise"}
            </button>
          )}

          {comparisonMode && (
            <button
              className="compare-action-button"
              onClick={handleClearComparison}
              style={{ backgroundColor: "#6b7280" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}