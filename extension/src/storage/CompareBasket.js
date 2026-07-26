const STORAGE_KEY = "buywise_compare_basket";

/* ==========================================================
   Storage Helpers
========================================================== */

function createDefaultStorage() {
    return {
        savedProducts: [],
        comparisonQueue: [],
        comparisonMode: false,
        comparisonBaseUrl: null
    };
}

async function readStorage() {
    return new Promise((resolve) => {
        chrome.storage.local.get(
            [STORAGE_KEY],
            (result) => {
                const storage = result[STORAGE_KEY];
                if (!storage || typeof storage !== "object") {
                    resolve(createDefaultStorage());
                    return;
                }
                resolve({
                    savedProducts:
                        Array.isArray(storage.savedProducts)
                            ? storage.savedProducts
                            : [],
                    comparisonQueue:
                        Array.isArray(storage.comparisonQueue)
                            ? storage.comparisonQueue
                            : [],
                    comparisonMode:
                        typeof storage.comparisonMode === "boolean"
                            ? storage.comparisonMode
                            : false,
                    comparisonBaseUrl:
                        typeof storage.comparisonBaseUrl === "string"
                            ? storage.comparisonBaseUrl
                            : null
                });
            }
        );
    });
}

async function writeStorage(storage) {
    return new Promise((resolve) => {
        chrome.storage.local.set(
            {
                [STORAGE_KEY]: storage
            },
            () => resolve()
        );
    });
}

/* ==========================================================
   URL Helpers
========================================================== */

function normalizeUrl(url = "") {
    if (!url) {
        return "";
    }
    try {
        const parsed = new URL(url);
        return parsed.origin + parsed.pathname;
    } catch {
        return url;
    }
}

function isValidProduct(product) {
    return (
        product &&
        typeof product === "object" &&
        normalizeUrl(product.url)
    );
}

/* ==========================================================
   Public Storage
========================================================== */

export async function getStorage() {
    return await readStorage();
}

export async function saveStorage(storage) {
    await writeStorage(storage);
}

/* ==========================================================
   Saved Products API
========================================================== */

export async function getSavedProducts() {
    const storage = await readStorage();
    return storage.savedProducts;
}

export async function isSaved(url) {
    const storage = await readStorage();
    const normalizedUrl = normalizeUrl(url);
    return storage.savedProducts.some(
        (product) =>
            normalizeUrl(product.url) === normalizedUrl
    );
}

export async function addSavedProduct(product) {
    if (!isValidProduct(product)) {
        throw new Error("Invalid product.");
    }

    const storage = await readStorage();
    const normalizedUrl = normalizeUrl(product.url);
    const exists = storage.savedProducts.some(
        (item) =>
            normalizeUrl(item.url) === normalizedUrl
    );

    if (exists) {
        return false;
    }

    storage.savedProducts.unshift({
        ...product,
        url: normalizedUrl,
        savedAt: Date.now()
    });

    await writeStorage(storage);
    return true;
}

export async function removeSavedProduct(url) {
    const storage = await readStorage();
    const normalizedUrl = normalizeUrl(url);
    const previousLength = storage.savedProducts.length;

    storage.savedProducts = storage.savedProducts.filter(
        (product) =>
            normalizeUrl(product.url) !== normalizedUrl
    );

    if (storage.savedProducts.length === previousLength) {
        return false;
    }

    await writeStorage(storage);
    return true;
}

export async function toggleSavedProduct(product) {
    if (!isValidProduct(product)) {
        throw new Error("Invalid product.");
    }

    const alreadySaved = await isSaved(product.url);
    if (alreadySaved) {
        await removeSavedProduct(product.url);
        return {
            saved: false
        };
    }

    await addSavedProduct(product);
    return {
        saved: true
    };
}

export async function getSavedProduct(url) {
    const storage = await readStorage();
    const normalizedUrl = normalizeUrl(url);

    return (
        storage.savedProducts.find(
            (product) =>
                normalizeUrl(product.url) === normalizedUrl
        ) || null
    );
}

export async function clearSavedProducts() {
    const storage = await readStorage();
    storage.savedProducts = [];
    await writeStorage(storage);
}

export async function getSavedProductsCount() {
    const storage = await readStorage();
    return storage.savedProducts.length;
}

/* ==========================================================
   Comparison Queue API (low-level)
========================================================== */

const MAX_QUEUE_SIZE = 2;

export async function getComparisonQueue() {
    const storage = await readStorage();
    return storage.comparisonQueue;
}

export async function getComparisonQueueCount() {
    const storage = await readStorage();
    return storage.comparisonQueue.length;
}

export async function isInComparisonQueue(url) {
    const storage = await readStorage();
    const normalizedUrl = normalizeUrl(url);
    return storage.comparisonQueue.some(
        (product) =>
            normalizeUrl(product.url) === normalizedUrl
    );
}

export async function addToComparison(product) {
    if (!isValidProduct(product)) {
        throw new Error("Invalid product.");
    }

    const storage = await readStorage();
    const normalizedUrl = normalizeUrl(product.url);
    const exists = storage.comparisonQueue.some(
        (item) =>
            normalizeUrl(item.url) === normalizedUrl
    );

    if (exists) {
        return {
            success: false,
            reason: "already_exists",
            queue: storage.comparisonQueue
        };
    }

    if (storage.comparisonQueue.length >= MAX_QUEUE_SIZE) {
        return {
            success: false,
            reason: "queue_full",
            queue: storage.comparisonQueue
        };
    }

    storage.comparisonQueue.push({
        ...product,
        url: normalizedUrl,
        queuedAt: Date.now()
    });

    await writeStorage(storage);
    return {
        success: true,
        queue: storage.comparisonQueue
    };
}

export async function removeFromComparison(url) {
    const storage = await readStorage();
    const normalizedUrl = normalizeUrl(url);

    storage.comparisonQueue = storage.comparisonQueue.filter(
        (product) =>
            normalizeUrl(product.url) !== normalizedUrl
    );

    await writeStorage(storage);
    return storage.comparisonQueue;
}

export async function clearComparisonQueue() {
    const storage = await readStorage();
    storage.comparisonQueue = [];
    await writeStorage(storage);
}

export async function replaceComparisonProduct(index, product) {
    if (!isValidProduct(product)) {
        throw new Error("Invalid product.");
    }

    if (index !== 0 && index !== 1) {
        throw new Error("Queue index must be 0 or 1.");
    }

    const storage = await readStorage();
    storage.comparisonQueue[index] = {
        ...product,
        url: normalizeUrl(product.url),
        queuedAt: Date.now()
    };

    await writeStorage(storage);
    return storage.comparisonQueue;
}

export async function canCompare() {
    const storage = await readStorage();
    return storage.comparisonQueue.length === MAX_QUEUE_SIZE;
}

export async function getComparisonProducts() {
    const storage = await readStorage();
    if (storage.comparisonQueue.length !== MAX_QUEUE_SIZE) {
        return null;
    }

    return {
        first: storage.comparisonQueue[0],
        second: storage.comparisonQueue[1]
    };
}

export async function moveSavedProductToComparison(url) {
    const storage = await readStorage();
    const normalizedUrl = normalizeUrl(url);

    const product = storage.savedProducts.find(
        (item) =>
            normalizeUrl(item.url) === normalizedUrl
    );

    if (!product) {
        return {
            success: false,
            reason: "not_found"
        };
    }

    return await addToComparison(product);
}

/* ==========================================================
   Compatibility API (unchanged)
========================================================== */

export const getCompareBasket = getSavedProducts;
export const toggleCompare = toggleSavedProduct;
export const addToCompare = addSavedProduct;
export const removeFromCompare = removeSavedProduct;
export const getCompareCount = getSavedProductsCount;

/* ==========================================================
   Comparison Workflow Helpers (new)
========================================================== */

/**
 * Start comparison mode with a base product.
 * Sets comparisonMode=true, stores the base URL,
 * and initializes comparisonQueue with the base product.
 */
export async function startComparison(baseProduct) {
    if (!isValidProduct(baseProduct)) {
        throw new Error("Invalid base product.");
    }

    const storage = await readStorage();
    const baseUrl = normalizeUrl(baseProduct.url);

    // Reset queue to just the base product
    storage.comparisonQueue = [
        {
            ...baseProduct,
            url: baseUrl,
            queuedAt: Date.now()
        }
    ];

    storage.comparisonMode = true;
    storage.comparisonBaseUrl = baseUrl;

    await writeStorage(storage);
    return {
        comparisonMode: storage.comparisonMode,
        comparisonBaseUrl: storage.comparisonBaseUrl,
        queue: storage.comparisonQueue
    };
}

/**
 * Explicitly set the comparison base product without
 * changing existing saved-products APIs.
 */
export async function setComparisonBase(baseProduct) {
    return startComparison(baseProduct);
}

/**
 * Add a second product for comparison.
 * Prevents duplicates and ensures exactly two products.
 */
export async function addComparisonProduct(product) {
    if (!isValidProduct(product)) {
        throw new Error("Invalid comparison product.");
    }

    const storage = await readStorage();
    const normalizedUrl = normalizeUrl(product.url);

    // Prevent duplicate of base or existing target
    const exists = storage.comparisonQueue.some(
        (item) =>
            normalizeUrl(item.url) === normalizedUrl
    );
    if (exists) {
        return {
            success: false,
            reason: "already_exists",
            queue: storage.comparisonQueue
        };
    }

    if (storage.comparisonQueue.length >= MAX_QUEUE_SIZE) {
        return {
            success: false,
            reason: "queue_full",
            queue: storage.comparisonQueue
        };
    }

    storage.comparisonQueue.push({
        ...product,
        url: normalizedUrl,
        queuedAt: Date.now()
    });

    await writeStorage(storage);

    return {
        success: true,
        queue: storage.comparisonQueue
    };
}

/**
 * Clear comparison state completely.
 * Does not touch savedProducts.
 */
export async function clearComparison() {
    const storage = await readStorage();
    storage.comparisonQueue = [];
    storage.comparisonMode = false;
    storage.comparisonBaseUrl = null;
    await writeStorage(storage);
    return storage;
}

/**
 * Returns true when exactly two products are ready to compare.
 */
export async function isComparisonReady() {
    const storage = await readStorage();
    return storage.comparisonQueue.length === MAX_QUEUE_SIZE;
}

/**
 * Returns the current comparison products (first + second),
 * or null if comparison is not ready.
 */
export async function getComparisonProductsWorkflow() {
    return await getComparisonProducts();
}

/**
 * Helper: is comparison mode currently active?
 */
export async function isComparisonMode() {
    const storage = await readStorage();
    return !!storage.comparisonMode;
}

/**
 * Helper: get the base product (if any) for the current comparison.
 */
export async function getComparisonBase() {
    const storage = await readStorage();
    const baseUrl = storage.comparisonBaseUrl;
    if (!baseUrl) {
        return null;
    }
    return (
        storage.comparisonQueue.find(
            (p) => normalizeUrl(p.url) === baseUrl
        ) || null
    );
}