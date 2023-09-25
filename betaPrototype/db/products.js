var db = require('../conf/database');
const Product = {}

Product.getProductById = (productId) => {
    let query = `SELECT * FROM product WHERE id=?`;
    return db.execute(query, [productId])
    .then (([results, fields]) => {
        return Promise.resolve(results);
    })
    .catch((err) => Promise.reject(err));
};
Product.addToCart = (productId, sessionId) => {
    // Checks if product exists in cart already
    let selectQuery = `SELECT COUNT(*) AS count FROM cart WHERE product_id=? AND sessions_id=?;`;
    return db.execute(selectQuery, [productId, sessionId])
        .then(([selectResults, selectFields]) => {
            const quantity = selectResults[0].count;
            // If product does not exist, add to cart
            if (quantity === 0) {
                let insertQuery = `INSERT INTO cart (product_id, sessions_id, quantity) VALUES (?,?,1);`;
                return db.execute(insertQuery, [productId, sessionId])
                    .then(([insertResults, insertFields]) => {
                        if (insertResults && insertResults.affectedRows) {
                            return Promise.resolve(insertResults.insertId);
                        }
                        else {
                            return Promise.resolve(-1);
                        }
                    })
                    .catch((insertErr) => Promise.reject(insertErr));
            }
            // If product exists, increment quantity
            else{
                let updateQuery = `UPDATE cart SET quantity = quantity + 1 WHERE product_id=? AND sessions_id=?;`;
                return db.execute(updateQuery, [productId, sessionId])
                .then(([updateResults, updateFields]) => {
                    if(updateResults && updateResults.affectedRows) {
                        return Promise.resolve(quantity);
                    }
                    else{
                        return Promise.resolve(-1);
                    }
                })
                .catch((updateErr) => Promise.reject(updateErr));
            }
        })
        .catch((selectErr) => Promise.reject(selectErr));

};
Product.removeOneFromCart = (productId, sessionId) => {
    let selectQuery = `SELECT quantity AS quantity FROM cart WHERE product_id=? AND sessions_id=?;`;
    return db.execute(selectQuery, [productId, sessionId])
        .then(([selectResults, selectFields]) => {
            const quantity = selectResults[0].quantity;
            console.log("QUANTITY = " + quantity);
            if (quantity === 1) {
                return Product.removeFromCart(productId, sessionId);
            }
            else{
                let updateQuery = `UPDATE cart SET quantity = quantity - 1 WHERE product_id=? AND sessions_id=?;`;
                return db.execute(updateQuery, [productId, sessionId])
                    .then(([updateResults, updateFields]) => {
                        if (updateResults && updateResults.affectedRows) {
                            return Promise.resolve(1);
                        }
                        else {
                            return Promise.resolve(-1);
                        }
                    })
                    .catch((updateErr) => Promise.reject(updateErr));
            }
        })
        .catch((selectErr) => Promise.reject(selectErr));
};
Product.removeFromCart = (productId, sessionId) => {
    let query = `DELETE FROM cart WHERE product_id=? AND sessions_id=?;`;
    return db.execute(query, [productId, sessionId])
        .then(([results, fields]) => {
            if (results && results.affectedRows) {
                return Promise.resolve(1);
            }
            else {
                return Promise.resolve(-1);
            }
        })
        .catch((err) => Promise.reject(err));
};
Product.getCart = (sessionId) => {
    let query = `SELECT * FROM cart WHERE sessions_id=?`;
    return db.execute(query, [sessionId])
    .then(([results, fields]) => {
        return Promise.resolve(results);
    })
    .catch((err) => Promise.reject(err));
};
Product.getSession = (email) => {
    let query = `SELECT * FROM orders WHERE email=?;`;
    return db.execute(query, [email])
    .then (([results, fields]) => {
        return Promise.resolve(results[0].session_id);
    })
    .catch ((err) => Promise.reject(err));
};
Product.getOrders = (email) => {
    let query = `SELECT * FROM orders WHERE email=?;`;
    return db.execute(query, [email])
    .then (([results, fields]) => {
        let orders = Promise.all (results.map(order => order));
        return Promise.resolve(orders);
    })
    .catch ((err) => Promise.reject(err));
};

Product.placeOrder = (sessionId, email) => {
    let query = `INSERT INTO orders (session_id, email) VALUES (?,?);`;
    return db.execute(query, [sessionId, email])
    .then(([results, fields]) => {
        return Promise.resolve(results.insertId);
    })
    .catch((err) => Promise.reject(err));
};

Product.clearCart = async function(sessionId) {
    const delete_cart = 'DELETE FROM cart WHERE sessions_id = ?';
    try {
        await db.query(delete_cart, [sessionId]);
    } catch (error) {
        console.error("Failed to clear cart: ", error);
        throw error; 
    }
};

module.exports = Product;