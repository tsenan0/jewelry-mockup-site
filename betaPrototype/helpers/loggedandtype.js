
  module.exports ={
   loggedin: function(req, res, next) {
        if (req.session && req.session.account) {
          return next(); // User is authenticated, continue to the next middleware/route handler
        }
        req.flash('error', 'You need to be logged in to access this page');
        res.redirect('/login'); // Redirect to login page if user is not authenticated
      },
    
    employee : function(req, res, next) {
        if (req.session && req.session.account && req.session.account.account_type === 'employee') {
          return next();
        }
        req.flash('error', 'You do not have permission to access this page');
        res.redirect('/'); // Redirect to homepage or some other page
      }  
    
  }