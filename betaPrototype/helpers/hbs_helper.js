const Handlebars = require('handlebars');

// Helper to check if the review matches the accountId
Handlebars.registerHelper('isReviewByAccountId', function (reviewaccountId, options) {
    const Id = options.data.root.accountId || '';

    if (reviewaccountId === Id) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// Helper to display star rating icons
Handlebars.registerHelper('displayRatingStars', function (rating) {
    const totalStars = 5;
    const fullStarCount = Math.floor(rating);
    const halfStar = rating % 1 === 0.5;

    let stars = '';
    for (let i = 0; i < fullStarCount; i++) {
        stars += '<i class="fa fa-star star-fill"></i>';
    }

    if (halfStar) {
        stars += '<i class="fa fa-star-half-o star-fill"></i>';
    }

    for (let i = 0; i < totalStars - fullStarCount - (halfStar ? 1 : 0); i++) {
        stars += '<i class="fa fa-star-o"></i>';
    }

    return new Handlebars.SafeString(stars);
});

module.exports = Handlebars;