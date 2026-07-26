import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import ContentOverlay from "./views/ContentOverlay.jsx";
import ScraperFactory from "../scrapers/ScraperFactory";

console.log("🛍 BuyWise Loaded");

/* ==========================================================
   Comparison Mode Helpers
========================================================== */

const COMPARE_STORAGE_KEY = "buywise_compare_basket";

async function getComparisonState() {
    return new Promise((resolve) => {
        chrome.storage.local.get([COMPARE_STORAGE_KEY], (result) => {
            const storage = result[COMPARE_STORAGE_KEY] || {};
            resolve({
                comparisonMode: !!storage.comparisonMode,
                comparisonBaseUrl: storage.comparisonBaseUrl || null,
                comparisonQueue: Array.isArray(storage.comparisonQueue)
                    ? storage.comparisonQueue
                    : []
            });
        });
    });
}

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

/* ==========================================================
   Product Extraction & Notifications
========================================================== */

async function updateCurrentProduct() {
    try {
        const product = ScraperFactory.extractProduct();
        if (!product) {
            console.warn("No product detected.");
            return;
        }

        console.log("📦 Product Extracted");
        console.table(product);

        // Always store current product for normal BuyWise behavior
        await chrome.storage.local.set({
            buywise_current_product: product
        });
        chrome.runtime.sendMessage({
            type: "BUYWISE_PRODUCT_UPDATED"
        });

        // Comparison workflow: detect second product
        const {
            comparisonMode,
            comparisonBaseUrl,
            comparisonQueue
        } = await getComparisonState();

        if (comparisonMode) {
            const currentUrl = normalizeUrl(product.url || window.location.href);

            // If we have a base URL and current page is different, treat as second product
            if (
                comparisonBaseUrl &&
                normalizeUrl(comparisonBaseUrl) !== currentUrl
            ) {
                const alreadyInQueue = comparisonQueue.some(
                    (p) => normalizeUrl(p.url) === currentUrl
                );

                if (!alreadyInQueue) {
                    // Store second product in comparisonQueue via storage
                    const updatedQueue = [
                        ...comparisonQueue.slice(0, 1), // keep base as first
                        {
                            ...product,
                            url: currentUrl,
                            queuedAt: Date.now()
                        }
                    ].slice(0, 2); // ensure max 2

                    chrome.storage.local.set(
                        {
                            [COMPARE_STORAGE_KEY]: {
                                savedProducts:
                                    (result[COMPARE_STORAGE_KEY] &&
                                        Array.isArray(
                                            result[COMPARE_STORAGE_KEY]
                                                .savedProducts
                                        )) ||
                                    [],
                                comparisonQueue: updatedQueue,
                                comparisonMode: true,
                                comparisonBaseUrl: comparisonBaseUrl
                            }
                        },
                        () => {
                            console.log("✅ Comparison pair ready");
                            chrome.runtime.sendMessage({
                                type: "BUYWISE_COMPARISON_READY",
                                payload: {
                                    first: updatedQueue[0],
                                    second: updatedQueue[1]
                                }
                            });
                        }
                    );
                }
            }
        }
    } catch (error) {
        console.error("BuyWise Extraction Error", error);
    }
}

updateCurrentProduct();

const observer = new MutationObserver(() => {
    clearTimeout(window.buywiseTimer);
    window.buywiseTimer = setTimeout(() => {
        updateCurrentProduct();
    }, 1000);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

const container = document.createElement("div");
container.id = "buywise-overlay";
document.body.appendChild(container);

createRoot(container).render(
    <StrictMode>
        <ContentOverlay />
    </StrictMode>
);