var assert = require('assert')
var fs = require('fs')
var data = fs.readFileSync('test/test_region_sector.sct', 'utf8')
const Info = require('../src/info')
const LatLon = require('../src/lat_lon')

describe('Info', function() {
    it('Info are correctly parsed', function() {
        const info = Info.parse(data)

        assert(info.fileName, 'India vACC AIRAC 1601')
        assert(info.defaultCallsign, 'VABB_TWR')
        assert(info.defaultAirport, 'VABB')
        assert(info.defaultCenter, new LatLon('N019.05.38.999', 'E073.37.08.000'))
        assert(info.nauticalMilesPerDegreeLat, 60)
        assert(info.nauticalMilesPerDegreeLon, 55)
        assert(info.magneticVariation, -1.4)
        assert(info.sectorScaleValue, 1.2)
    })
})