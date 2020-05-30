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