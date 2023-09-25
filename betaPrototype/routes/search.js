const express = require('express');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const db = require('../conf/database');

// function to break down the search term, replace special characters like "+","@" with spaces, and ignore "s" or "es" at the end of each word
function BreakdownSearchTerm(searchTerm) {
  searchTerm = searchTerm.replace(/[^\w\s]+/g, ' '); //remove special character
  searchTerm = searchTerm.replace(/s\b|es\b/gi, ''); //remove "s" and "es"
  const keywords = searchTerm.split(' ').filter(word => word.length > 0); //then ex: "diamond ruby ring" to "diamond" "ruby" "ring"
  return keywords;
}

router.get('/',
  [check('q').not().isEmpty().withMessage('Search term is usually required, but since you are already here, here are some random results we are sure you are going to love. Enjoy!')
    .isLength({ max: 60 })
    .withMessage('Search term must be less than 60 characters'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [randomResults, _] = await db.execute("SELECT * FROM product WHERE customized = 0 ORDER BY RAND() LIMIT 10");
      // req.flash("warning", "You searched for nothing. Here are some random products for you!");

      return res.render('searchresults', { errors: errors.array(), results: randomResults  });
    }
    

    const searchTerm = req.query.q; // Get the search query from the request
    const description = req.query.desc; //description from quiz reults
    const words = BreakdownSearchTerm(searchTerm);

    try {
      if (words){
        // Create an object to store product counts
        const productCounts = {};

        // Loop through each keyword and execute a separate query for each word
        for (const keyword of words) {
          const [results, fields] = await db.execute(
            "SELECT * FROM product WHERE customized = 0 AND (title LIKE ? OR type LIKE ? OR material LIKE ? OR description LIKE ?)",
            [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
          );

          if (results.length > 0) {
            // Increment the count for each product found in the search results
            // so the product that being search the most will display first.
            results.forEach(result => {
              const productId = result.id;
              productCounts[productId] = (productCounts[productId] || 0) + 1;
            });
          }  
        }

        // Sort the results based on counts in descending order
        const sortedResults = Object.keys(productCounts).sort((a, b) => productCounts[b] - productCounts[a]);

        // Retrieve the product details for the sorted results
        const finalResults = await Promise.all(sortedResults.map(productId => getProductDetails(productId)));
        
        if (finalResults.length > 0) {
        // Render the searchresults template with the final results
        req.flash('success', `Results matching "${searchTerm}".`);
        res.render('searchresults', { results: finalResults, searchTerm: searchTerm,  description: description });
        } else {
        const [results, fields] = await db.execute("SELECT * FROM product WHERE customized = 0 ORDER BY RAND() LIMIT 10");
        req.flash('error', `No results were found matching "${searchTerm}".`);
        res.render('searchresults', { notFound: true, searchTerm: searchTerm, results: results,  description: description});
        //need to add flash that nothing found
        } 
      }
    }catch (err) {
      console.error('Error executing search query:', err);
      res.status(500).send('Internal Server Error');
    }
  }
);

// Function to retrieve product details from the database
async function getProductDetails(productId) {
  const [result, fields] = await db.execute("SELECT * FROM product WHERE id = ?", [productId]);
  return result[0];
}


module.exports = router;
