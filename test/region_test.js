var assert = require('assert')
var fs = require('fs')
var data = fs.readFileSync('test/test_region_sector.sct', 'utf8')
const Region = require('../src/region')

describe('Region', function() {
    it('Regions are correctly parsed', function() {
        const pointsLengths = [1, 3, 2, 3, 2]

        const output = Region.parse(data)
        assert.strictEqual(output.length, 5)
        for (var i = 0; i < output.length; i++) {
            assert.strictEqual(output[i].points.length, pointsLengths[i])
        }
    })
})