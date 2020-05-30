var assert = require('assert')
var fs = require('fs')
var data = fs.readFileSync('test/test_region_sector.sct', 'utf8')
const Geo = require('../src/geo')

describe('Geo', function() {
    it('Geo are correctly parsed', function() {
        // Act
        const geos = Geo.parse(data)

        // Assert
        assert.strictEqual(geos.length, 6)

        const points = geos[0].points
        assert.strictEqual(points.from.latitude, 'N019.05.21.627')
        assert.strictEqual(points.from.longitude, 'E072.50.53.568')
        assert.strictEqual(points.to.latitude, 'N019.05.21.907')
        assert.strictEqual(points.to.longitude, 'E072.50.54.060')

        for (var i = 0; i < geos.length; i++) {
            assert.strictEqual(geos[i].color, '#808040')
        }
    })
})