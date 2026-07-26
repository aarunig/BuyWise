import JsonLdScraper from "./fallback/JsonLdScraper";
import GenericScraper from "./fallback/GenericScraper";

import AmazonScraper from "./marketplace/AmazonScraper";
import FlipkartScraper from "./marketplace/FlipkartScraper";

export default class ScraperFactory {

    static getScraper() {

        const host = window.location.hostname.toLowerCase();

        if (host.includes("amazon")) {

            return new AmazonScraper();

        }

        if (host.includes("flipkart")) {

            return new FlipkartScraper();

        }

        return null;

    }

    static extractProduct() {

        // Dedicated scraper

        const scraper = this.getScraper();

        if (scraper) {

            try {

                const product = scraper.extract();

                if (product?.title) {

                    console.log("✓ Dedicated scraper used");

                    return product;

                }

            }

            catch (error) {

                console.error(error);

            }

        }

        // JSON-LD fallback

        try {

            const jsonLd = new JsonLdScraper();

            const product = jsonLd.extract();

            if (product?.title) {

                console.log("✓ JSON-LD scraper used");

                return product;

            }

        }

        catch (error) {

            console.error(error);

        }

        // Generic fallback

        try {

            const generic = new GenericScraper();

            const product = generic.extract();

            if (product?.title) {

                console.log("✓ Generic scraper used");

                return product;

            }

        }

        catch (error) {

            console.error(error);

        }

        console.warn("BuyWise could not extract a product.");

        return null;

    }

}