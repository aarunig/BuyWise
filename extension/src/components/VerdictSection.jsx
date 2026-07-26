import "./VerdictSection.css";
import { useBuyWise } from "../context/BuyWiseContext";

export default function VerdictSection() {

    const { decision } = useBuyWise();

    if (!decision) {

        return (

            <section className="verdict-card">

                <div className="verdict-status ready">

                    WELCOME

                </div>

                <div className="verdict-meta">

                    <span className="confidence-label">

                        BuyWise

                    </span>

                    <span className="confidence-value">

                        Ready

                    </span>

                </div>

                <h2>

                    Open any product to begin.

                </h2>

                <p className="verdict-description">

                    BuyWise will analyse the product, evaluate its value,
                    compare available signals and help you make a confident
                    buying decision.

                </p>

            </section>

        );

    }

    const verdictClass =
        decision.verdict?.toLowerCase() || "wait";

    const verdictLabel =
        decision.verdictLabel ||
        decision.verdict ||
        "WAIT";

    const headline =
        decision.headline ||
        "Recommendation";

    const explanation =
        decision.explanation ||
        "No explanation available.";

    const confidence =

        decision.confidenceLevel ||

        (

            typeof decision.confidence === "number"

                ? decision.confidence >= 90

                    ? "Very High"

                    : decision.confidence >= 75

                    ? "High"

                    : decision.confidence >= 60

                    ? "Moderate"

                    : "Low"

                : "High"

        );

    const reasonTitle =
        decision.reasonTitle ||
        "Why BuyWise recommends this";

    const concernTitle =
        decision.concernTitle ||
        "Worth knowing";

    return (

        <section className="verdict-card">

            <div className={`verdict-status ${verdictClass}`}>

                {verdictLabel}

            </div>

            <div className="verdict-meta">

                <span className="confidence-label">

                    Recommendation Confidence

                </span>

                <span className="confidence-value">

                    {confidence}

                </span>

            </div>

            <h2>

                {headline}

            </h2>

            <p className="verdict-description">

                {explanation}

            </p>

            {

                decision.strengths?.length > 0 && (

                    <div className="verdict-block">

                        <h3>

                            {reasonTitle}

                        </h3>

                        {

                            decision.strengths
                                .slice(0, 3)
                                .map((reason, index) => (

                                    <div
                                        key={index}
                                        className="reason"
                                    >

                                        <div className="tick">

                                            ●

                                        </div>

                                        <span>

                                            {reason}

                                        </span>

                                    </div>

                                ))

                        }

                    </div>

                )

            }

            {

                decision.concern && (

                    <div className="warning">

                        <h3>

                            {concernTitle}

                        </h3>

                        <p>

                            {decision.concern}

                        </p>

                    </div>

                )

            }

        </section>

    );

}