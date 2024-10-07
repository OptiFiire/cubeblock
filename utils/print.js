const color = {
    orange: '\x1b[38;5;202m',
    green: '\x1b[32m',
    limeGreen: '\x1B[38;5;190m',
    lightBlue: '\x1B[38;5;51m',
    lime: '\x1B[38;5;82m',
    gold: '\x1B[38;5;220m',
    blue: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    darkGreen: '\x1B[38;5;70m',
    gray: '\x1B[38;5;232m',
    lightGray: '\x1B[38;5;247m',
    lightPurple: '\x1B[38;5;135m',
    purple: '\x1B[38;5;141m',
    red: '\x1B[38;5;196m',
    lightRed: "\x1b[31m",
    yellow: "\x1b[33m",
    magenta: '\x1B[38;5;201m',
    cyan: "\x1b[36m",
    white: "\x1b[37m",
}

function warn(message, useProcess = false, prefixCharacter = '') {
    if (useProcess) {
        process.stdout.write(`${prefixCharacter}${color.yellow}[ ${color.bold}⚠${color.reset}${color.yellow} ]${color.reset} ${message}`);
    } else {
        console.log(`${color.yellow}[ ${color.bold}⚠${color.reset}${color.yellow} ]${color.reset} ${message}`);
    }
}

function error(message, useProcess = false, prefixCharacter = '') {
    if (useProcess) {
        process.stdout.write(`${prefixCharacter}${color.lightRed}[ ${color.bold}✘${color.reset}${color.lightRed} ]${color.reset} ${message}`);
    } else {
        console.log(`${color.lightRed}[ ${color.bold}✘${color.reset}${color.lightRed} ]${color.reset} ${message}`);
    }
}

function loading(message, symbol, prefixCharacter = '') {
    process.stdout.write(`\r${prefixCharacter}${color.lightGray}[ ${color.bold}${symbol}${color.reset}${color.lightGray} ]${color.reset} ${message}`);
    process.stdout.write('\x1b[?25l');
}

function info(message, useProcess = false, prefixCharacter = '') {
    if (useProcess) {
        process.stdout.write(`${prefixCharacter}${color.blue}[ ${color.bold}${color.cyan}i${color.reset}${color.blue} ]${color.reset} ${message}`);
    } else {
        console.log(`${color.blue}[ ${color.bold}${color.cyan}i${color.reset}${color.blue} ]${color.reset} ${message}`)
    }
}

function success(message, useProcess = false, prefixCharacter = '') {
    if (useProcess) {
        process.stdout.write(`${prefixCharacter}${color.green}[ ${color.bold}✔${color.reset}${color.green} ]${color.reset} ${message}`);
    } else {
        console.log(`${color.green}[ ${color.bold}✔${color.reset}${color.green} ]${color.reset} ${message}`);
    }
}

module.exports = { warn, error, success, info, loading };