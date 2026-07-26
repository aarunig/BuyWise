import "./ProductCard.css";
import { useBuyWise } from "../context/BuyWiseContext";

export default function ProductCard() {

    const { currentProduct, basket = [] } = useBuyWise();

    if (!currentProduct) {

        return null;

    }

    const isSaved = basket.some(

        item => item.url === currentProduct.url

    );

    const highlights = [

        currentProduct.material,

        currentProduct.colour,

        currentProduct.fit,

        currentProduct.style,

        currentProduct.occasion

    ]

        .filter(Boolean)

        .slice(0, 5);

    return (

        <section className="bw-product-section">

            <div className="bw-product-header">

                <div>

                    <span className="bw-kicker">

                        PRODUCT DETAILS

                    </span>

                    <h2 className="bw-heading">

                        About this Product

                    </h2>

                </div>

                {

                    isSaved && (

                        <div className="bw-saved-pill">

                            Saved

                        </div>

                    )

                }

            </div>

            <article className="bw-product-card">

                <div className="bw-image-column">

                    {

                        currentProduct.image

                            ? (

                                <img

                                    src={currentProduct.image}

                                    alt={currentProduct.title}

                                    className="bw-product-image"

                                />

                            )

                            : (

                                <div className="bw-image-placeholder">

                                    No Image Available

                                </div>

                            )

                    }

                </div>

                <div className="bw-info-column">

                    {

                        currentProduct.brand && (

                            <div className="bw-brand">

                                {currentProduct.brand}

                            </div>

                        )

                    }

                    <h1 className="bw-title">

                        {currentProduct.title}

                    </h1>

                    <div className="bw-price-row">

                        {

                            currentProduct.price && (

                                <span className="bw-current-price">

                                    {currentProduct.price}

                                </span>

                            )

                        }

                        {

                            currentProduct.originalPrice && (

                                <span className="bw-original-price">

                                    {currentProduct.originalPrice}

                                </span>

                            )

                        }

                        {

                            currentProduct.discount && (

                                <span className="bw-discount">

                                    {currentProduct.discount}

                                </span>

                            )

                        }

                    </div>

                    {

                        (

                            currentProduct.rating ||

                            currentProduct.reviewCount

                        ) && (

                            <div className="bw-rating">

                                {

                                    currentProduct.rating && (

                                        <span>

                                            ★ {currentProduct.rating}

                                        </span>

                                    )

                                }

                                {

                                    currentProduct.reviewCount && (

                                        <span>

                                            {currentProduct.reviewCount} Reviews

                                        </span>

                                    )

                                }

                            </div>

                        )

                    }

                    {

                        (

                            currentProduct.availability ||

                            currentProduct.seller

                        ) && (

                            <div className="bw-meta-card">

                                {

                                    currentProduct.availability && (

                                        <div className="bw-meta-row">

                                            <span>

                                                Availability

                                            </span>

                                            <strong>

                                                {currentProduct.availability}

                                            </strong>

                                        </div>

                                    )

                                }

                                {

                                    currentProduct.seller && (

                                        <div className="bw-meta-row">

                                            <span>

                                                Seller

                                            </span>

                                            <strong>

                                                {currentProduct.seller}

                                            </strong>

                                        </div>

                                    )

                                }

                            </div>

                        )

                    }

                    {

                        highlights.length > 0 && (

                            <div className="bw-tag-section">

                                <div className="bw-tag-title">

                                    Product Highlights

                                </div>

                                <div className="bw-tags">

                                    {

                                        highlights.map(

                                            (tag, index) => (

                                                <span

                                                    key={index}

                                                    className="bw-tag"

                                                >

                                                    {tag}

                                                </span>

                                            )

                                        )

                                    }

                                </div>

                            </div>

                        )

                    }

                </div>

            </article>

        </section>

    );

}