var assert = require('assert')
var fs = require('fs')
var data = fs.readFileSync('test/test_region_sector.sct', 'utf8')
const Airport = require('../src/airport')

describe('Airport', function() {
    it('Airport are correctly parsed', function() {
        const airports = Airport.parse(data)

        assert.strictEqual(airports[0].name, 'VAJJ')
    })
})