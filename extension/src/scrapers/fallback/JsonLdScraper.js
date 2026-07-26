import BaseScraper from "../BaseScraper";

export default class JsonLdScraper extends BaseScraper {

    extract() {

        try {

            const scripts = [

                ...this.document.querySelectorAll(

                    'script[type="application/ld+json"]'

                )

            ];

            for (const script of scripts) {

                let data;

                try {

                    data = JSON.parse(script.textContent);

                }

                catch {

                    continue;

                }

                const product = this.findProduct(data);

                if (product) {

                    return this.buildProduct(product);

                }

            }

        }

        catch (error) {

            console.error(

                "JSON-LD extraction failed",

                error

            );

        }

        return null;

    }

    findProduct(data) {

        if (!data) return null;

        if (Array.isArray(data)) {

            for (const item of data) {

                const found = this.findProduct(item);

                if (found) return found;

            }

        }

        if (typeof data !== "object") {

            return null;

        }

        if (

            data["@type"] === "Product" ||

            (Array.isArray(data["@type"]) &&

                data["@type"].includes("Product"))

        ) {

            return data;

        }

        if (data["@graph"]) {

            return this.findProduct(data["@graph"]);

        }

        for (const key in data) {

            const found = this.findProduct(data[key]);

            if (found) return found;

        }

        return null;

    }

    buildProduct(product) {

        const offer =

            Array.isArray(product.offers)

                ? product.offers[0]

                : product.offers || {};

        const rating =

            product.aggregateRating || {};

        return {

            title:

                product.name || "",

            brand:

                typeof product.brand === "object"

                    ? product.brand.name || ""

                    : product.brand || "",

            price:

                offer.price ||

                "",

            originalPrice:

                offer.highPrice ||

                "",

            rating:

                rating.ratingValue ||

                "",

            reviewCount:

                rating.reviewCount ||

                rating.ratingCount ||

                "",

            image:

                Array.isArray(product.image)

                    ? product.image[0]

                    : product.image ||

                      "",

            description:

                product.description ||

                "",

            seller:

                offer.seller?.name ||

                "",

            availability:

                offer.availability ||

                "",

            category:

                product.category ||

                "",

            url:

                window.location.href

        };

    }

}