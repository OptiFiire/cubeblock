const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const therapyModel = require('../../models/therapyModel')
const emojis = require('../../json/emojis.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("therapy")
    .setDescription("Lv's therapy schedule")
    .addSubcommand(command => command
      .setName('schedule')
      .setDescription("Lv's therapy schedule")
    ),

  async execute(interaction) {

    const lvRole = interaction.guild.roles.cache.find(role => role.id === "1215609070250106941")
    const lvUser = await interaction.guild.members.cache.get("811143342309507092")

    const availableTimes = [
      new Date(new Date().setHours(10, 0, 0, 0)), // 10:00 AM
      new Date(new Date().setHours(11, 0, 0, 0)), // 11:00 AM
      new Date(new Date().setHours(14, 0, 0, 0)), // 2:00 PM
      new Date(new Date().setHours(16, 0, 0, 0)), // 4:00 PM
      new Date(new Date().setHours(17, 0, 0, 0))  // 5:00 PM
    ];

    const sessions = await therapyModel.findAll();
    const urgentSessions = sessions.filter(session => session.type === 'urgent');
    const regularSessions = sessions.filter(session => session.type === 'basic');

    let urgentSessionsList = urgentSessions.length > 0
      ? urgentSessions.map((session, i) => `**${i + 1}**. <@${session.user.id}>`).join('\n')
      : 'None';

    let therapySessionsList = '';
    for (const time of availableTimes) {
      const session = regularSessions.find(session => new Date(session.startTime).getTime() === time.getTime());
      const discordTimestamp = `<t:${Math.floor(time.getTime() / 1000)}:t>`;
      if (session) {
        therapySessionsList += `**${discordTimestamp}** - <@${session.user.id}>\n`;
      } else {
        therapySessionsList += `**${discordTimestamp}** - Available\n`;
      }
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(lvRole.color)
          .setThumbnail(lvUser.user.avatarURL({ size: 4096 }))
          .setTitle(`Lv's therapy schedule`)
          .setDescription(`
### ${emojis.indicators.warn_red} Urgent Sessions:
${urgentSessionsList}
### ${emojis.indicators.arrowR} Therapy sessions:
${therapySessionsList}
          `)
      ]
    });
  },
};
