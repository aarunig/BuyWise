export function createProduct() {

    return {

        // -------------------------------------------------
        // Basic Information
        // -------------------------------------------------

        title: "",

        brand: "",

        category: "",

        description: "",

        image: "",

        images: [],

        url: "",

        source: "",

        // -------------------------------------------------
        // Pricing
        // -------------------------------------------------

        price: "",

        originalPrice: "",

        discount: "",

        // -------------------------------------------------
        // Reviews
        // -------------------------------------------------

        rating: "",

        reviewCount: "",

        availability: "",

        seller: "",

        // -------------------------------------------------
        // Shopping Signals
        // -------------------------------------------------

        colour: "",

        material: "",

        fit: "",

        pattern: "",

        style: "",

        occasion: "",

        department: "",

        manufacturer: "",

        countryOfOrigin: "",

        // -------------------------------------------------
        // Rich Data
        // -------------------------------------------------

        features: [],

        specifications: {},

        // -------------------------------------------------
        // Metadata
        // -------------------------------------------------

        extractionMethod: "",

        confidence: 0,

        extractedAt: Date.now()

    };

}