import "./ShoppingMemory.css";

import { useMemo, useState } from "react";

import { useBuyWise } from "../context/BuyWiseContext";

import { getComparisonDecision } from "../brain/BuyWiseBrain";

import { removeFromCompare } from "../storage/CompareBasket";

export default function ShoppingMemory() {

    const {

        basket,

        currentProduct,

        setDecision,

        refreshBasket

    } = useBuyWise();

    const [search, setSearch] = useState("");

    const filteredProducts = useMemo(() => {

        const query = search.trim().toLowerCase();

        if (!query) {

            return basket;

        }

        return basket.filter(product => {

            const searchable = [

                product.title,

                product.brand,

                product.category,

                product.platform

            ]

                .filter(Boolean)

                .join(" ")

                .toLowerCase();

            return searchable.includes(query);

        });

    }, [

        basket,

        search

    ]);

    const totalBrands =

        new Set(

            basket

                .map(item => item.brand)

                .filter(Boolean)

        ).size;

    async function compare(product) {

        if (!currentProduct) {

            return;

        }

        const result = await getComparisonDecision(

            currentProduct,

            product

        );

        setDecision(result);

    }

    async function remove(product) {

        await removeFromCompare(

            product.url

        );

        await refreshBasket();

    }

    function openProduct(product) {

        if (!product.url) {

            return;

        }

        chrome.tabs.create({

            url: product.url

        });

    }

    return (

        <section className="shopping-memory">

            <header className="memory-header">

                <div>

                    <span className="memory-kicker">

                        MY BUYWISE

                    </span>

                    <h2 className="memory-title">

                        Shopping decisions, remembered.

                    </h2>

                    <p className="memory-subtitle">

                        Products you've chosen to keep, compare and revisit.

                    </p>

                </div>

                <div className="memory-overview">

                    <div className="memory-stat">

                        <strong>

                            {basket.length}

                        </strong>

                        <span>

                            Saved

                        </span>

                    </div>

                    <div className="memory-stat">

                        <strong>

                            {totalBrands}

                        </strong>

                        <span>

                            Brands

                        </span>

                    </div>

                </div>

            </header>

            <div className="memory-search">

                <input

                    type="text"

                    className="memory-search-input"

                    placeholder="Search saved products..."

                    value={search}

                    onChange={(e) =>

                        setSearch(

                            e.target.value

                        )

                    }

                />

            </div>
            <div className="memory-products">

                <div className="memory-products-header">

                    <h3>

                        Saved Products

                    </h3>

                    <span className="memory-count">

                        {filteredProducts.length}

                    </span>

                </div>

                {

                    filteredProducts.length === 0 ? (

                        <div className="memory-empty">

                            <h4>

                                Nothing saved yet

                            </h4>

                            <p>

                                Save products while browsing and they'll appear here for quick access and comparison.

                            </p>

                        </div>

                    ) : (

                        <div className="memory-list">

                            {

                                filteredProducts.map(product => (

                                    <article

                                        key={product.url}

                                        className="memory-card"

                                    >

                                        <div

                                            className="memory-image"

                                            onClick={() =>

                                                openProduct(product)

                                            }

                                        >

                                            {

                                                product.image ? (

                                                    <img

                                                        src={product.image}

                                                        alt={product.title}

                                                    />

                                                ) : (

                                                    <div className="memory-image-placeholder">

                                                        No Image

                                                    </div>

                                                )

                                            }

                                        </div>

                                        <div className="memory-content">

                                            {

                                                product.brand && (

                                                    <div className="memory-brand">

                                                        {product.brand}

                                                    </div>

                                                )

                                            }

                                            <h4

                                                className="memory-product-title"

                                                onClick={() =>

                                                    openProduct(product)

                                                }

                                            >

                                                {product.title}

                                            </h4>

                                            <div className="memory-meta">

                                                {

                                                    product.price && (

                                                        <span className="memory-price">

                                                            {product.price}

                                                        </span>

                                                    )

                                                }

                                                {

                                                    product.platform && (

                                                        <span className="memory-platform">

                                                            {product.platform}

                                                        </span>

                                                    )

                                                }

                                            </div>

                                            <div className="memory-actions">

                                                <button

                                                    className="memory-btn compare"

                                                    onClick={() =>

                                                        compare(product)

                                                    }

                                                >

                                                    Compare

                                                </button>

                                                <button

                                                    className="memory-btn open"

                                                    onClick={() =>

                                                        openProduct(product)

                                                    }

                                                >

                                                    Open

                                                </button>

                                                <button

                                                    className="memory-btn remove"

                                                    onClick={() =>

                                                        remove(product)

                                                    }

                                                >

                                                    Remove

                                                </button>

                                            </div>

                                        </div>

                                    </article>

                                ))

                            }

                        </div>

                    )

                }

            </div>
        </section>

    );

}