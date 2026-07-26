import { buildContext } from "./ContextBuilder";

const API_URL = "http://127.0.0.1:5000/api/chat";

const REQUEST_TIMEOUT = 30000;

/**
 * Sends the shopping context to BuyWise AI.
 */

export async function askBuyWise({

    product,

    decision,

    metrics,

    shoppingMemory,

    compareBasket,

    question,

    chatHistory = []

}) {

    const context = buildContext({

        product,

        decision,

        metrics,

        shoppingMemory,

        compareBasket,

        question,

        chatHistory

    });

    const controller = new AbortController();

    const timeout = setTimeout(() => {

        controller.abort();

    }, REQUEST_TIMEOUT);

    try {

        const response = await fetch(

            API_URL,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(context),

                signal: controller.signal

            }

        );

        clearTimeout(timeout);

        if (!response.ok) {

            throw new Error(

                `Backend returned ${response.status}`

            );

        }

        const data = await response.json();

        if (!data.reply) {

            throw new Error(

                "Empty response from BuyWise."

            );

        }

        return data.reply;

    }

    catch (error) {

        clearTimeout(timeout);

        console.error(

            "BuyWise Chat Error:",

            error

        );

        if (error.name === "AbortError") {

            return "BuyWise is taking longer than expected. Please try again.";

        }

        return "I'm having trouble connecting to BuyWise right now. Please try again in a moment.";

    }

}