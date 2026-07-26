import { useMemo, useState } from "react";
import "./CompareBasket.css";

import { useBuyWise } from "../context/BuyWiseContext";
import { getComparisonDecision } from "../brain/BuyWiseBrain";

export default function CompareBasket() {

    const {

        basket,

        selectedProducts,

        setSelectedProducts,

        setDecision

    } = useBuyWise();

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);

    const filteredBasket = useMemo(() => {

        return basket.filter(product => {

            const text = `${product.title} ${product.brand || ""}`.toLowerCase();

            return text.includes(search.toLowerCase());

        });

    }, [basket, search]);

    function toggleProduct(product) {

        const exists = selectedProducts.some(

            item => item.url === product.url

        );

        if (exists) {

            setSelectedProducts(

                selectedProducts.filter(

                    item => item.url !== product.url

                )

            );

            return;

        }

        if (selectedProducts.length >= 2) {

            setSelectedProducts([

                selectedProducts[1],

                product

            ]);

            return;

        }

        setSelectedProducts([

            ...selectedProducts,

            product

        ]);

    }

    async function compareProducts() {

        if (selectedProducts.length !== 2) return;

        setLoading(true);

        const result = await getComparisonDecision(

            selectedProducts[0],

            selectedProducts[1]

        );

        setDecision(result);

        setLoading(false);

    }

    function helperText() {

        switch (selectedProducts.length) {

            case 0:
                return "Choose any two saved products to compare.";

            case 1:
                return "Great choice. Select one more.";

            case 2:
                return "Everything is ready.";

            default:
                return "";

        }

    }

    return (

        <section className="compare-basket">

            <div className="basket-header">

                <div>

                    <span className="section-label">

                        DECISION STUDIO

                    </span>

                    <h3>

                        Compare Products

                    </h3>

                </div>

                <span>

                    {selectedProducts.length}/2

                </span>

            </div>

            <input

                className="basket-search"

                placeholder="Search saved products..."

                value={search}

                onChange={(e) =>

                    setSearch(e.target.value)

                }

            />

            <p className="selected-count">

                {helperText()}

            </p>

            {

                selectedProducts.length === 2 && (

                    <div className="compare-preview">

                        <div className="preview-card">

                            <img

                                src={selectedProducts[0].image}

                                alt={selectedProducts[0].title}

                            />

                        </div>

                        <div className="preview-divider">

                            VS

                        </div>

                        <div className="preview-card">

                            <img

                                src={selectedProducts[1].image}

                                alt={selectedProducts[1].title}

                            />

                        </div>

                    </div>

                )

            }

            {

                filteredBasket.length === 0 ? (

                    <div className="basket-empty">

                        <h4>

                            Nothing matched your search.

                        </h4>

                        <p>

                            Try another keyword or save more products.

                        </p>

                    </div>

                ) : (

                    filteredBasket.map(product => {

                        const selected = selectedProducts.some(

                            item => item.url === product.url

                        );

                        return (

                            <article

                                key={product.url}

                                className={

                                    selected

                                        ? "basket-item selected"

                                        : "basket-item"

                                }

                                onClick={() =>

                                    toggleProduct(product)

                                }

                            >

                                <img

                                    src={product.image}

                                    alt={product.title}

                                />

                                <div className="basket-info">

                                    <h4>

                                        {product.title}

                                    </h4>

                                    <small>

                                        {product.price}

                                    </small>

                                </div>

                                {

                                    selected && (

                                        <div className="selected-badge">

                                            ✓

                                        </div>

                                    )

                                }

                            </article>

                        );

                    })

                )

            }

            <button

                className="compare-btn"

                disabled={

                    selectedProducts.length !== 2 ||

                    loading

                }

                onClick={compareProducts}

            >

                {

                    loading

                        ? "Analyzing both products..."

                        : selectedProducts.length === 2

                        ? "Compare with BuyWise AI"

                        : `Select ${2 - selectedProducts.length} More`

                }

            </button>

        </section>

    );

}