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

    static filterLine(line) {
        if (line == undefined) return '';

        return line.replace('\r', '').replace(/  +/g, ' ').trim();
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
            var color = null

            if (version == 2) {
                color = 0;
                if (version2Color != null) {
                    defineColorName = version2Color;
                }
            }

            if (defineColorName != null) {

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
        let version = 1;
        let version2Color = null;

        let i = -1;
        while(i < content.length) {
            ++i;

            const line = Region.filterLine(content[i]);

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
                version2Color = null;
                version = 1;
                // customColor = null
                started = false
                continue
            } else if (Region.filterLine(content[i]).startsWith('REGIONNAME')) {
                // Finish the previous region.
                _addRegion()
                currentPoints = []

                version = 2;

                var segs = Region.filterLine(content[i+1]).split(' ');
                version2Color = segs[0].trim();

                currentPoints.push(new LatLong(segs[1].trim(), segs[2].trim()))
                i = i + 1;
                continue;
            }

            if (!started) continue

            var segs = line.trim().split(' ')

            if (segs.length <= 1) {
                continue
            }


            if (version === 2) {
                if (segs.length != 2) {
                    console.error('Region v2 error ' + line)
                }

                currentPoints.push(new LatLong(segs[0].trim(), segs[1].trim()))
                continue;
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

        return regions;
    }
}

module.exports = Region