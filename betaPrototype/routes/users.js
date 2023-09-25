var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var db = require('../conf/database');
const User = require('../db/users');
const UserError = require('../helpers/userError');
const { checkEmail, registerValidator } = require('../helpers/regValidation');
const { employee } = require('../helpers/loggedandtype');

// router.use('/registration', registerValidator);
router.post('/registration', registerValidator,(req, res, next) => {
  let { name, email, password } = req.body;
  User.emailExists(email)
    .then((emailDoesExist) => {
      if (emailDoesExist) {
        throw new UserError(
          "Email already exists",
          "/registration",
          200
        );
      }
      else {
        return User.create(name, email, password);
      }
    })
    .then((createUser) => {
      if (createUser < 0) {
        throw new UserError(
          "User could not be created",
          "/registration",
          500
        );
      }
      else {
        req.flash('success', 'Account has been made!');
        req.session.save((err) => {
          res.redirect('/login');
        });
      }
    })
    .catch((err) => {
      if (err instanceof UserError) {
        req.flash('error', err.getMessage());
        res.status(err.getStatus());
        req.session.save((err) => {
          res.redirect('/registration');
        });
      }
      else {
        next(err);
      }
    })
});

router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;
  User.authenticate(email, password)
  .then((loggedUser) => {
    if(loggedUser.id > 0){
      req.session.account = {
        id: loggedUser.id,
        email: email,
        name: loggedUser.name,
        account_type: loggedUser.account_type
      };
      req.flash('success', 'You are now logged in!');
      req.session.save(err => {
        res.redirect('/');
      });
    }
    else{
      throw new UserError(
        "Invalid email and/or password", 
        "/login",
        200);
    }
  })
  .catch((err) => {
    if(err instanceof UserError) {
      req.flash('error', err.getMessage());
      res.status(err.getStatus());
      req.session.save(err => {
        res.redirect('/login');
      })
    }
    else{
      next(err);
    }
  })
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

router.post('/logout', function (req, res, next) {
  req.flash('success', 'You are now logged out');
  req.session.destroy(function (err) {
    if (err) {
      next(err);
    }
    return res.redirect('/');
  })
});
router.post('/delete-acc', async (req, res, next) => {
  let email = req.session.account.email;
  let results = await User.deleteUser(email);
  if (results > 0) {
    req.flash('success', 'Account has been deleted');
    req.session.destroy(err => {
      res.redirect('/');
    });
  }
  else {
    req.flash('error', 'Failed to delete account');
    req.session.save(err => {
      res.redirect('back');
    });
  }
});
router.post('/req-refund', (req, res, next) => {
  req.flash('success', 'Refund confirmation sent to email');
  req.session.save(err => {
    res.redirect('/');
  })
});

router.post('/order-status', (req, res, next) => {
  req.flash('success', 'Order pending. Check again in 24 hours.');
  req.session.save(err => {
    res.redirect('/order-status');
  })
});


module.exports = router;