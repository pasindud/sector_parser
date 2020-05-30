var assert = require('assert')
var fs = require('fs')
var data = fs.readFileSync('test/test_region_sector.sct', 'utf8')
const Vor = require('../src/vor')

describe('Vor', function() {
    it('Vor are correctly parsed', function() {
        const vors = Vor.parse(data)

        assert.strictEqual(vors.length, 4)

        for (var i = 0; i < vors.length; i++) {
            assert.strictEqual(vors[i].name, 'AAE')
            assert.strictEqual(vors[i].freq, '113.100')
        }
    })
})