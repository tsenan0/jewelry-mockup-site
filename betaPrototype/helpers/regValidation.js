const checkPassword = (password) => {
    let passwordChecker = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordChecker.test(password);
}
const checkEmail = (email) => {
    let emailChecker = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailChecker.test(email);
}
const registerValidator = (req, res, next) => {
    let password = req.body.password;
    let email = req.body.email;
    if (!checkEmail(email) || !checkPassword(password)) {
        let message = "Invalid email and/or password. Please try again.";
        req.flash('error', message);
        req.session.save(err => {
            res.redirect("/registration");
        });
    }
    else {
        next();
    }
}
module.exports = {
    checkEmail,
    registerValidator
};