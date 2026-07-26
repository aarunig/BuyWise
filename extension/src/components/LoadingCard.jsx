import { useEffect, useState } from "react";
import "./LoadingCard.css";

const ANALYSIS_STEPS = [
    {
        title: "Reading verified customer reviews",
        description: "Checking review quality and customer sentiment."
    },
    {
        title: "Analyzing price history and trends",
        description: "Comparing current pricing with historical trends."
    },
    {
        title: "Evaluating long-term value",
        description: "Estimating durability and cost over time."
    },
    {
        title: "Matching your shopping preferences",
        description: "Comparing against your saved shopping profile."
    },
    {
        title: "Comparing similar alternatives",
        description: "Finding better value products in the same category."
    },
    {
        title: "Preparing your recommendation",
        description: "Generating the final BuyWise verdict."
    }
];

export default function LoadingCard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= ANALYSIS_STEPS.length - 1) {
                    setProgress(100);
                    return prev;
                }

                const next = prev + 1;
                setProgress(
                    Math.round(((next + 1) / ANALYSIS_STEPS.length) * 100)
                );
                return next;
            });
        }, 1700);

        return () => clearInterval(interval);
    }, []);

    const remaining = Math.max(0, ANALYSIS_STEPS.length - currentStep - 1) * 2;

    return (
        <section className="loading-card">
            {/* HERO */}
            <div className="loading-hero">
                <div className="ai-brand">BUYWISE AI</div>
                <h1>Building Your Recommendation</h1>
                <p className="subtitle">
                    This usually takes only a few seconds
                </p>
            </div>

            {/* PROGRESS */}
            <div className="progress-section">
                <div className="progress-header">
                    <span>Recommendation Progress</span>
                    <span className="progress-status">{progress}%</span>
                </div>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={progress}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* DIVIDER */}
            <div className="loading-divider"></div>

            {/* CURRENT ANALYSIS */}
            <div className="analysis-section">
                <h3>Current Analysis</h3>
                <div className="timeline">
                    {ANALYSIS_STEPS.map((step, index) => {
                        const state =
                            index < currentStep
                                ? "completed"
                                : index === currentStep
                                ? "active"
                                : "pending";

                        return (
                            <div
                                key={index}
                                className={`timeline-item ${state}`}
                            >
                                <div className="timeline-dot" />
                                <div className="timeline-content">
                                    <div className="timeline-step">
                                        Step {index + 1} of {ANALYSIS_STEPS.length}
                                    </div>
                                    <p>{step.title}</p>
                                    <small>{step.description}</small>
                                    {state === "active" && (
                                        <div className="timeline-status">
                                            Currently analyzing...
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FOOTER */}
            <div className="loading-footer">
                <p>
                    BuyWise combines product quality, verified reviews, price history,
                    long-term value and your shopping preferences before generating
                    every recommendation.
                </p>
                <div className="estimated-time">
                    {remaining > 0
                        ? `Estimated time remaining ≈ ${remaining} seconds`
                        : "Finalizing your recommendation..."}
                </div>
            </div>
        </section>
    );
}