function prettifyNumbers(numbers) {
    return String(Math.floor(numbers)).replace(/(.)(?=(\d{3})+$)/g, '$1,')
}

module.exports = { prettifyNumbers }