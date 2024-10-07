const { Events, ActivityType } = require('discord.js');
const print = require('../utils/print')

const status = {
    name: 'CubeBlock',
    type: ActivityType.Watching
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        client.user.setActivity(status.name, { type: status.type });
        client.user.setStatus('dnd');
        print.success(`\x1b[1m${client.user.displayName}\x1b[0m is online.\n`, true);
    }
};