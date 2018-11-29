var assert = require('assert');
var clientFunction = require('../pub/client.js');



describe('Can convert a string to be stored in a database', function () {
    it('should convert to lowercase (one word)', function () {
        assert.equal(clientFunction.cleanString('Oranges'), 'oranges');
    });

    it('should convert to lowercase (multiple words)', function () {
        assert.equal(clientFunction.cleanString('Cream Of muShrOom'), 'cream_of_mushroom');
    });

    it('should trim whitespace from the front and back', function () {
        assert.equal(clientFunction.cleanString('   Cheerios      '), 'cheerios');
    });

    it('should trim multiple spaces from between words', function () {
        assert.equal(clientFunction.cleanString(' Apple     Jacks'), 'apple_jacks');
    });

    it('should work with weird characters', function () {
        assert.equal(clientFunction.cleanString('  2%  milk  '), '2%_milk');
    });
});

describe('Can parse from database correctly', function () {
    it('should work with one word', function () {
        assert.equal(clientFunction.cleanString('  Bread '), 'bread');
        assert.equal(clientFunction.retrieve('bread'), 'Bread');
    });

    it('should work with multiple words', function () {
        assert.equal(clientFunction.cleanString('Honey Nut Cheerios'), 'honey_nut_cheerios');
        assert.equal(clientFunction.retrieve('honey_nut_cheerios'), 'Honey Nut Cheerios');
    });

    it('should work with weird characters', function () {
        assert.equal(clientFunction.cleanString('2%  Milk  '), '2%_milk');
        assert.equal(clientFunction.retrieve('2%_milk'), '2% Milk');
    });

    it('should capitalize prepositions', function () {
        assert.equal(clientFunction.cleanString('word A of In and it'), 'word_a_of_in_and_it');
        assert.equal(clientFunction.retrieve('word_a_of_in_and_it'), 'Word A Of In And It');
    });
});

describe('Can handle date formats correctly', function () {
    let aDate = new Date();
    let dateString = (aDate.getMonth() + 1) + "-" + aDate.getDate() + "-" + aDate.getFullYear();
    it('should work with today\s date', function () {
        assert.equal(clientFunction.makeDate(), dateString);
    });

    it('should have leading zeros for month and day', function () {
        assert.equal(clientFunction.formatDate(new Date(2018, 3, 6)), '04-06-2018');
    });

    it('should return proper milliseconds', function () {
        assert.equal(clientFunction.dateMillis(new Date(2018, 10, 20)), 1542690000000);
    });

    it('should return proper milliseconds 2', function () {
        assert.equal(clientFunction.dateMillis(aDate), aDate.getTime());
    });

});

describe('Validates field input correctly', function () {
    it('should not allow negative numbers', function () {
        assert.equal(clientFunction.validateQuantity(-1), false);
    });

    it('should not words', function () {
        assert.equal(clientFunction.validateQuantity('1abd'), false);
    });

    it('should allow regular numbers as string', function () {
        assert.equal(clientFunction.validateQuantity('19'), true);
    });

    it('should allow regular numbers as integer', function () {
        assert.equal(clientFunction.validateQuantity(19), true);
    });

    it('should not allow decimals', function () {
        assert.equal(clientFunction.validateQuantity('543.678'), false);
    });

    it('should not allow a blank name', function () {
        assert.equal(clientFunction.validateName(''), false);
    });

    it('should not allow a long name', function () {
        assert.equal(clientFunction.validateName('wwwwwwwwwwwwwww'), false);
    });

    it('should not allow a name with only spaces', function () {
        assert.equal(clientFunction.validateName('         '), false);
        assert.equal(clientFunction.validateName('     \t \n \r    '), false);
    });

    it('should allow a name with characters', function () {
        assert.equal(clientFunction.validateName('cherrios'), true);
    });

    it('should allow a name with numbers in it', function () {
        assert.equal(clientFunction.validateName('  3 eggs '), true);
    });

    it('should allow a blank comment', function () {
        assert.equal(clientFunction.validateComment(''), true);
    });

    it('should not allow a long comment', function () {
        assert.equal(clientFunction.validateComment('asdfasdfasdfasdasdf'), false);
    });
});

describe('Validates length of each word in a string correctly', function () {
    it('should allow the empty string', function () {
        assert.equal(clientFunction.isTooLong(''), false);
    });

    it('should allow all white space', function () {
        assert.equal(clientFunction.isTooLong('         '), false);
        assert.equal(clientFunction.isTooLong('        \t \s    \r '), false);
    });

    it('should allow a long string of normal words', function () {
        assert.equal(clientFunction.isTooLong('Get a banana that is not too green, but does not have too many brown spots, but also not too few brown spots. I want a banana with four (4) brown spots.'), false);
    });
    it('should allow a single word', function () {
        assert.equal(clientFunction.isTooLong('colorful'), false);
    });

    it('should not allow one long string', function () {
        assert.equal(clientFunction.isTooLong('loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong'), true);
    });

    it('should not allow one long string with normal strings', function () {
        assert.equal(clientFunction.isTooLong('loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong words should not work'), true);
    });
});