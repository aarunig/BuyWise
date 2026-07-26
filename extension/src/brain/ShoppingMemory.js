/**
 * BuyWise Shopping Memory
 *
 * Learns simple shopping preferences
 * from the products the user saves.
 */

export function buildShoppingMemory(basket = []) {

    const memory = {

        totalSaved: basket.length,

        favouriteBrands: [],

        favouriteColours: [],

        favouriteCategories: [],

        averageBudget: 0

    };

    if (!basket.length) {

        return memory;

    }

    const brands = {};
    const colours = {};
    const categories = {};

    let totalPrice = 0;
    let pricedProducts = 0;

    basket.forEach(product => {

        /* ------------------------ */
        /* Brand                    */
        /* ------------------------ */

        if (product.brand) {

            brands[product.brand] =

                (brands[product.brand] || 0) + 1;

        }

        /* ------------------------ */
        /* Colour                   */
        /* ------------------------ */

        if (product.colour) {

            colours[product.colour] =

                (colours[product.colour] || 0) + 1;

        }

        /* ------------------------ */
        /* Category                 */
        /* ------------------------ */

        if (product.category) {

            categories[product.category] =

                (categories[product.category] || 0) + 1;

        }

        /* ------------------------ */
        /* Budget                   */
        /* ------------------------ */

        if (product.price) {

            const price = Number(

                product.price
                    .toString()
                    .replace(/[^0-9]/g, "")

            );

            if (!isNaN(price) && price > 0) {

                totalPrice += price;

                pricedProducts++;

            }

        }

    });

    memory.favouriteBrands =

        Object.entries(brands)

            .sort((a, b) => b[1] - a[1])

            .slice(0, 3)

            .map(([brand]) => brand);

    memory.favouriteColours =

        Object.entries(colours)

            .sort((a, b) => b[1] - a[1])

            .slice(0, 3)

            .map(([colour]) => colour);

    memory.favouriteCategories =

        Object.entries(categories)

            .sort((a, b) => b[1] - a[1])

            .slice(0, 3)

            .map(([category]) => category);

    if (pricedProducts > 0) {

        memory.averageBudget = Math.round(

            totalPrice / pricedProducts

        );

    }

    return memory;

}