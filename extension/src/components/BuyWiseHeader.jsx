import "./BuyWiseHeader.css";

export default function BuyWiseHeader() {

    return (

        <header className="panel-header">

            <div className="header-left">

                <div className="brand-logo">

                    <svg
                        className="brand-mark"
                        viewBox="0 0 48 48"
                        fill="none"
                    >

                        <circle
                            cx="24"
                            cy="24"
                            r="19"
                            stroke="var(--navy)"
                            strokeWidth="2"
                        />

                        <circle
                            cx="24"
                            cy="24"
                            r="13"
                            stroke="rgba(15,23,42,.25)"
                            strokeWidth="1.4"
                        />

                        <path
                            d="M16 24L21 29L33 17"
                            stroke="var(--wine)"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                    </svg>

                </div>

                <div className="brand-text">

                    <span className="eyebrow">

                        SHOP SMARTER

                    </span>

                    <h1 className="name">

                        BuyWise

                    </h1>

                    <p className="tagline">

                        The second opinion every shopper deserves.

                    </p>

                    <div className="status-row">

                        <div className="status-pill live">

                            <span className="live-dot"></span>

                            Live Analysis

                        </div>

                        <div className="status-pill">

                            Amazon

                        </div>

                        <div className="status-pill">

                            Flipkart

                        </div>

                    </div>

                </div>

            </div>

            <button
                className="icon-btn settings"
                title="Settings"
                aria-label="Settings"
            >

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >

                    <circle
                        cx="12"
                        cy="12"
                        r="3.2"
                    />

                    <path d="M19.4 13.5a1.7 1.7 0 000-3l-.9-.5a1.7 1.7 0 01-.8-1.9l.3-1a1.7 1.7 0 00-2.1-2.1l-1 .3a1.7 1.7 0 01-1.9-.8l-.5-.9a1.7 1.7 0 00-3 0l-.5.9a1.7 1.7 0 01-1.9.8l-1-.3A1.7 1.7 0 002 6.4l.3 1a1.7 1.7 0 01-.8 1.9l-.9.5a1.7 1.7 0 000 3l.9.5a1.7 1.7 0 01.8 1.9l-.3 1a1.7 1.7 0 002.1 2.1l1-.3a1.7 1.7 0 011.9.8l.5.9a1.7 1.7 0 003 0l.5-.9a1.7 1.7 0 011.9-.8l1 .3a1.7 1.7 0 002.1-2.1l-.3-1a1.7 1.7 0 01.8-1.9l.9-.5z" />

                </svg>

            </button>

        </header>

    );

}