const { check } = require('express-validator');

const ckreview = [
    check('email').trim().not().isEmpty().withMessage('Email is required'),
    check('name').trim().not().isEmpty().withMessage('Name is required'),

    check('address').trim().not().isEmpty().withMessage('Address is required'),

    check('city').trim().not().isEmpty().withMessage('City is required'),
    check('state').trim().not().isEmpty().withMessage('State is required'),

    check('zip').trim().isNumeric().isLength({ min: 5, max: 5 }).withMessage('Enter a valid 5-digit zip code.'),
    check('card').trim().isNumeric().isLength({ min: 16, max: 16 }).withMessage('Enter a valid 16-digit card number.'),

    check('exp').trim().matches(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/).withMessage('Enter a valid date in MM/YY or MM/YYYY format.'),

    check('cvv').trim().isNumeric().isLength({ min: 3, max: 4 }).withMessage('Enter a valid 3 or 4 digit CVV number.')
];
module.exports = {
    ckreview
};