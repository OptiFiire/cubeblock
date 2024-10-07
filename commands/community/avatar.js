const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const UserModule = require('../../utils/userModule')
const colors = require('../../json/colors.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Gets the avatar of the user.')
		.addSubcommand(command => command
			.setName('main')
			.setDescription('Gets user\'s main avatar.')
			.addUserOption(option => option
				.setName('user')
				.setDescription('Choose the user to get avatar of.')
			)
		)
		.addSubcommand(command => command
			.setName('server')
			.setDescription('Gets user\'s avatar set for server.')
			.addUserOption(option => option
				.setName('member')
				.setDescription('Choose the member to get avatar of.')
			)
		),

	async execute(interaction) {

		switch (interaction.options.getSubcommand()) {

			case 'main':
				await interaction.deferReply()

				const user = interaction.options.getUser('user') || interaction.user
				const userProfile = await new UserModule(user.id).getProfile()

				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(userProfile.user_profile.theme_colors === undefined ? userProfile.user_profile.accent_color : userProfile.user_profile.theme_colors[0])
							.setTitle(`${user.username}'s main avatar.`)
							.setImage(user.avatarURL({ size: 4096 }))
					]
				})

				break;

			case 'server':
				await interaction.deferReply()

				const member = interaction.options.getMember('member') || interaction.member
				const memberProfile = await new UserModule(member.id).getProfile()

				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(memberProfile.user_profile.theme_colors === undefined ? memberProfile.user_profile.accent_color : memberProfile.user_profile.theme_colors[0])
							.setTitle(`${member.user.username}'s server avatar.`)
							.setImage(member.avatarURL({ size: 4096 }) || member.user.avatarURL({ size: 4096 }))
					]
				})

				break;
		}
	}
}