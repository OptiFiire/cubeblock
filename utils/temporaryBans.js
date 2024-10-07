const channels = require('../json/channels.json')

async function checkTemporaryBans(client) {

    const guild = client.guilds.cache.get('1053689289592025098');
    if (!guild) return
    const bans = await guild.bans.fetch();
    if (!bans) return

    bans.forEach(async ban => {
        const reason = ban.reason;
        if (reason && reason.includes('~')) {
            const [_, timestamp] = reason.split('~').map(item => item.trim());
            const unbanTime = Math.floor(timestamp, 10);

            if (Date.now() >= unbanTime) {
                try {
                    await guild.members.unban(ban.user);

                    const channel = guild.channels.cache.find(ch => ch.id === channels.staffCommands);

                    if (channel) {
                        channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(colors.success)
                                    .setTitle(`${emojis.indicators.checkmark} Unbanned ${ban.user.tag}!`)
                                    .setDescription(`Automatically unbanned after their temporary ban expired.`)
                            ]
                        });
                    }
                } catch (error) {
                    print.error(`Failed to unban ${ban.user.tag} :`, error);
                }
            }
        }
    });
}

module.exports = { checkTemporaryBans };