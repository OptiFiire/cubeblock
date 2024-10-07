function decodeColor(color) {
    if (!color) return null;
    return `${color.toString(16).padStart(6, '0')}`
}

module.exports = { decodeColor }