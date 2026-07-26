import "./Footer.css";

export default function Footer() {

    const year = new Date().getFullYear();

    const version =
        import.meta.env.VITE_APP_VERSION || "1.0.0";

    return (

        <footer className="bw-footer">

            <div className="bw-footer-top">

                <div className="bw-footer-brand">

                    <div className="bw-footer-logo">

                        BW

                    </div>

                    <div>

                        <span className="bw-footer-kicker">

                            BUYWISE

                        </span>

                        <h3>

                            Decision Intelligence

                        </h3>

                        <p>

                            Helping you make smarter shopping decisions through contextual AI analysis, not just ratings.

                        </p>

                    </div>

                </div>

                <div className="bw-footer-version">

                    <span>

                        Version

                    </span>

                    <strong>

                        {version}

                    </strong>

                </div>

            </div>

            <div className="bw-footer-divider"></div>

            <div className="bw-footer-bottom">

                <span>

                    © {year} BuyWise

                </span>

                <span>

                    Built to reduce decision fatigue.

                </span>

            </div>

        </footer>

    );

}