var db = require('../conf/database');
const Product = require('../db/products');
const CartHelper = {};

CartHelper.getProductDetails = async (item) => {
    let product = await Product.getProductById(item.product_id);
    return product[0];
}

CartHelper.getTotals = (cartList) => {
    let subtotalPrice = 0;
    cartList.forEach(item => {
        // Calculates subtotal by getting sum of prices
        let price = item.price;
        let qty = item.quantity;
        subtotalPrice += (Number(price) * Number(qty));
    });
    let taxPrice = Number(subtotalPrice * .09);
    let shipPrice = 4.99;
    let totalPrice = subtotalPrice + taxPrice + shipPrice;
    return {
        subtotal: subtotalPrice.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}), 
        tax: taxPrice.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}),
        shipping: shipPrice.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}), 
        total: totalPrice.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})};
}

CartHelper.getCartList = async (results) => {
    const cartList = await Promise.all(results.map(async item => {
        const product = await CartHelper.getProductDetails(item);
        return {
            ...product, 
            quantity: item.quantity,
        };
    })); 
    return cartList;
}
module.exports = CartHelper;