import BaseScraper from "../BaseScraper";

export default class GenericScraper extends BaseScraper {

    extract() {

        const product = {

            title: this.extractTitle(),

            brand: this.extractBrand(),

            price: this.extractPrice(),

            originalPrice: this.extractOriginalPrice(),

            rating: this.extractRating(),

            reviewCount: this.extractReviewCount(),

            image: this.extractImage(),

            description: this.extractDescription(),

            seller: "",

            availability: "",

            category: "",

            url: window.location.href

        };

        if (!product.title) {

            return null;

        }

        return product;

    }

    extractTitle() {

        return (

            this.meta("og:title") ||

            this.text("h1") ||

            this.document.title ||

            ""

        );

    }

    extractBrand() {

        return (

            this.meta("product:brand") ||

            this.attribute(

                '[itemprop="brand"]',

                "content"

            ) ||

            ""

        );

    }

    extractPrice() {

        return (

            this.meta("product:price:amount") ||

            this.attribute(

                '[itemprop="price"]',

                "content"

            ) ||

            this.text(

                ".price"

            ) ||

            this.text(

                "[class*=price]"

            ) ||

            ""

        );

    }

    extractOriginalPrice() {

        return (

            this.text(

                ".original-price"

            ) ||

            this.text(

                ".mrp"

            ) ||

            ""

        );

    }

    extractRating() {

        return (

            this.meta("product:rating") ||

            this.attribute(

                '[itemprop="ratingValue"]',

                "content"

            ) ||

            ""

        );

    }

    extractReviewCount() {

        return (

            this.attribute(

                '[itemprop="reviewCount"]',

                "content"

            ) ||

            ""

        );

    }

    extractImage() {

        return (

            this.meta("og:image") ||

            this.image("img") ||

            ""

        );

    }

    extractDescription() {

        return (

            this.meta("description") ||

            this.attribute(

                '[name="description"]',

                "content"

            ) ||

            ""

        );

    }

}