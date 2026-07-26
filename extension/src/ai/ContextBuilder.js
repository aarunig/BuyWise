/**
 * Builds the complete context sent to the backend.
 */

export function buildContext({

    product,

    decision,

    metrics,

    shoppingMemory = {},

    compareBasket = [],

    question,

    chatHistory = []

}) {

    return {

        timestamp: new Date().toISOString(),

        // Flask expects this field
        message: question,

        // Keep the original question as well
        question,

        product,

        decision,

        metrics,

        shoppingMemory,

        compareBasket,

        chatHistory

    };

}