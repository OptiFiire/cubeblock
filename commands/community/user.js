const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { prettifyNumbers } = require('../../utils/prettifyNumbers')
const messagesModule = require('../../utils/messagesModule')
const UserModule = require('../../utils/userModule')
const emojis = require('../../json/emojis.json')
const colors = require('../../json/colors.json')
const print = require('../../utils/print')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Shows the information about the user.')
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user you want to get profile of.')
			.setRequired(false)
		),

	async execute(interaction) {

		try {
			await interaction.deferReply();

			const user = interaction.options.getUser('user') || interaction.user;
			const member = interaction.options.getMember('user') || interaction.member;

			const userModule = new UserModule(user.id)
			const userProfile = await userModule.getProfile()
			const connections = await userModule.getConnections()

			let results = connections.length > 0
				? connections.slice(0, 10).map((account, i) => `- ${emojis.socials[account.type]} ${account.name}`).join("\n")
				: 'No connections found.';

			if (connections.length > 10) {
				const remainingConnections = connections.length - 10;
				results += `\n\`and ${remainingConnections} more\``;
			}

			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(userProfile.user_profile.theme_colors === undefined ? userProfile.user_profile.accent_color : userProfile.user_profile.theme_colors[0])
						.setTitle(`${user.username}'s Profile.`)
						.setThumbnail(user.avatarURL({ size: 4096 }))
						.setImage(`https://cdn.discordapp.com/banners/${user.id}/${userProfile.user_profile.banner}?size=4096`)
						.addFields(
							{
								name: `${emojis.cubecraft.id} User :`,
								value: `- Username : \`${userProfile.user.username}\`\n- Entity : <@${userProfile.user.id}>\n- ID : \`${user.id}\`\n- Pronouns : \`${userProfile.user_profile.pronouns || 'Not provided'}\``,
								inline: true
							},
							{
								name: `${emojis.miscellaneous.note} Biography :`,
								value: `- ${userProfile.user_profile.bio || `\`Not provided\``}`,
								inline: true
							},
							{
								name: ` `,
								value: ` `,
							},
							{
								name: `${emojis.cubecraft.play_again} Joined :`,
								value: `- CubeBlock : <t:${Math.floor(member.joinedAt / 1000)}:R>\n- Discord : <t:${Math.floor(user.createdAt / 1000)}:R>`,
								inline: true
							},
							{
								name: `${emojis.cubecraft.social} Messages :`,
								value: `- ${prettifyNumbers((await messagesModule.user(user.id, interaction.guild.id)).total_results) || `0`}`,
								inline: true
							},
							{
								name: ` `,
								value: ` `,
							},
							{
								name: `${emojis.miscellaneous.link} Connections :`,
								value: `${results || `- \`No connected accounts\``}`
							}
						)
				]
			})

		} catch (error) {
			if (error.code === 10007) {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(colors.failure)
							.setTitle(`${emojis.indicators.x} Not Found!`)
							.setDescription(`Unable to find this user in this server.`)
					],
					ephemeral: true
				})
			} else {
				print.error(error)
			}
		}
	}
}