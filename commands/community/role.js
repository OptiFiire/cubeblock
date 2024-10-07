const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const emojis = require('../../json/emojis.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Shows the information about the role.')
		.addRoleOption(option => option
			.setName('role')
			.setDescription('The role you want to get info of.')
			.setRequired(true)
		),

	async execute(interaction) {

		await interaction.deferReply()

		const role = interaction.options.getRole('role')

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(role.hexColor)
					.setTitle(`${role.name} role information.`)
					.setThumbnail(role.iconURL({ size: 1024 }))
					.addFields(
						{
							name: `${emojis.cubecraft.loot} Display :`,
							value: `- ID : \`${role.id}\`\n- Name : \`${role.name}\`\n- Color : ${role.color === 0 ? `\`No color\`` : `\`#${role.color}\``}`
						},
						{
							name: `${emojis.cubecraft.settings} Settings :`,
							value: `- Position : ${role.rawPosition}/${interaction.guild.roles.cache.size}\n- Bot Role : ${role.managed ? 'Yes' : 'No'}\n- Displayed separately : ${role.hoist ? 'Yes' : 'No'}\n- Mentionable : ${role.mentionable ? 'Yes' : 'No'}`
						},
						{ name: `${emojis.miscellaneous.alarm} Permissions :`, value: role.permissions.toArray().map(permission => `\`${(permission.match(/[A-Z][a-z]+/g).join(" ")).toString()}\``).join(", ") || `\`No permissions\``, inline: true }
					)
			]
		})
	}
}