import { useMemo } from "react";

import BuyWiseHeader from "../components/BuyWiseHeader";
import VerdictSection from "../components/VerdictSection";
import ProductCard from "../components/ProductCard";
import ActionButtons from "../components/ActionButtons";
import ChatBox from "../components/ChatBox";
import ShoppingMemory from "../components/ShoppingMemory";
import Footer from "../components/Footer";

import { useBuyWise } from "../context/BuyWiseContext";

import { toggleCompare } from "../storage/CompareBasket";

import "./sidepanel.css";

export default function App() {
    const {
        currentProduct,
        basket,
        refreshBasket,
        setSelectedProducts
    } = useBuyWise();

    /* =====================================================
       Is Current Product Saved?
    ===================================================== */

    const productSaved = useMemo(() => {
        if (!currentProduct) {
            return false;
        }

        return basket.some(
            item => item.url === currentProduct.url
        );
    }, [basket, currentProduct]);

    /* =====================================================
       Buy
    ===================================================== */

    function handleBuy() {
        if (!currentProduct?.url) return;

        window.open(currentProduct.url, "_blank");
    }

    /* =====================================================
       Save / Unsave
    ===================================================== */

    async function handleSave() {
        if (!currentProduct) return;

        try {
            await toggleCompare(currentProduct);
            await refreshBasket();
        } catch (error) {
            console.error("Save Product Error", error);
        }
    }

    /* =====================================================
       Compare
    ===================================================== */

    function handleCompare() {
        if (!currentProduct) return;

        setSelectedProducts([currentProduct]);

        console.log("Compare:", currentProduct.title);
    }

    /* =====================================================
       Share
    ===================================================== */

    async function handleShare() {
        if (!currentProduct) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: currentProduct.title,
                    text: currentProduct.title,
                    url: currentProduct.url
                });
            } else {
                await navigator.clipboard.writeText(
                    currentProduct.url
                );

                alert("Product link copied.");
            }
        } catch (error) {
            console.error("Share Error", error);
        }
    }

    /* =====================================================
       Loading State
    ===================================================== */

    if (!currentProduct) {
        return (
            <main className="buywise-app">
                <BuyWiseHeader />

                <div className="empty-state">
                    <h3>No product detected</h3>

                    <p>
                        Open an Amazon or Flipkart product page
                        to start using BuyWise.
                    </p>
                </div>

                <Footer />
            </main>
        );
    }

    /* =====================================================
       Render
    ===================================================== */

    return (
        <main className="buywise-app">

            <BuyWiseHeader />

            <VerdictSection />

            <ProductCard />

            <ActionButtons
                onBuy={handleBuy}
                onSave={handleSave}
                onCompare={handleCompare}
                onShare={handleShare}
                saved={productSaved}
            />

            <ChatBox />

            <ShoppingMemory />

            <Footer />

        </main>
    );
}