(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Bundle = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const LatLong = require('./lat_lon')
const Sections = require('./sections')

/** Contains information from the AIRPORT section of the sector file. */
class Airport {
    /**
     * @param {String} name in ICAO in airport.
     * @param {String} freq of the airport.
     * @param {LatLong} point of the airport.
     * @param {String} airportClass of the airport.
     */
    constructor(name, freq, point, airportClass) {
        this.name = name
        this.freq = freq
        this.point = point
        this.airportClass = airportClass
    }

    /**
     * @returns {Object} of AIRPORT in GeoJSON format.
     */
    toGeoJson() {
        return {
            properties: {
                type: 'AIRPORT'
            },
            geometry: {
                type: 'Point',
                coordinates: [this.point.lon, this.point.lat]
            }
        }
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Airport[]}.
     */
    static parse(contents) {
        const content = contents.split('\n')
        const ariports = []
        var started = false

        for (var i = 0; i < content.length; i++) {
            const line = content[i].replace('\r', '').replace(/  +/g, ' ').trim()
            if (line === '' || line.startsWith(';')) {
                continue
            }

            if (line === '[AIRPORT]') {
                started = true
                continue
            } else if (started && Sections.has(line)) {
                started = false
                continue
            }

            if (!started) continue

            const seg = line.split(' ')
            ariports.push(new Airport(seg[0], seg[1], new LatLong(seg[2], seg[3]), seg[4]))
        }
        return ariports
    }
}

module.exports = Airport
},{"./lat_lon":7,"./sections":12}],2:[function(require,module,exports){
const Line = require('./line')
const LatLong = require('./lat_lon')
const Sections = require('./sections')

/** Contains information from the ARTCC section of the sector file. */
class Artcc {
    /**
     * @param {String} name of the artcc
     *                 Example - VABB_CTR.
     *
     * @param {String} type of the artcc can be
     *                 Examples - 'ARTCC HIGH, ARTCC LOW'.
     *
     * @param {Line[]} points of the airport.
     */
    constructor(name, type, points) {
        this.name = name
        this.type = type
        this.points = points
    }

    /**
     * @returns {Object} of ARTCC in GeoJSON format.
     */
    toGeoJson() {
        return {
            properties: {
                type: 'ARTCC'
            },
            geometry: {
                type: 'LineString',
                coordinates: Line.ArrayOfLinesToArray(this.points)
            }
        }
    }

    /**
     * @returns {String} of Artcc in JSON format.
     */
    toString() {
        return JSON.stringify(this, null, 2)
    }

    static parseArtccHigh(contents) {
        return Artcc.parse(contents, '[ARTCC HIGH]')
    }

    static parseArtccLow(contents) {
        return Artcc.parse(contents, '[ARTCC LOW]')
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Artcc[]}.
     */
    static parse(contents, type) {
        const content = contents.split('\n')
        const artcc = []
        var started = false
        var points = []
        var name = ''

        for (var i = 0; i < content.length; i++) {
            const line = content[i].replace('\r', '').replace(/  +/g, ' ').trim()

            if (line === '') {
                if (name !== '') {
                    artcc.push(new Artcc(name, type, points))
                }
                name = ''
                points = []
            }

            if (line === '' ||
                line.startsWith(';') ||
                line.startsWith('#')) {
                continue
            }

            if (line === type) {
                started = true
                continue
            } else if (started && Sections.has(line)) {
                started = false
                if (name !== '') {
                    artcc.push(new Artcc(name, type, points))
                }
                name = ''
                points = []
                continue
            }

            if (!started) continue

            const segs = line.trim().split(' ')

            if (segs.length === 5) {
                points = [new Line(
                    new LatLong(segs[1], segs[2]),
                    new LatLong(segs[3], segs[4])
                )]
                name = segs[0]
            } else if (segs.length === 4) {
                points.push(new Line(
                    new LatLong(segs[0], segs[1]),
                    new LatLong(segs[2], segs[3])
                ))
            }
        }

        if (name !== '') {
            artcc.push(new Artcc(name, type, points))
        }

        name = ''
        points = []

        return artcc
    }
}

module.exports = Artcc
},{"./lat_lon":7,"./line":8,"./sections":12}],3:[function(require,module,exports){
/** Colors defined in the sector file. */
class DefineColor {
    /**
     * @param {String} name of the color
     * @param {String} color.
     */
    constructor(name, color) {
        this.name = name
        this.hex = DefineColor.getHex(color)
    }

    static getHex(color) {
        color = parseInt(color)
        const r = (color & 0x000000FF)
        const b = (color & 0x00FF0000) >> 16
        const g = (color & 0x0000FF00) >> 8
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Map}.
     */
    static getColorMap(contents) {
        const colorsMap = new Map()
        const content = contents.split('\n')

        for (var i = 0; i < content.length; i++) {
            const line = content[i].replace('\r', '').replace(/  +/g, ' ').trim()
            if (line === '' || line.startsWith(';')) {
                continue
            }

            if (line.startsWith('#define')) {
                const segs = line.split(' ')
                const name = segs[1]
                colorsMap.set(name.toLowerCase(), new DefineColor(
                    name.toLowerCase(),
                    segs[2]))
            }
        }
        return colorsMap
    }
}

module.exports = DefineColor
},{}],4:[function(require,module,exports){
const LatLong = require('./lat_lon')
const Sections = require('./sections')

/** Contains information from the FIXES section of the sector file. */
class Fix {
    /**
     * @param {String} name of the fix.
     * @param {LatLong} point of the fix.
     */
    constructor(name, point) {
        this.name = name
        this.point = point
    }

    /**
     * @returns {Object} of FIXES in GeoJSON format.
     */
    toGeoJson() {
        return {
            properties: {
                type: 'FIXES'
            },
            geometry: {
                type: 'Point',
                coordinates: [this.point.lon, this.point.lat]
            }
        }
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Fix[]}.
     */
    static parse(contents) {
        const content = contents.split('\n')
        const points = []
        var started = false

        for (var i = 0; i < content.length; i++) {
            const line = content[i].replace('\r', '').replace(/  +/g, ' ').trim()

            if (line === '' ||
                line.startsWith(';') ||
                line.startsWith('#')) {
                continue
            }

            if (line === '[FIXES]') {
                started = true
                continue
            } else if (started && Sections.has(line)) {
                started = false
                continue
            }

            if (!started) continue

            const seg = line.split(' ')
            points.push(new Fix(seg[0], new LatLong(seg[1], seg[2])))
        }
        return points
    }
}

module.exports = Fix
},{"./lat_lon":7,"./sections":12}],5:[function(require,module,exports){
const Line = require('./line')
const LatLong = require('./lat_lon')
const Sections = require('./sections')
const DefineColor = require('./define_colors')

/** Contains information from the GEO section of the sector file. */
class Geo {
    constructor(color, points) {
        this.color = color
        this.points = points
    }

    /**
     * @returns {String} of Geo in JSON format.
     */
    toString() {
        return JSON.stringify(this, null, 2)
    }

    /**
     * @returns {Object} of Geo in GeoJSON format.
     */
    toGeoJson() {
        return {
            properties: {
                fill: this.color,
                stroke: this.color,
                color: this.color,
                type: 'GEO'
            },
            geometry: {
                type: 'LineString',
                coordinates: this.points.toLineArray()
            }
        }
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Geo[]}.
     */
    static parse(contents) {
        const colorsMap = DefineColor.getColorMap(contents)
        const content = contents.split('\n')
        const geos = []
        var started = false

        for (var i = 0; i < content.length; i++) {
            const line = content[i].replace('\r', '').replace(/  +/g, ' ').trim()

            if (line === '' ||
                line.startsWith(';') ||
                line.startsWith('#')) {
                continue
            }

            if (line === '[GEO]') {
                started = true
                continue
            } else if (started && Sections.has(line)) {
                started = false
                continue
            }

            if (!started) continue

            const segs = line.trim().split(' ')
            if (segs.length !== 5) {
                continue
            }

            const fromTo = new Line(
                new LatLong(segs[0], segs[1]),
                new LatLong(segs[2], segs[3])
            )

            var color = segs[4].toLowerCase();
            if (!isNaN(color)) {
                color = DefineColor.getHex(color)
            } else if (colorsMap.has(color.toLowerCase())) {
                color = colorsMap.get(color.toLowerCase()).hex
            }

            geos.push(new Geo(color, fromTo))
        }
        return geos
    }
}

module.exports = Geo
},{"./define_colors":3,"./lat_lon":7,"./line":8,"./sections":12}],6:[function(require,module,exports){
const LatLong = require('./lat_lon')

/** Contains information from the INFO section of the sector file. */
class Info {
    constructor(
        fileName,
        defaultCallsign,
        defaultAirport,
        defaultCenter,
        nauticalMilesPerDegreeLat,
        nauticalMilesPerDegreeLon,
        magneticVariation,
        sectorScaleValue
    ) {
        this.fileName = fileName
        this.defaultCallsign = defaultCallsign
        this.defaultAirport = defaultAirport
        this.defaultCenter = defaultCenter
        this.nauticalMilesPerDegreeLat = parseFloat(nauticalMilesPerDegreeLat)
        this.nauticalMilesPerDegreeLon = parseFloat(nauticalMilesPerDegreeLon)
        this.magneticVariation = parseFloat(magneticVariation)
        this.sectorScaleValue = parseFloat(sectorScaleValue)
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Info}.
     */
    static parse(contents) {
        const content = contents.split('\n')
        const lineNo = content.findIndex((l) => l.trim() === '[INFO]')

        if (lineNo === -1) {
            console.error('Could not find INFO section in the sector file')
            return
        }

        return new Info(
            content[lineNo + 1],
            content[lineNo + 2],
            content[lineNo + 3],
            new LatLong(content[lineNo + 4], content[lineNo + 5]),
            content[lineNo + 6],
            content[lineNo + 7],
            content[lineNo + 8],
            content[lineNo + 9]
        )
    }
}

module.exports = Info
},{"./lat_lon":7}],7:[function(require,module,exports){
/** Contains latitude and longitude information. */
class LatLon {
    /**
     * @param {String} latitude of the point
     *                 Example -  N053.23.53.000
     *
     * @param {String} longitude of the point
     *                 Examples - W005.30.00.000
     */
    constructor(latitude, longitude) {
        this.latitude = latitude
        this.longitude = longitude
        this.lat = parseFloat(toDeg(latitude))
        this.lon = parseFloat(toDeg(longitude))
    }

    /**
     * Convert array of [LatLong] into [float[[longitude, latitude]]].
     * Note the last point is same as the first one to close the
     * loop in the polygon.
     *
     * @param {LatLon[]} points.
     * @returns {float[[longitude, latitude]]}.
     */
    static pointsOfLatLonToArray(points) {
        var pointsArray = []
        for (var i = 0; i < points.length; i++) {
            pointsArray.push([points[i].lon, points[i].lat])
        }
        // Close the loop
        if (pointsArray.length !== 0) {
            pointsArray.push([points[0].lon, points[0].lat])
        }
        return pointsArray
    }
}

/** Converts degrees minutes seconds (DMS) to decimal. */
function toDeg(value) {
    value = value.trim()
    var segs2 = value.split(/[^\d\\.]+/)
    var segs = segs2[1].split('.')
    return convertDMSToDD(segs[0], segs[1], segs[2] + '.' + segs[3], value[0])
}

function convertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = Number(degrees) + Number(minutes) / 60 + Number(seconds) / (60 * 60)

    if (direction === 'S' || direction === 'W') {
        dd = dd * -1
    }
    // Don't do anything for N or E
    if (isNaN(dd)) {
        console.error('LatLon ERROR ' + degrees)
    }
    return dd
}

module.exports = LatLon
},{}],8:[function(require,module,exports){
/** Contains Line information. */
class Line {
    /**
     * @param {fromPoint} fromPoint of the line
     * @param {toPoint} toPoint of the line
     */
    constructor(fromPoint, toPoint) {
        this.from = fromPoint
        this.to = toPoint
    }

    /** @param {Line[]} points */
    static ArrayOfLinesToArray(points) {
        const array = []

        for (let j = 0; j < points.length; j++) {
            const element = points[j]
            array.push([element.from.lon, element.from.lat])
            array.push([element.to.lon, element.to.lat])
        }

        return array
    }

    toLineArray() {
        return [
            [
                this.from.lon,
                this.from.lat
            ],
            [
                this.to.lon,
                this.to.lat
            ]
        ]
    }
}

module.exports = Line
},{}],9:[function(require,module,exports){
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
},{"./airport":1,"./artcc":2,"./define_colors":3,"./fix":4,"./geo":5,"./info":6,"./lat_lon":7,"./line":8,"./ndb":10,"./region":11,"./sections":12,"./vor":13}],10:[function(require,module,exports){
const LatLong = require('./lat_lon')
const Sections = require('./sections')

/** Contains information from the NDB section of the sector file. */
class Ndb {
    constructor(name, freq, point) {
        this.name = name
        this.freq = freq
        this.point = point
    }

    /**
     * @returns {Object} of NDB in GeoJSON format.
     */
    toGeoJson() {
        return {
            properties: {
                type: 'NDB'
            },
            geometry: {
                type: 'Point',
                coordinates: [this.point.lon, this.point.lat]
            }
        }
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Ndb[]}.
     */
    static parse(contents) {
        const content = contents.split('\n')
        const ndbs = []
        var started = false

        for (var i = 0; i < content.length; i++) {
            const line = content[i].replace('\r', '').replace(/  +/g, ' ').trim()
            if (line === '' || line.startsWith(';')) {
                continue
            }

            if (line === '[NDB]') {
                started = true
                continue
            } else if (started && Sections.has(line)) {
                started = false
                continue
            }

            if (!started) continue

            const seg = line.split(' ')
            ndbs.push(new Ndb(seg[0], seg[1], new LatLong(seg[2], seg[3])))
        }
        return ndbs
    }
}

module.exports = Ndb
},{"./lat_lon":7,"./sections":12}],11:[function(require,module,exports){
const LatLong = require('./lat_lon')
const Sections = require('./sections')
const DefineColor = require('./define_colors')

/** Contains information from the REGION section of the sector file. */
class Region {
    constructor(color, points) {
        this.color = color
        // if (customColor === null) {
        //   this.customColor = null
        //   this.customColor16 = null
        // } else {
        //   this.customColor = parseInt(customColor)
        //   this.customColor16 = this.customColor.toString(16)
        // }
        this.points = points
    }

    /**
     * @returns {String} of Region in JSON format.
     */
    toString() {
        return JSON.stringify(this, null, 2)
    }

    /**
     * @returns {Object} of Region in GeoJSON format.
     */
    toGeoJson() {
        if (this.color === null) {
            console.error('Color null')
            this.color = 0
        }

        var coordinates = [LatLong.pointsOfLatLonToArray(this.points)]

        return {
            properties: {
                fill: this.color,
                stroke: this.color,
                color: this.color
            },
            geometry: {
                type: 'Polygon',
                coordinates: coordinates
            }
        }
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Region[]}.
     */
    static parse(contents) {
        function _addRegion() {
            if (defineColorName != null) {
                var color = null

                if (!isNaN(defineColorName)) {
                    color = DefineColor.getHex(defineColorName)
                } else if (colorsMap.has(defineColorName.toLowerCase())) {
                    color = colorsMap.get(defineColorName.toLowerCase()).hex
                }

                if (color == null) {
                    console.error(defineColorName, colorsMap.get(defineColorName))
                }

                const newRegion = new Region(
                    color,
                    currentPoints
                )
                regions.push(newRegion)
            }
        }
        const colorsMap = DefineColor.getColorMap(contents)
        const content = contents.split('\n')
        const regions = []
        let defineColorName = null
        let currentPoints = []
        // Whether we have started to parse the REGION section.
        let started = false

        for (var i = 0; i < content.length; i++) {
            const line = content[i].replace('\r', '').replace(/  +/g, ' ').trim()

            // Skip comments and empty lines.
            if (line === '' || line.startsWith(';')) {
                continue
            }

            if (line === '[REGIONS]') {
                started = true
                continue
            } else if (started && Sections.has(line)) {
                _addRegion()
                currentPoints = []
                defineColorName = null
                // customColor = null
                started = false
                continue
            }

            if (!started) continue

            var segs = line.trim().split(' ')

            if (segs.length <= 1) {
                continue
            }
            if (segs[segs.length - 1].trim().startsWith(';')) {
                segs = segs.slice(0, segs.length - 1)
            }

            // Start of a new region.
            if (segs.length >= 3) {
                // Finish the previous region.
                _addRegion()
                currentPoints = []

                var lat
                var lon

                if (segs.length === 3) {
                    defineColorName = segs[0]
                    lat = segs[1]
                    lon = segs[2]
                } else {
                    defineColorName = segs[1]
                    lat = segs[2]
                    lon = segs[3]
                }

                currentPoints.push(new LatLong(lat, lon))
            } else if (segs.length >= 2) {
                currentPoints.push(new LatLong(segs[0], segs[1]))
            } else {
                console.error('Region error ' + line)
            }
        }

        if (started) {
            // Finish the last region.
            _addRegion()
        }

        return regions
    }
}

module.exports = Region
},{"./define_colors":3,"./lat_lon":7,"./sections":12}],12:[function(require,module,exports){
const Sections = new Set()
Sections.add('[INFO]')
Sections.add('[RUNWAY]')
Sections.add('[VOR]')
Sections.add('[NDB]')
Sections.add('[AIRPORT]')
Sections.add('[FIXES]')
Sections.add('[ARTCC]')
Sections.add('[ARTCC HIGH]')
Sections.add('[ARTCC LOW]')
Sections.add('[GEO]')
Sections.add('[SID]')
Sections.add('[STAR]')
Sections.add('[REGIONS]')
Sections.add('[LOW AIRWAY]')
Sections.add('[HIGH AIRWAY]')
Sections.add('[LABELS]')

module.exports = Sections
},{}],13:[function(require,module,exports){
const LatLong = require('./lat_lon')
const Sections = require('./sections')

/** Contains information from the VOR section of the sector file. */
class Vor {
    constructor(name, freq, point) {
        this.name = name
        this.freq = freq
        this.point = point
    }

    /**
     * @returns {Object} of VOR in GeoJSON format.
     */
    toGeoJson() {
        return {
            properties: {
                type: 'VOR'
            },
            geometry: {
                type: 'Point',
                coordinates: [this.point.lon, this.point.lat]
            }
        }
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Vor[]}.
     */
    static parse(contents) {
        const content = contents.split('\n')
        const sectionsLines = []
        var started = false

        for (var i = 0; i < content.length; i++) {
            const line = content[i].replace('\r', '').replace(/  +/g, ' ').trim()
            if (line === '' || line.startsWith(';')) {
                continue
            }

            if (line === '[VOR]') {
                started = true
                continue
            } else if (started && Sections.has(line)) {
                started = false
                continue
            }

            if (!started) continue

            const seg = line.split(' ')
            sectionsLines.push(new Vor(seg[0], seg[1], new LatLong(seg[2], seg[3])))
        }
        return sectionsLines
    }
}

module.exports = Vor
},{"./lat_lon":7,"./sections":12}]},{},[9])(9)
});
