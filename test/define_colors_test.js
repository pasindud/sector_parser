var assert = require('assert')
var fs = require('fs')
var data = fs.readFileSync('test/test_region_sector.sct', 'utf8')
const DefineColor = require('../src/define_colors')

describe('DefineColor', function() {
    it('DefineColor are correctly parsed', function() {
        const colors = DefineColor.getColorMap(data)

        assert.strictEqual(colors.size, 7)
        assert.strictEqual(colors.get('red').hex, '#ff0000')

        for (var name in colors) {
            assert.strictEqual(colors.get(name).name, name)
        }
    })
})