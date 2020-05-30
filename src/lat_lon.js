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