const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const emojis = require('../../json/emojis.json');
const colors = require('../../json/colors.json');
const osu = require('node-os-utils')
const cpu = osu.cpu

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bot')
		.setDescription('Displays bot statistics.'),

	async execute(interaction) {

		await interaction.deferReply();

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(colors.default)
					.setTitle("CubeBlock Bot's Information")
					.setThumbnail(interaction.client.user.avatarURL({ size: 4096 }))
					.setImage(interaction.client.user.bannerURL({ size: 4096 }))
					.addFields(
						{
							name: `${emojis.miscellaneous.commands} Commands :`,
							value: `- \`${interaction.client.commands.size}\``,
							inline: true
						},
						{
							name: `${emojis.cubecraft.weekly_items} Created :`,
							value: `- <t:${parseInt(interaction.client.user.createdTimestamp / 1000, 10)}:R>`,
							inline: true
						},
						{
							name: ` `,
							value: ` `
						},
						{
							name: `${emojis.indicators.orbit_full} Ping :`,
							value: `- \`${Date.now() - interaction.createdTimestamp}ms\``,
							inline: true
						},
						{
							name: `${emojis.cubecraft.settings} RAM Usage :`,
							value: `- \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``,
							inline: true
						},
						{
							name: ` `,
							value: ` `
						},
						{
							name: `${emojis.miscellaneous.clock} Uptime :`,
							value: `- <t:${Math.floor(Date.now() / 1000 - parseInt(process.uptime(), 10))}:R>`,
							inline: true
						},
						{
							name: `${emojis.miscellaneous.cpu} CPU Usage :`,
							value: `- \`${await cpu.usage()}%\``,
							inline: true
						},
						{
							name: ` `,
							value: ` `
						},
						{
							name: `${emojis.cubecraft.id} ID :`,
							value: `- \`${interaction.client.user.id}\``,
							inline: true
						},
					)
			]
		});
	}
};
