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