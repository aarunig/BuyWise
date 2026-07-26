import BaseScraper from "../BaseScraper";
import { createProduct } from "../../models/ProductModel";

export default class FlipkartScraper extends BaseScraper {

    extract() {

        const product = createProduct();

        product.source = "Flipkart";

        product.url = window.location.href;

        // -------------------------
        // Title
        // -------------------------

        product.title =

            this.text("span.VU-ZEz")

            ||

            this.text("span.B_NuCI")

            ||

            this.text("h1");

        // -------------------------
        // Brand
        // -------------------------

        product.brand =

            product.title.split(" ")[0];

        // -------------------------
        // Current Price
        // -------------------------

        product.price =

            this.cleanPrice(

                this.text("div.Nx9bqj")

                ||

                this.text("div._30jeq3")

            );

        // -------------------------
        // Original Price
        // -------------------------

        product.originalPrice =

            this.cleanPrice(

                this.text("div.yRaY8j")

                ||

                this.text("div._3I9_wc")

            );

        // -------------------------
        // Rating
        // -------------------------

        product.rating =

            this.text("div.XQDdHH")

            ||

            this.text("div._3LWZlK");

        // -------------------------
        // Review Count
        // -------------------------

        product.reviewCount =

            this.text("span.Wphh3N")

            ||

            this.text("span._2_R_DZ");

        // -------------------------
        // Availability
        // -------------------------

        product.availability =

            this.text("div.Z8JjpR")

            ||

            "Available";

        // -------------------------
        // Seller
        // -------------------------

        product.seller =

            this.text("#sellerName")

            ||

            this.text("div._1RLviY");

        // -------------------------
        // Main Image
        // -------------------------

        product.image =

            this.attribute(

                "img.DByuf4",

                "src"

            )

            ||

            this.attribute(

                "img._396cs4",

                "src"

            );

        // -------------------------
        // Description
        // -------------------------

        product.description =

            this.meta("description")

            ||

            this.text("div._1mXcCf")

            ||

            this.text("div.yN+eNk");

        // -------------------------
        // Category
        // -------------------------

        product.category =

            this.text("div.r2CdBx");

        // -------------------------
        // Features
        // -------------------------

        product.features = [

            ...document.querySelectorAll(

                "li._7eSDEz"

            )

        ].map(item => item.textContent.trim());

        // -------------------------
        // Specifications
        // -------------------------

        document

            .querySelectorAll(

                "tr._3_6Uyw"

            )

            .forEach(row => {

                const cells = row.querySelectorAll("td");

                if (cells.length >= 2) {

                    product.specifications[

                        cells[0].innerText.trim()

                    ] =

                        cells[1].innerText.trim();

                }

            });

        // -------------------------
        // Metadata
        // -------------------------

        product.extractionMethod =

            "FlipkartScraper";

        product.confidence = 99;

        return product;

    }

}