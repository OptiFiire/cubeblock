function generateCode(length) {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const characters = upperCase + numbers;
    let result = '';

    result += upperCase[Math.floor(Math.random() * upperCase.length)];
    result += numbers[Math.floor(Math.random() * numbers.length)];

    for (let i = 3; i <= length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    result = result.split('').sort(() => 0.5 - Math.random()).join('');

    return result;
}

module.exports = { generateCode };