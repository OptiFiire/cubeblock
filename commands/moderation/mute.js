const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const roles = require('../../json/roles.json');
const emojis = require('../../json/emojis.json');
const colors = require('../../json/colors.json');
const print = require('../../utils/print');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Manages server\'s mutes.')
		.setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
		.addSubcommand(command => command
			.setName('add')
			.setDescription('Mute a member in the server.')
			.addUserOption(option => option
				.setName('member')
				.setDescription('Choose a member to mute.')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('duration')
				.setDescription('Choose a time for user to be timed out.')
				.setRequired(true)
				.addChoices(
					{ name: '10 minutes', value: '600' },
					{ name: '30 minutes', value: '1800' },
					{ name: '1 hour', value: '3600' },
					{ name: '6 hours', value: '21600' },
					{ name: '12 hours', value: '43200' },
					{ name: '1 day', value: '86400' },
					{ name: '3 days', value: '259200' }
				)
			),
		)
		.addSubcommand(command => command
			.setName('remove')
			.setDescription('Removes a mute from a member.')
			.addUserOption(option => option
				.setName('member')
				.setDescription('Choose a member to remove a mute from.')
				.setRequired(true)
			)
		),


	async execute(interaction) {

		switch (interaction.options.getSubcommand()) {
			case 'add':

				try {
					await interaction.deferReply();

					const member = interaction.options.getMember('member')
					const duration = interaction.options.getString('duration')

					if (member === interaction.member) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Mute!`)
									.setDescription(`You cannot mute yourself.`)
							],
							ephemeral: true
						})
					}

					if (member.roles.cache.has(roles.staff)) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Mute`)
									.setDescription(`You cannot mute any of staff members.`)
							],
							ephemeral: true
						})
					}

					if (member.roles.highest.position >= interaction.member.roles.highest.position) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Cannot Mute!`)
									.setDescription(`You cannot mute this user because user has same/above roles as yours.`)
							],
							ephemeral: true
						})
					}

					const durationMapping = {
						'600': '10 minutes',
						'1800': '30 minutes',
						'3600': '1 hour',
						'21600': '6 hours',
						'43200': '12 hours',
						'86400': '1 day',
						'259200': '3 days'
					};

					await member.timeout(duration * 1000)

					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.success)
								.setTitle(`${emojis.indicators.checkmark} Muted ${member.user.username}`)
								.setThumbnail(member.user.avatarURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.socials.discord_pixel} User :`, value: `- ${member}` },
									{ name: `${emojis.miscellaneous.clock} Duration :`, value: `- ${durationMapping[duration]}` },
									{ name: `${emojis.miscellaneous.hammer} Muted by :`, value: `- ${interaction.user}` }
								)
						]
					});

				} catch (error) {
					if (error.code === 10007) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Not Found!`)
									.setDescription(`Member you were trying to mute was not found in this server.`)
							],
							ephemeral: true
						})
					} else {
						print.error(error)
					}
				}

				break;

			case 'remove':

				try {
					await interaction.deferReply();

					const member = interaction.options.getMember('member')

					if (member === interaction.member) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Unmute!`)
									.setDescription(`You cannot unmute yourself.`)
							],
							ephemeral: true
						})
					}

					if (member.roles.cache.has(roles.staff)) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Cannot Unmute!`)
									.setDescription(`You cannot unmute any of staff members.`)
							],
							ephemeral: true
						})
					}

					if (member.roles.highest.position >= interaction.member.roles.highest.position) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Cannot Unmute!`)
									.setDescription(`You cannot unmute this user because user has same/above roles as yours.`)
							],
							ephemeral: true
						})
					}

					if (member.bot) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Cannot Unmute!`)
									.setDescription(`You cannot unmute bots.`)
							],
							ephemeral: true
						})
					}

					if (member.communicationDisabledUntil < Date.now()) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Not muted!`)
									.setDescription(`This member is not muted.`)
							],
							ephemeral: true
						})
					}

					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.success)
								.setTitle(`${emojis.indicators.checkmark} Unmuted ${member.user.username}`)
								.setThumbnail(member.user.avatarURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.socials.discord_pixel} Member :`, value: `- ${member}` },
									{ name: `${emojis.miscellaneous.hammer} Unmuted By :`, value: `- ${interaction.user}` }
								)
						]
					});

					await member.timeout(null)
				} catch (error) {
					if (error.code === 10007) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Not Found!`)
									.setDescription(`Member you were trying to unmute was not found in this server.`)
							],
							ephemeral: true
						})
					} else {
						print.error(error)
					}
				}

				break;
		}
	}
}