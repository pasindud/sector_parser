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
        const color = "#000";
        return {
            properties: {
                stroke: color,
                color: color,
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