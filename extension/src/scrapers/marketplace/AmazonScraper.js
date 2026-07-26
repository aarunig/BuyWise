import BaseScraper from "../BaseScraper";
import { createProduct } from "../../models/ProductModel";

export default class AmazonScraper extends BaseScraper {

    firstText(selectors = []) {
        for (const selector of selectors) {
            const value = this.text(selector).trim();
            if (value) return value;
        }
        return "";
    }

    firstAttr(selectors = [], attr = "src") {
        for (const selector of selectors) {
            const value = this.attribute(selector, attr).trim();
            if (value) return value;
        }
        return "";
    }

    cleanNumber(price) {
        if (!price) return NaN;

        return parseFloat(
            price.replace(/[^\d.]/g, "")
        );
    }

    extract() {

        const product = createProduct();

        product.source = "Amazon";
        product.url = window.location.href;

        // -------------------------
        // Title
        // -------------------------

        product.title = this.firstText([
            "#productTitle",
            "#title",
            "h1 span",
            "#centerCol h1"
        ])
            .replace(/\s+/g, " ")
            .trim();

        // -------------------------
        // Brand
        // -------------------------

        product.brand = this.firstText([
            "#bylineInfo",
            "#brand",
            ".po-brand .po-break-word",
            "#bylineInfo_feature_div a"
        ])
            .replace("Visit the", "")
            .replace("Brand:", "")
            .replace("Store", "")
            .replace(/\s+/g, " ")
            .trim();

        // -------------------------
        // Current Price
        // -------------------------

        product.price = this.cleanPrice(

            this.firstText([

                "#apex-pricetopay-accessibility-label",

                "#corePriceDisplay_desktop_feature_div #apex-pricetopay-accessibility-label",

                ".apex-pricetopay-value",

                ".priceToPay",

                ".priceToPay .a-price-whole",

                ".reinventPricePriceToPayMargin",

                ".a-price .a-offscreen"

            ])

        );

        // -------------------------
        // Original Price
        // -------------------------

        const originalPrice = this.cleanPrice(

            this.firstText([

                ".basisPrice .a-offscreen",

                ".priceBlockStrikePriceString",

                ".priceBlockStrikePrice",

                ".a-text-price .a-offscreen"

            ])

        );

        product.originalPrice = "";

        if (originalPrice && product.price) {

            const current = this.cleanNumber(product.price);

            const original = this.cleanNumber(originalPrice);

            if (

                !isNaN(current) &&
                !isNaN(original) &&
                original > current

            ) {

                product.originalPrice = originalPrice;

            }

        }

        // -------------------------
        // Discount
        // -------------------------

        product.discount = this.firstText([

            ".savingsPercentage",

            ".reinventPriceSavingsPercentageMargin",

            ".savingPriceOverride",

            ".savingPriceOverrideEdlp"

        ])
            .replace("(", "")
            .replace(")", "")
            .trim();

        if (!product.originalPrice) {

            product.discount = "";

        }

        // -------------------------
        // Rating
        // -------------------------

        product.rating = (

            this.attribute("#acrPopover", "title") ||

            this.firstText([

                ".a-icon-alt",

                "[data-hook='rating-out-of-text']"

            ])

        )
            .replace(" out of 5 stars", "")
            .trim();

        // -------------------------
        // Review Count
        // -------------------------

        product.reviewCount = this.firstText([

            "#acrCustomerReviewText",

            "[data-hook='total-review-count']",

            "#reviewsMedley span[data-hook='total-review-count']"

        ])
            .replace("ratings", "")
            .replace("rating", "")
            .replace("global", "")
            .trim();

        // -------------------------
        // Availability
        // -------------------------

        product.availability = this.firstText([

            "#availability span",

            "#availability",

            ".a-color-success",

            ".a-color-price"

        ]);

        // -------------------------
        // Seller
        // -------------------------

        product.seller = this.firstText([

            "#sellerProfileTriggerId",

            "#merchant-info",

            "#shipsFromSoldBy_feature_div"

        ]);

        // -------------------------
        // Main Image
        // -------------------------

        product.image = this.firstAttr([

            "#landingImage",

            "#imgBlkFront",

            "#main-image",

            "#imgTagWrapperId img"

        ]);

        // -------------------------
        // Additional Images
        // -------------------------

        product.images = [

            ...new Set(

                [

                    ...document.querySelectorAll(

                        "#altImages img, #imageBlockThumbs img"

                    )

                ]

                    .map(img =>
                        img.src
                            .replace(/\._.*_\./, ".")
                            .trim()
                    )

                    .filter(Boolean)

            )

        ];

        // -------------------------
        // Description
        // -------------------------

        product.description =

            this.meta("description") ||

            this.firstText([

                "#feature-bullets",

                "#productDescription",

                "#bookDescription_feature_div"

            ]);

        // -------------------------
        // Category
        // -------------------------

        product.category = this.firstText([

            "#wayfinding-breadcrumbs_feature_div",

            "#wayfinding-breadcrumbs_container",

            "#wayfinding-breadcrumbs_feature_div ul"

        ])

            .replace(/\s+/g, " ")

            .trim();

        // -------------------------
        // Features
        // -------------------------

        const bulletSelectors = [

            "#feature-bullets li",

            "#feature-bullets ul li",

            "#feature-bullets span.a-list-item"

        ];

        let bullets = [];

        for (const selector of bulletSelectors) {

            bullets = [...document.querySelectorAll(selector)];

            if (bullets.length) break;

        }

        product.features = bullets

            .map(item => item.textContent.trim())

            .filter(text =>
                text &&
                text.length > 3 &&
                !text.includes("Make sure") &&
                !text.includes("Report an issue")
            );

        // -------------------------
        // Product Details
        // -------------------------
const rows = [

    ...document.querySelectorAll(

        "#productDetails_techSpec_section_1 tr," +
        "#productDetails_detailBullets_sections1 tr," +
        "#productOverview_feature_div tr," +
        "#detailBullets_feature_div li"

    )

];

// -------------------------
// Table Layout
// -------------------------

rows.forEach(row => {

    let key = "";
    let value = "";

    const th = row.querySelector("th");
    const td = row.querySelector("td");

    if (th && td) {

        key = th.textContent.trim().toLowerCase();
        value = td.textContent.trim();

    } else {

        const spans = row.querySelectorAll("span");

        if (spans.length >= 2) {

            key = spans[0].textContent
                .replace(":", "")
                .trim()
                .toLowerCase();

            value = spans[1].textContent.trim();

        }

    }

    if (!key || !value) return;

    if (key.includes("colour") || key.includes("color")) {

        product.colour = value;

    }

    else if (key.includes("material")) {

        product.material = value;

    }

    else if (key.includes("fabric")) {

        product.material = value;

    }

    else if (key.includes("fit")) {

        product.fit = value;

    }

    else if (key.includes("pattern")) {

        product.pattern = value;

    }

    else if (key.includes("style")) {

        product.style = value;

    }

    else if (key.includes("occasion")) {

        product.occasion = value;

    }

    else if (key.includes("department")) {

        product.department = value;

    }

    else if (key.includes("manufacturer")) {

        product.manufacturer = value;

    }

    else if (key.includes("country")) {

        product.countryOfOrigin = value;

    }

});

// -------------------------
// Specifications
// -------------------------

product.specifications = {

    colour: product.colour,
    material: product.material,
    fit: product.fit,
    pattern: product.pattern,
    style: product.style,
    occasion: product.occasion,
    department: product.department,
    manufacturer: product.manufacturer,
    countryOfOrigin: product.countryOfOrigin

};

// -------------------------
// Cleanup
// -------------------------

if (
    product.originalPrice &&
    product.price &&
    this.cleanNumber(product.originalPrice) <=
    this.cleanNumber(product.price)
) {

    product.originalPrice = "";
    product.discount = "";

}

// Remove duplicate image

product.images = product.images.filter(
    img => img !== product.image
);

// -------------------------
// Confidence Score
// -------------------------

let score = 0;

if (product.title) score += 20;
if (product.brand) score += 10;
if (product.price) score += 20;
if (product.image) score += 15;
if (product.description) score += 10;
if (product.rating) score += 10;
if (product.reviewCount) score += 5;
if (product.category) score += 5;
if (product.features.length) score += 5;

product.confidence = Math.min(score, 99);

// -------------------------
// Metadata
// -------------------------

product.extractionMethod = "AmazonScraper";

product.extractedAt = Date.now();

// -------------------------
// Debug Logs
// -------------------------

console.groupCollapsed("🛒 BuyWise Amazon Extraction");

console.table({

    title: product.title,

    brand: product.brand,

    price: product.price,

    originalPrice: product.originalPrice,

    discount: product.discount,

    rating: product.rating,

    reviews: product.reviewCount,

    seller: product.seller,

    availability: product.availability,

    category: product.category,

    confidence: product.confidence

});

console.log("Features", product.features);

console.log("Specifications", product.specifications);

console.groupEnd();

// -------------------------
// Return
// -------------------------

return product;

    }

}