import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import { BuyWiseProvider } from "../context/BuyWiseContext";

import "./index.css";

createRoot(document.getElementById("root")).render(

    <StrictMode>

        <BuyWiseProvider>

            <App />

        </BuyWiseProvider>

    </StrictMode>

);