import "./ActionButtons.css";

import { useBuyWise } from "../context/BuyWiseContext";

export default function ActionButtons({

    onCompare,
    onSave,
    onShare,
    onBuy

}) {

    const { currentProduct, decision } = useBuyWise();

    const platform =

        currentProduct?.platform ||

        currentProduct?.marketplace ||

        "Store";

    const buyLabel =

        currentProduct?.buyButtonText ||

        currentProduct?.platformAction ||

        "View Product";

    const compareLabel =

        decision?.compareLabel ||

        "Compare Product";

    const saveLabel =

        decision?.saveLabel ||

        "Save for Later";

    const alternativeLabel =

        decision?.alternativeLabel ||

        "Explore Alternatives";

    return (

        <section className="action-section">

            <div className="action-header">

                <span className="action-kicker">

                    NEXT ACTION

                </span>

                <h2 className="action-heading">

                    What would you like to do?

                </h2>

            </div>

            <div className="action-grid">

                <button
                    className="action-card primary"
                    onClick={onBuy}
                >

                    <div className="action-icon">

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >

                            <path d="M6 6h15l-1.5 8H8z"/>

                            <circle
                                cx="9"
                                cy="20"
                                r="1.5"
                            />

                            <circle
                                cx="18"
                                cy="20"
                                r="1.5"
                            />

                            <path d="M6 6L5 3H2"/>

                        </svg>

                    </div>

                    <div className="action-content">

                        <h3>

                            {buyLabel}

                        </h3>

                        <p>

                            Open on {platform}

                        </p>

                    </div>

                </button>

                <button
                    className="action-card"
                    onClick={onCompare}
                >

                    <div className="action-icon">

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >

                            <rect
                                x="3"
                                y="5"
                                width="7"
                                height="14"
                                rx="2"
                            />

                            <rect
                                x="14"
                                y="5"
                                width="7"
                                height="14"
                                rx="2"
                            />

                        </svg>

                    </div>

                    <div className="action-content">

                        <h3>

                            {compareLabel}

                        </h3>

                        <p>

                            Compare another option

                        </p>

                    </div>

                </button>

                <button
                    className="action-card"
                    onClick={onSave}
                >

                    <div className="action-icon">

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >

                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>

                        </svg>

                    </div>

                    <div className="action-content">

                        <h3>

                            {saveLabel}

                        </h3>

                        <p>

                            Keep it in BuyWise

                        </p>

                    </div>

                </button>

                <button
                    className="action-card"
                    onClick={onShare}
                >

                    <div className="action-icon">

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >

                            <circle
                                cx="18"
                                cy="5"
                                r="3"
                            />

                            <circle
                                cx="6"
                                cy="12"
                                r="3"
                            />

                            <circle
                                cx="18"
                                cy="19"
                                r="3"
                            />

                            <path d="M8.6 13.5l6.8 4"/>

                            <path d="M15.4 6.5L8.6 10.5"/>

                        </svg>

                    </div>

                    <div className="action-content">

                        <h3>

                            {alternativeLabel}

                        </h3>

                        <p>

                            Discover similar products

                        </p>

                    </div>

                </button>

            </div>

        </section>

    );

}