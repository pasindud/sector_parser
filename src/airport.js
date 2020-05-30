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