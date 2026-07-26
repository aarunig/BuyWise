import { createContext, useContext, useEffect, useState } from "react";

import {
  getSavedProducts,
  getComparisonProducts,
  canCompare
} from "../storage/CompareBasket";
import { getBuyWiseDecision } from "../brain/BuyWiseBrain";
import { buildShoppingMemory } from "../brain/ShoppingMemory";

const BuyWiseContext = createContext();

export function BuyWiseProvider({ children }) {
  const [loading, setLoading] = useState(true);

  const [currentProduct, setCurrentProduct] = useState(null);

  const [basket, setBasket] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [decision, setDecision] = useState(null);

  const [metrics, setMetrics] = useState(null);

  const [shoppingMemory, setShoppingMemory] = useState({
    totalSaved: 0,
    favouriteBrands: [],
    favouriteColours: [],
    favouriteCategories: [],
    averageBudget: 0
  });

  const [messages, setMessages] = useState([]);

  // ------------------------------
  // Comparison state (new)
  // ------------------------------
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonBase, setComparisonBase] = useState(null);
  const [comparisonTarget, setComparisonTarget] = useState(null);
  const [comparisonReady, setComparisonReady] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  /* ------------------------------------------------ */

  async function refreshBasket() {
    const saved = await getSavedProducts();
    setBasket(saved);
    setShoppingMemory(buildShoppingMemory(saved));
  }

  /* ------------------------------------------------ */

  async function refreshCurrentProduct() {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        ["buywise_current_product"],
        async (result) => {
          const product = result.buywise_current_product || null;
          setCurrentProduct(product);

          if (product) {
            try {
              const aiDecision = await getBuyWiseDecision(product);
              setDecision(aiDecision);
              setMetrics(aiDecision.metrics);
            } catch (error) {
              console.error("BuyWise Decision Error", error);
              setDecision(null);
              setMetrics(null);
            }
          } else {
            setDecision(null);
            setMetrics(null);
          }

          resolve();
        }
      );
    });
  }

  /* ------------------------------------------------ */
  // New: refresh comparison state from storage
  /* ------------------------------------------------ */

  async function refreshComparisonState() {
    const ready = await canCompare();
    const products = ready ? await getComparisonProducts() : null;

    setComparisonReady(!!ready);

    if (products && products.first && products.second) {
      setComparisonMode(true);
      setComparisonBase(products.first);
      setComparisonTarget(products.second);
    } else {
      // If queue not ready, we keep mode but clear target/base
      setComparisonBase(products?.first || null);
      setComparisonTarget(products?.second || null);
    }
  }

  /* ------------------------------------------------ */

  async function initialize() {
    setLoading(true);
    await Promise.all([
      refreshCurrentProduct(),
      refreshBasket(),
      refreshComparisonState()
    ]);
    setLoading(false);
  }

  /* ------------------------------------------------ */

  useEffect(() => {
    initialize();

    function storageListener(changes, area) {
      if (area !== "local") return;

      if (changes.buywise_current_product) {
        refreshCurrentProduct();
      }
      if (changes.buywise_compare_basket) {
        refreshBasket();
        refreshComparisonState();
      }
    }

    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  /* ------------------------------------------------ */
  // Comparison helpers exposed to components
  /* ------------------------------------------------ */

  function startComparison(baseProduct) {
    setComparisonMode(true);
    setComparisonBase(baseProduct || null);
    setComparisonTarget(null);
    setComparisonReady(false);
    setComparisonResult(null);
  }

  function clearComparison() {
    setComparisonMode(false);
    setComparisonBase(null);
    setComparisonTarget(null);
    setComparisonReady(false);
    setComparisonResult(null);
  }

  function setComparisonBaseProduct(product) {
    setComparisonBase(product || null);
  }

  function setComparisonTargetProduct(product) {
    setComparisonTarget(product || null);
  }

  /* ------------------------------------------------ */

  return (
    <BuyWiseContext.Provider
      value={{
        loading,

        currentProduct,
        setCurrentProduct,
        refreshCurrentProduct,

        basket,
        setBasket,
        refreshBasket,

        selectedProducts,
        setSelectedProducts,

        decision,
        setDecision,

        metrics,
        setMetrics,

        shoppingMemory,
        setShoppingMemory,

        messages,
        setMessages,

        // Comparison state & actions (new)
        comparisonMode,
        setComparisonMode,
        comparisonBase,
        setComparisonBase: setComparisonBaseProduct,
        comparisonTarget,
        setComparisonTarget: setComparisonTargetProduct,
        comparisonReady,
        setComparisonReady,
        comparisonResult,
        setComparisonResult,
        startComparison,
        clearComparison,
        refreshComparisonState
      }}
    >
      {children}
    </BuyWiseContext.Provider>
  );
}

export function useBuyWise() {
  return useContext(BuyWiseContext);
}