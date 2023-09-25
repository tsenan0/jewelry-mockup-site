var express = require('express');
const path = require("path");
var router = express.Router();
var db = require('../conf/database');
const Product = require('../db/products');
const { employee, loggedin } = require('../helpers/loggedandtype');
const { checkEmail } = require('../helpers/regValidation');

// home page aka index
router.get('/', async function (req, res, next) {
  try {       //vvv
    res.render('index', { title: 'Home', css: ["newsletter.css", "quiz.css"], js: ["quiz.js"] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// login page 
router.get('/login', function (req, res, next) {
   // breadcrumbs
   const breadcrumbs = 
   [
     { name: 'Home', url: '/' }, 
     { name: 'Login', url: '/login' }
   ];
  res.render('login', { breadcrumbs: breadcrumbs, title: 'Login' });
});

//profile page
router.get('/users/profile/:id', loggedin, async function (req, res, next) {
  // breadcrumbs
  const breadcrumbs =
    [
      { name: 'Home', url: '/' },
      { name: 'Profile', url: '/profile' }
    ];
  let orders = await Product.getOrders(req.session.account.email);
  res.render('profile', { breadcrumbs: breadcrumbs, title: 'Profile', orders: orders });
});

// registration page 
router.get("/registration", function (req, res, next) {
 // breadcrumbs
 const breadcrumbs = 
 [
   { name: 'Home', url: '/' }, 
   { name: 'Login', url: '/login' },
   { name: 'Registration', url: '/registration' }
 ];
  res.render('registration', { breadcrumbs: breadcrumbs, title: 'Registration' });
});

// coming soon page 
router.get('/ComingSoon', function (req, res, next) {
  // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'Coming Soon', url: '/ComingSoon' }
  ];
  res.render('ComingSoon', { breadcrumbs: breadcrumbs, title: 'Coming Soon', css: ["newsletter.css"] });
 });

// add product page 
router.get('/addProduct',employee, async function (req, res) {
  // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'Add Product', url: '/addProduct' }
  ];
  res.render('addProduct', { breadcrumbs: breadcrumbs, title: 'Add Product' });
});

// Refund page
router.get('/req-refund', function (req, res, next) {
 // breadcrumbs
 const breadcrumbs = 
 [
   { name: 'Home', url: '/' }, 
   { name: 'Request Refund', url: '/refundReq' }
 ];
  res.render('refundReq', { breadcrumbs: breadcrumbs, title: 'Request Refund' });
});

// Order page
router.get('/order-status', function (req, res, next) {
 // breadcrumbs
 const breadcrumbs = 
 [
   { name: 'Home', url: '/' }, 
   { name: 'Order Status', url: '/orderStatus' }
 ];
  res.render('orderStatus', { breadcrumbs: breadcrumbs, title: 'Order Status' });
});

// privacy policy page 
router.get('/PrivacyPolicy', function (req, res, next) {
  // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'ArtisanAura Privacy Policy', url: '/PrivacyPolicy' }
  ];
  res.render('PrivacyPolicy', { breadcrumbs: breadcrumbs, title: 'ArtisanAura Privacy Policy' });
});

// single product page 
router.get('/productsingle', function (req, res, next) {
   // breadcrumbs
   const breadcrumbs = 
   [
     { name: 'Home', url: '/' },  
     { name: 'Product', url: '/productsingle' }
   ];
  res.render('productsingle', { breadcrumbs: breadcrumbs, title: 'Customize Your Own Jewelry' });
});

// custom product page 
router.get('/customproduct', function (req, res, next) {
 // breadcrumbs
 const breadcrumbs = 
 [
   { name: 'Home', url: '/' }, 
   { name: 'Customize Your Own Jewelry', url: '/customproduct' }
 ]; 
  res.render('customproduct', { breadcrumbs: breadcrumbs, title: 'Customize Your Own Jewelry' });
});

// terms and conditions page
router.get('/termsConditions', function (req, res, next) {
  // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'ArtisanAura Terms and Conditions', url: '/termsConditions' }
  ];
  res.render('termsConditions', { breadcrumbs: breadcrumbs, title: 'ArtisanAura Terms and Conditions' });
});

// terms of service and privacy for user registration page
router.get('/termsService', function (req, res, next) {
  // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'Terms of Service and Privacy Policy', url: '/termsService' }
  ];
  res.render('termsService', { breadcrumbs: breadcrumbs, title: 'Terms of Service and Privacy Policy' });
});

// about us page
router.get('/AboutUs', async function (req, res, next) {
  try {
  // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'About Us', url: '/AboutUs' }
  ];

    var [products, fields] = await db.execute(
      `SELECT * FROM product ORDER BY id DESC;`
    );
    if (products.length === 0) {
      req.flash("error", `No products available`);
    }
    res.render('AboutUs', { breadcrumbs: breadcrumbs, title: 'About ArtisanAura Jewelry', products: products, css: ["newsletter.css", "quiz.css", "productspage.css"], js: ["quiz.js"] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// shop page
router.get('/Shop', async function (req, res, next) {
  try {
  // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'Shop', url: '/shop' }
  ];
    
    // chk if reset clicked
    if (req.query.reset === 'true') {
      req.session.filters = {};
     
    }

    // session filter or empty
    req.session.filters = req.session.filters || {};

    // filters in query
    if (req.query.type) req.session.filters.type = req.query.type;
    if (req.query.material) req.session.filters.material = req.query.material;
    if (req.query.gemstone) req.session.filters.gemstone = req.query.gemstone;
    if (req.query.sort_price) req.session.filters.sort_price = req.query.sort_price;
    if (req.query.min_price) req.session.filters.min_price = parseFloat(req.query.min_price);
    if (req.query.max_price) req.session.filters.max_price = parseFloat(req.query.max_price);

    // filter from session
    let {
      type: filterType,
      material: filterMaterial,
      gemstone: filterGemstone,
      sort_price: sortPrice,
      min_price: min_price,
      max_price: max_price
    } = req.session.filters;
    let flashMessage = [];
    if (filterType) flashMessage.push(`Type: ${filterType}`);
    if (filterMaterial) flashMessage.push(`Material: ${filterMaterial}`);
    if (filterGemstone) flashMessage.push(`Gemstone: ${filterGemstone}`);
    // all product data
    let query = "SELECT * FROM product";
    let queryParams = [];
    let conditions = ["customized = 0"];

    // each filter type below
    if (filterType) {
      conditions.push("type = ?");
      queryParams.push(filterType);
    }
    if (filterMaterial) {
      conditions.push("material LIKE ?");
      queryParams.push('%' + filterMaterial + '%');
    }
    if (filterGemstone) {
      conditions.push("gemstone LIKE ?");
      queryParams.push('%' + filterGemstone + '%');
    }

    if (typeof min_price !== "undefined" && typeof max_price !== "undefined") {
      conditions.push("price >= ? AND price <= ?");
      queryParams.push(min_price, max_price);
    } else if (typeof min_price !== "undefined") {
      conditions.push("price >= ?");
      queryParams.push(min_price);
    } else if (typeof max_price !== "undefined") {
      conditions.push("price <= ?");
      queryParams.push(max_price);
    }

    // joins multiple conditions
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(' AND ');
    }

    // edge, if price sort by it
    if (sortPrice) {
      if (['ASC', 'DESC'].includes(sortPrice.toUpperCase())) {
        query += ` ORDER BY price ${sortPrice}`;
      } else {

      }
    }
    

    const [products] = await db.execute(query, queryParams);

    if (products.length === 0) {
        let individualResults = [];

        // type
        if (filterType) {
            const [typeProducts] = await db.execute("SELECT * FROM product WHERE customized = 0 AND type = ? GROUP BY id ORDER BY RAND() LIMIT 5", [filterType]);
            individualResults.push(...typeProducts);
        }

        // material
        if (filterMaterial) {
            const [materialProducts] = await db.execute("SELECT * FROM product WHERE customized = 0 AND material LIKE ? GROUP BY id ORDER BY RAND() LIMIT 5", ['%' + filterMaterial + '%']);
            individualResults.push(...materialProducts);
        }

        // gemstones
        if (filterGemstone) {
            const [gemstoneProducts] = await db.execute("SELECT * FROM product WHERE customized = 0 AND gemstone LIKE ? GROUP BY id ORDER BY RAND() LIMIT 5", ['%' + filterGemstone + '%']);
            individualResults.push(...gemstoneProducts);
        }


        let combinedFiltersMsg = `No products match the combined filters: ${flashMessage.join(', ')}`;
        req.flash('error', combinedFiltersMsg);
        return res.render('Shop', {
            products: individualResults,
            filters: req.session.filters,
            breadcrumbs: breadcrumbs,
            error: individualResults.length === 0 ? 'No products available' : combinedFiltersMsg,
            css: ["newsletter.css", "quiz.css"], 
            js: ["quiz.js"],
        });
    }
    

    return res.render('Shop', {
        products: products,
        filters: req.session.filters,
        breadcrumbs: breadcrumbs,
        title: 'Shop All Jewelry', css: ["newsletter.css", "quiz.css"], js: ["quiz.js"] 
        //need to add message that no results found for combined search
        // need to update idividuals so they follow the price update
    });

  } catch (err) {
    console.error("Error caught in /Shop route:", err.message);
    return res.status(500).send({
      error: 'Server error'
    });
  }
});



// Guides page
router.get('/Guides', function (req, res, next) {
   // breadcrumbs
   const breadcrumbs = 
   [
     { name: 'Home', url: '/' }, 
     { name: 'Guides', url: '/Guides' }
   ];
   res.render('Guides', { breadcrumbs: breadcrumbs, title: 'Guides', css: ["newsletter.css", "quiz.css"], js: ["quiz.js"] });
});

// Refund page
router.get('/Refund', function (req, res, next) {
  res.render('Refund', { breadcrumbs: breadcrumbs, title: 'Refund', css: ["newsletter.css", "quiz.css"], js: ["quiz.js"] });
   // breadcrumbs
   const breadcrumbs = 
   [
     { name: 'Home', url: '/' }, 
     { name: 'Refund', url: '/Refund' }
   ];
});

// Customer Service page
router.get('/CustomerSupport', function (req, res, next) {
  // breadcrumbs
  const breadcrumbs = 
  [
    { name: 'Home', url: '/' }, 
    { name: 'Customer Support', url: '/CustomerSupport' }
  ];
  res.render('CustomerSupport', { breadcrumbs: breadcrumbs, title: 'Customer Support', css: ["newsletter.css", "quiz.css"], js: ["quiz.js"] });
});


// Newsletter sign up

router.post('/Newsletter', async function (req, res, next) {
  var newsletter_Id = req.params.id;
  var email = req.body.email;
  console.log(`newsletter_Id: ${newsletter_Id}, email: ${email}`);

  try {

    if (!checkEmail(email)) {
      req.flash('error', 'Invaild email, Please give a vaild email address.');
      return req.session.save(function (error) {
        if (error) next(error);
        return res.redirect('/');
      });
    }

    const [existemail] = await db.execute(
      'SELECT * FROM newsletter WHERE email = ?',
      [email]
    );

    if (existemail.length > 0) {
      req.flash('error', 'This email is already subscribed to the newsletter.');
      return req.session.save(function (error) {
        if (error) next(error);
        return res.redirect(`/`);
      });
    }

    var [input, _] = await db.execute(
      "INSERT INTO newsletter (email) VALUES (?)",
      [email]
    );
    if (input && input.affectedRows) {
      req.flash("success", "Youve been added to the mailing list");
      return req.session.save(function (error) {
        if (error) next(error);
        return res.redirect(`/`);
      });
    } else {
      next(new Error("error occurred"));
    }
  } catch (error) {
    next(error);
  }
});


module.exports = router;
