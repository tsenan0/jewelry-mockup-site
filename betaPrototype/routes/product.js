var express = require('express');
var router = express.Router();
var multer = require('multer');
var sharp = require('sharp');
var db = require('../conf/database');
const Product = require('../db/products');
const { Storage } = require('@google-cloud/storage');
const { employee } = require('../helpers/loggedandtype');

const storage = new Storage({
  projectId: 'csc-648-848-team-05',
  keyFilename: 'googlestoragekey.json',
});

var uploader = multer();



router.get('/:id', async (req, res, next) => {
  try{
    // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'Shop', url: '/shop' },
    { name: 'Product', url: '/:id' }
  ];

    let account_type = (req.session && req.session.account) ? req.session.account.account_type : null;
    let productId = req.params.id;
    let results = await Product.getProductById(productId);

    if(results && results.length > 0){
      //get all reviews first.
      // let relatedProducts = [];
      let productType = results[0].type;
      let productMaterial = results[0].material;
      let productGemstone = results[0].gemstone;

      const [relatedProducts] = await db.execute(`
      (SELECT * FROM product WHERE type = ? AND id != ? LIMIT 2)
      UNION
      (SELECT * FROM product WHERE material LIKE ? AND id != ? LIMIT 2)
      UNION
      (SELECT * FROM product WHERE gemstone LIKE ? AND id != ? LIMIT 2)
  `, [productType, productId, '%' + productMaterial + '%', productId, '%' + productGemstone + '%', productId]);
      const trimmedProducts = relatedProducts.slice(0, 3);

      const [reviews] = await db.execute('SELECT * FROM review WHERE product_id = ?', [productId]);

      if(res.locals.isLoggedIn && res.locals.account){
        let accountId = res.locals.account.id;
        res.render('productPage',{
          currentProduct: results[0],
          accountId: accountId,
          reviews: reviews,
          account_type: account_type,
          breadcrumbs: breadcrumbs,
          relatedProducts: trimmedProducts,
        });
      }else{
        res.render('productPage', {
          currentProduct: results[0], 
          reviews: reviews,
          account_type: account_type,
          breadcrumbs: breadcrumbs,
          relatedProducts: trimmedProducts,

        });
      }
      
    }else{
      req.flash("error", "Product "+ productId +" not found");
      res.redirect('/');
    }
}
catch (error){
    next(error);
}
});



router.post('/review', async (req, res, next) => {
  try {
    const { productid, rating, accountid, reviewtitle, review } = req.body;

    // Check if the user has already rated this product
    const [existingReview] = await db.execute('SELECT * FROM review WHERE product_id = ? AND user_id = ?', [productid, accountid]);
    if (existingReview.length > 0) {
      req.flash('error', 'Please delete the old rating and try again.');
      return res.redirect('/product/' + productid);
    }

    // Insert the new review into the database
    const insertReviewSql = 'INSERT INTO review (product_id, user_id, description, rating, title) VALUES (?, ?, ?, ?, ?)';
    await db.execute(insertReviewSql, [productid, accountid, review, rating, reviewtitle]);

    // need to update new average rating for the product.
    const [totalRatings] = await db.execute('SELECT rating FROM review WHERE product_id = ?', [productid]);

    let total = 0;
    for (let i = 0; i < totalRatings.length; i++) {
      total += parseFloat(totalRatings[i].rating);
    }
    const averageRating = total / totalRatings.length;

    // make rating = .5 or int. ex : average rating = 1.3 will be 1.5.
    const roundedAverageRating = Math.round(averageRating * 2) / 2;

    const updateProductRating = 'UPDATE product SET rating = ? WHERE id = ?';
    await db.execute(updateProductRating, [roundedAverageRating, productid]);

    req.flash('success', 'Review added.');
    return res.redirect('/product/' + productid);
  } catch (error) {
    console.error('Error handling review submission:', error);
    req.flash('error', 'Internal server error.');
    return res.redirect('/product/' + productid);
  }
});
router.get('/addProduct',employee, async function (req, res) {
  // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'Add Product', url: '/addProduct' }
  ];
  res.render('addProduct', { breadcrumbs: breadcrumbs, title: 'Add Product' });
});

router.post('/delete-review/:id', async (req, res, next) => {
  try {
      const reviewId = req.params.id;
      const productId = req.body.productid;
      // Check if the review with the specified id and accountId exists
      const [existingReview] = await db.execute('SELECT * FROM review WHERE id = ?', [reviewId]);

      if (existingReview) {
         // Delete the review from the database
        await db.execute('DELETE FROM review WHERE id = ?', [reviewId]); 

        //also need to update average rating
        const [totalRatings] = await db.execute('SELECT rating FROM review WHERE product_id = ?', [productId]);
        
        let total = 0;
        for (let i = 0; i < totalRatings.length; i++) {
          total += parseFloat(totalRatings[i].rating);
        }
        const averageRating = total / totalRatings.length;

        // make rating = .5 or int. ex : average rating = 1.3 will be 1.5.
        const roundedAverageRating = Math.round(averageRating * 2) / 2;

        const updateProductRating = 'UPDATE product SET rating = ? WHERE id = ?';
        await db.execute(updateProductRating, [roundedAverageRating, productId]);


        req.flash('successfully deleted!')
        return res.redirect('/product/' + productId);
      }else{
        req.flash('failed to delete')
        return res.redirect('/product/' + productId);
      }

      
  } catch (error) {
      console.error('Error handling review deletion:', error);
      return res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/update/:id', async (req, res, next) => {
  try {
      const productId = req.params.id;
      const { title, description, price } = req.body;

      // for use below
      const updateProductQuery = `
          UPDATE product
          SET title = ?, description = ?, price = ?
          WHERE id = ?;
      `;

      //Query from above gets executed 
      await db.query(updateProductQuery, [title, description, price, productId]);

      req.flash('success', 'Product updated successfully');
      res.redirect('/product/' + productId);
  } catch (error) {
      console.error("Failed to update product:", error);
      req.flash('error', 'Failed to update product.');
      res.redirect('/product/' + productId);
  }
});


router.post('/delete/:id', employee, async function (req, res, next) {
  const productId = req.params.id;
  try {
      // delete reviews associated with the product
      await db.execute(`DELETE FROM review WHERE product_id = ?`, [productId]);

      // delete product
      const [result, fields] = await db.execute(`DELETE FROM product WHERE id = ?`, [productId]);

      if (result && result.affectedRows) {
          return res.json({ success: true, message: `Product with ID ${productId} has been deleted successfully` });
      } else {
          return res.status(404).json({ success: false, message: `Product with ID ${productId} not found.` });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
  }
});



router.post('/createProduct',employee, uploader.single('uploadImage'), async (req, res, next) => {
  try {
    const { title, type, material, description, price } = req.body;

    // Save the image details in MySQL first to get the product ID
    const sql = `INSERT INTO product (title, type, material, description, price, image, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await db.execute(sql, [title, type, material, description, price, '', '']);

    // Get the product ID from the MySQL insert result
    const productId = result[0].insertId;


    // Process the image using Sharp
    const sharpImage = sharp(req.file.buffer);
    const thumbnailBuffer = await sharpImage.resize(200).toBuffer();

    // Upload the original image to Google Cloud Storage set up
    const bucketName = 'artisan-aura-photo-bucket';
    const bucket = storage.bucket(bucketName);

    // //make image name crypto

    // Uploading the original image to Google Cloud Storage
    const gcsFileName = `product/${productId}/images/${req.file.originalname}`;
    await bucket.file(gcsFileName).save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    //make image public
    const file = bucket.file(gcsFileName);
    await file.makePublic();


    // Uploading the thumbnail image to Google Cloud Storage

    const fileAsThumbnail = `thumbnail-${req.file.originalname}`;
    const thumbnailFileName = `product/${productId}/thumbnails/${fileAsThumbnail}`;
    await bucket.file(thumbnailFileName).save(thumbnailBuffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    //make image public
    const thumbnailfile = bucket.file(thumbnailFileName);
    await thumbnailfile.makePublic();


    // Update the image details in MySQL with the correct image and thumbnail paths
    const updateSql = `UPDATE product SET image = ?, thumbnail = ? WHERE id = ?`;
    await db.execute(updateSql, [gcsFileName, thumbnailFileName, productId]);

    res.redirect('/');
  } catch (error) {
    // Handle any errors
    next(error);
  }
});



module.exports = router;