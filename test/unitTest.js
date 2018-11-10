var assert = require('assert');
var clientFunction = require('../pub/client.js');



describe('Can convert a string to be stored in a database', function() {
    it('should convert to lowercase (one word)', function() {
        assert.equal(clientFunction.cleanString('Oranges'), 'oranges');
    });

    it('should convert to lowercase (multiple words)', function() {
        assert.equal(clientFunction.cleanString('Cream Of muShrOom'), 'cream_of_mushroom');
    });

    it('should trim whitespace from the front and back', function() {
        assert.equal(clientFunction.cleanString('   Cheerios      '), 'cheerios');
    });

    it('should trim multiple spaces from between words', function() {
        assert.equal(clientFunction.cleanString(' Apple     Jacks'), 'apple_jacks');
    });

    it('should work with weird characters', function() {
        assert.equal(clientFunction.cleanString('  2%  milk  '), '2%_milk');
    });
});

describe('Can parse from database correctly', function() {
    it('should work with one word', function() {
        assert.equal(clientFunction.cleanString('  Bread '), 'bread');
        assert.equal(clientFunction.retrieve('bread'), 'Bread');
    });

    it('should work with multiple words', function() {
        assert.equal(clientFunction.cleanString('Honey Nut Cheerios'), 'honey_nut_cheerios');
        assert.equal(clientFunction.retrieve('honey_nut_cheerios'), 'Honey Nut Cheerios');
    });

    it('should work with weird characters', function() {
        assert.equal(clientFunction.cleanString(  '2%  Milk  '), '2%_milk');
        assert.equal(clientFunction.retrieve('2%_milk'), '2% Milk');
    });

    it('should capitalize prepositions', function() {
        assert.equal(clientFunction.cleanString('word A of In and it'), 'word_a_of_in_and_it');
        assert.equal(clientFunction.retrieve('word_a_of_in_and_it'), 'Word A Of In And It');
    });
});