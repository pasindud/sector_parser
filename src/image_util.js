const fs = require('fs')
const mapnik = require('mapnik')
const mapnikify = require('@mapbox/geojson-mapnikify')

function savePng(width, height, geojson, outputFilename) {
    mapnikify(geojson, false, function(err, xml) {
        if (err) throw err
        var map = new mapnik.Map(width, height)
        mapnik.register_default_input_plugins()
        map.fromString(xml, {}, function(err, map) {
            if (err) throw err
            map.zoomAll()
            var im = new mapnik.Image(width, height)
            map.render(im, function(err, im) {
                if (err) throw err
                im.encode('png', function(err, buffer) {
                    if (err) throw err
                    fs.writeFile(outputFilename, buffer, function(err) {
                        if (err) throw err
                        console.log('saved map image to ' + outputFilename)
                    })
                })
            })
        })
    })
}

module.exports = {
    savePng
}