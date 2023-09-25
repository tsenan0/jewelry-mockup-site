var db = require('../conf/database');
var bcrypt = require('bcrypt');
const User = {};

User.create = (username, email, password) => {
    return bcrypt.hash(password, 15)
    .then((hashedPassword) => {
        return db.execute(
        "INSERT INTO account (name, email, password) VALUES (?,?,?);",
        [username, email, hashedPassword]
        );
    })
    .then(([results, fields]) => {
        if(results && results.affectedRows){
            return db.execute(
                "INSERT INTO user (account_id) VALUES (?);",
                [results.insertId]
            );
        }
    })
    .then(([results, fields]) => {
        if (results && results.affectedRows){
            console.log(results.insertId);
            return Promise.resolve(results.insertId);
        }
        else{
            return Promise.resolve(-1);
        }
    })
    .catch((err) => Promise.reject(err));
};

User.emailExists = (email) => {
    return db.execute("SELECT * FROM account WHERE email=?;", [email])
    .then(([results, fields]) => {
        return Promise.resolve(!(results && results.length == 0));
    })
    .catch((err) => Promise.reject(err));
};
User.deleteUser = (email) => {
    return db.execute("DELETE FROM account WHERE email=?;", [email])
    .then(([results, fields]) => {
        if(results && results.affectedRows) {
            return Promise.resolve(1);
        }
        else{
            return Promise.resolve(-1)
        }
    })
    .catch((err) => Promise.reject(err));
}

User.authenticate = (email, password) => {
    let account;
    return db.execute("SELECT * FROM account WHERE email=?;", [email])
    .then(([results, fields]) => {
        if(results && results.length == 1){
            account = results[0];
            return bcrypt.compare(password, results[0].password);
        }
        else{
            return Promise.resolve(0);
        }
    })
    .then((passwordsMatch) => {
        if(passwordsMatch){
            return Promise.resolve(account);
        }
        else{
            return Promise.resolve(0);
        }
    })
    .catch((err) => Promise.reject(err));
};

module.exports = User;