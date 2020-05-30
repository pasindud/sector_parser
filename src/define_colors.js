/** Colors defined in the sector file. */
class DefineColor {
    /**
     * @param {String} name of the color
     * @param {String} color.
     */
    constructor(name, color) {
        this.name = name
        this.hex = DefineColor.getHex(color)
    }

    static getHex(color) {
        color = parseInt(color)
        const r = (color & 0x000000FF)
        const b = (color & 0x00FF0000) >> 16
        const g = (color & 0x0000FF00) >> 8
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    }

    /**
     * @param {String[]} contents of the sector file.
     * @returns {Map}.
     */
    static getColorMap(contents) {
        const colorsMap = new Map()
        const content = contents.split('\n')

        for (var i = 0; i < content.length; i++) {
            const line = content[i].replace('\r', '').replace(/  +/g, ' ').trim()
            if (line === '' || line.startsWith(';')) {
                continue
            }

            if (line.startsWith('#define')) {
                const segs = line.split(' ')
                const name = segs[1]
                colorsMap.set(name.toLowerCase(), new DefineColor(
                    name.toLowerCase(),
                    segs[2]))
            }
        }
        return colorsMap
    }
}

module.exports = DefineColor