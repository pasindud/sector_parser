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