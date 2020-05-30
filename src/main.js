/** This file is used by browserify. */

const Airport = require('./airport')
const Artcc = require('./artcc')
const DefineColor = require('./define_colors')
const Fix = require('./fix')
const Geo = require('./geo')
const Info = require('./info')
const LatLong = require('./lat_lon')
const Line = require('./line')
const Ndb = require('./ndb')
const Region = require('./region')
const Sections = require('./sections')
const Vor = require('./vor')

function getAllGeoJson(data) {
    const vors = Vor.parse(data)
    const ndbs = Ndb.parse(data)
    const fixes = Fix.parse(data)
    const airports = Airport.parse(data)
    const geos = Geo.parse(data)
    const regions = Region.parse(data)
    const artccHigh = Artcc.parseArtccHigh(data)
    const artccLow = Artcc.parseArtccLow(data)
    const All = [
        vors,
        ndbs,
        fixes,
        airports,
        geos,
        artccHigh,
        artccLow,
        regions
    ]
    return getGeoJson(All)
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

module.exports = {
    Airport,
    Artcc,
    DefineColor,
    Fix,
    Geo,
    Info,
    LatLong,
    Line,
    Ndb,
    Region,
    Sections,
    Vor,
    getAllGeoJson,
    getGeoJson
}