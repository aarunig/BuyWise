import "./SearchBar.css";

export default function SearchBar() {
    return (
        <section className="search-section">

            <div className="search-header">

                <div>

                    <span className="search-label">
                        QUICK SEARCH
                    </span>

                    <h3>
                        Find Products
                    </h3>

                </div>

                <button
                    className="search-filter-btn"
                    title="Filters"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M4 6H20" />
                        <path d="M7 12H17" />
                        <path d="M10 18H14" />
                    </svg>
                </button>

            </div>

            <div className="search-box">

                <div className="search-icon">

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20L17 17" />
                    </svg>

                </div>

                <input
                    type="text"
                    placeholder="Search saved products, brands or categories..."
                />

                <button
                    className="search-ai-btn"
                    title="AI Search"
                >
                    AI
                </button>

            </div>

            <div className="search-suggestions">

                <span className="suggestion-chip">
                    T-Shirts
                </span>

                <span className="suggestion-chip">
                    Shoes
                </span>

                <span className="suggestion-chip">
                    Electronics
                </span>

                <span className="suggestion-chip">
                    Recently Viewed
                </span>

            </div>

        </section>
    );
}