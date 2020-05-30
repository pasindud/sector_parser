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