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