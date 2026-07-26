export default class BaseScraper {

    constructor() {

        this.document = document;

        this.location = window.location;

    }

    // ----------

    text(selector) {

        const element = this.document.querySelector(selector);

        return element
            ? element.textContent.trim()
            : "";

    }

    // ----------

    html(selector) {

        const element = this.document.querySelector(selector);

        return element
            ? element.innerHTML.trim()
            : "";

    }

    // ----------

    attribute(selector, attribute) {

        const element = this.document.querySelector(selector);

        return element
            ? element.getAttribute(attribute) || ""
            : "";

    }

    // ----------

    image(selector) {

        return (

            this.attribute(selector, "src") ||

            this.attribute(selector, "data-src")

        );

    }

    // ----------

    meta(name) {

        const meta =

            this.document.querySelector(

                `meta[property="${name}"]`

            ) ||

            this.document.querySelector(

                `meta[name="${name}"]`

            );

        return meta

            ? meta.content

            : "";

    }

    // ----------

    cleanPrice(price) {

        if (!price) return "";

        return price

            .replace(/\s+/g, " ")

            .replace(/\n/g, "")

            .trim();

    }

    // ----------

    extract() {

        throw new Error(

            "Each scraper must implement extract()."

        );

    }

}