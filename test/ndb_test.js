var assert = require('assert')
var fs = require('fs')
var data = fs.readFileSync('test/test_region_sector.sct', 'utf8')
const Ndb = require('../src/ndb')

describe('Ndb', function() {
    it('Ndb are correctly parsed', function() {
        const vors = Ndb.parse(data)

        assert.strictEqual(vors.length, 4)

        for (var i = 0; i < vors.length; i++) {
            assert.strictEqual(vors[i].name, 'AE')
            assert.strictEqual(vors[i].freq, '319.000')
        }
    })
})