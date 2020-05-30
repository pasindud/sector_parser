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