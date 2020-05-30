const fs = require('fs')
const Airport = require('../src/airport')
const ImageUtil = require('../src/image_util')
const Artcc = require('../src/artcc')
const Fix = require('../src/fix')
const Geo = require('../src/geo')
const Ndb = require('../src/ndb')
const Region = require('../src/region')
const Vor = require('../src/vor')
const Main = require('../src/Main')
const TEST_SECTOR_FILES = [{
    name: 'mumbai',
    path: 'test/Mumbai.sct'
}]

describe('All', function() {
    TEST_SECTOR_FILES.forEach(element => {
        test(element.name, element.path)
    })

    function test(name, path) {
        const data = fs.readFileSync(path, 'utf8')
        const testData = 'test/test_data_' + name
        if (!fs.existsSync(testData)) {
            fs.mkdirSync(testData, {
                recursive: true
            })
        }

        const vors = Vor.parse(data)
        const ndbs = Ndb.parse(data)
        const fixes = Fix.parse(data)
        const airports = Airport.parse(data)
        const geos = Geo.parse(data)
        const regions = Region.parse(data)
        const artccHigh = Artcc.parseArtccHigh(data)
        const artccLow = Artcc.parseArtccLow(data)
        const allPoints = [vors, ndbs, fixes, airports]
        const allLines = [geos, artccHigh, artccLow]
        const all = [vors, ndbs, fixes, airports,
            geos, artccHigh, artccLow, regions
        ]

        function writeGeoJson(sections, outputFilename) {
            const geoJson = getGeoJson(sections)
            const outputPath = testData + '/' + outputFilename
            fs.writeFileSync(outputPath, JSON.stringify(geoJson, null, 2))
        }

        function getGeoJson(sections) {
            const features = []

            for (let j = 0; j < sections.length; j++) {
                const section = sections[j]
                for (var i = 0; i < section.length; i++) {
                    const mark = section[i].toGeoJson()
                    const feature = {
                        type: 'Feature'
                    }
                    features.push(Object.assign(feature, mark))
                }
            }
            const geojson = {
                type: 'FeatureCollection',
                features: features
            }
            return geojson
        }

        function renderImageFromGivenSections(sections, outputFilename) {
            const outputPath = testData + '/' + outputFilename
            ImageUtil.savePng(6000, 6000, getGeoJson(sections), outputPath)
        }

        it('Render all points correctly', function() {
            const outputFilename = 'image_test_points.png'
            renderImageFromGivenSections(allPoints, outputFilename)
        })

        it('All points geoJson generated correctly', function() {
            const outputFilename = 'test_points.geojson'
            writeGeoJson(allPoints, outputFilename)
        })

        it('Geo and Artcc are render correctly', function() {
            const outputFilename = 'image_test_lines.png'
            renderImageFromGivenSections(allLines, outputFilename)
        })

        it('Geo and Artcc geoJson generated correctly', function() {
            const outputFilename = 'test_lines.geojson'
            writeGeoJson(allLines, outputFilename)
        })

        it('Region are render correctly', function() {
            const outputFilename = 'image_test_regions.png'
            renderImageFromGivenSections([regions], outputFilename)
        })

        it('Region geoJson generated correctly', function() {
            const outputFilename = 'test_regions.geojson'
            writeGeoJson([regions], outputFilename)
        })

        it('All sections geoJson generated correctly', function() {
            const outputFilename = testData + '/image_all.png'
            ImageUtil.savePng(1024, 1024, Main.getAllGeoJson(data), outputFilename)
        })

        it('All sections geoJson generated correctly', function() {
            const outputFilename = 'test_all.geojson'
            writeGeoJson(all, outputFilename)
        })
    }
})