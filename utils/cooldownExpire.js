const cooldownModel = require('../models/cooldownModel');
const print = require('./print');

async function checkExpiredCooldowns() {
    try {
        const cooldowns = await cooldownModel.findAll();

        for (const cooldown of cooldowns) {
            if (new Date(cooldown.expires) < Date.now()) {
                await cooldownModel.destroy({
                    where: { id: cooldown.id }
                });
            }
        }

    } catch (error) {
        print.error(error);
    }
}

module.exports = { checkExpiredCooldowns };