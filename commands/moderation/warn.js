const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const { generateCode } = require('../../utils/codeGenerator')
const warnModel = require('../../models/warnModel')
const emojis = require('../../json/emojis.json')
const colors = require('../../json/colors.json')
const print = require('../../utils/print')
const roles = require('../../json/roles.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Manages server warnings.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addSubcommand(command => command
			.setName('add')
			.setDescription('Adds a warning for a member.')
			.addUserOption(option => option
				.setName('member')
				.setDescription('Enter the member to warn.')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('reason')
				.setDescription('Enter the reason to warn.')
				.setRequired(true)
			)
		)
		.addSubcommand(command => command
			.setName('remove')
			.setDescription('Remove a warning from a member.')
			.addStringOption(option => option
				.setName('id')
				.setDescription('Enter the warn id of the member.')
				.setAutocomplete(true)
				.setRequired(true)
			)
		),

	async autocomplete(interaction) {
		const value = interaction.options.getFocused(true);
		const choices = await warnModel.findAll();

		const filtered = choices
			.map((warnEntry) => ({
				id: warnEntry.id,
				user: warnEntry.user.username
			}))
			.filter((warn) => `${warn.id} - ${warn.user}`.toLowerCase().includes(value.value.toLowerCase()))
			.slice(0, 25);

		await interaction.respond(
			filtered.map((warn) => ({
				name: `${warn.id} - ${warn.user}`,
				value: warn.id,
			}))
		);
	},

	async execute(interaction) {

		switch (interaction.options.getSubcommand()) {
			case 'add':
				try {
					await interaction.deferReply();

					const member = await interaction.options.getMember('member')
					const reason = await interaction.options.getString('reason')

					if (!member) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Warn!`)
									.setDescription(`The member you were trying to warn was not found in this server.`)
							],
							ephemeral: true
						})
					}

					if (member.bot) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Warn!`)
									.setDescription(`You cannot warn bots.`)
							],
							ephemeral: true
						})
					}

					if (member.roles.cache.has(roles.staff)) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Warn!`)
									.setDescription(`You cannot warn any of staff members.`)
							],
							ephemeral: true
						})
					}

					if (member.roles.highest.position >= interaction.member.roles.highest.position) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Warn!`)
									.setDescription(`You cannot warn people who have same roles with you.`)
							],
							ephemeral: true
						})
					}

					if (member === interaction.member) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Warn!`)
									.setDescription(`You cannot warn yourself.`)
							],
							ephemeral: true
						});
					}

					const memberWarns = await warnModel.findAll({
						where: {
							user: {
								id: member.id
							}
						}
					})

					if (memberWarns.length >= 5) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Warn`)
									.setDescription(`User has reached the maximum amount of warnings, you cannot warn them anymore... ban instead!`)
							],
							ephemeral: true
						})
					}

					const currentDate = Date.now()
					const generatedId = generateCode(10).toString()

					await warnModel.create({
						id: generatedId,
						date: currentDate,
						reason: reason,
						warner: interaction.user.id,
						user: {
							id: member.user.id,
							username: member.user.username
						}
					});

					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.warn)
								.setTitle(`${emojis.indicators.warn_yellow} Warned ${member.user.username}`)
								.setThumbnail(member.user.avatarURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.miscellaneous.hammer} Warned by :`, value: `- ${interaction.user}` },
									{ name: `${emojis.socials.discord_pixel} Member :`, value: `- ${member}` },
									{ name: `${emojis.cubecraft.id} Warn ID :`, value: `- \`${generatedId}\`` },
									{ name: `${emojis.miscellaneous.clock} Time :`, value: `- <t:${Math.floor(currentDate / 1000)}:F>` },
									{ name: `${emojis.miscellaneous.note} Reason :`, value: `- ${reason}` }
								)
						]
					})

					if (memberWarns.length === 4) {
						await interaction.followUp({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.warn_red} Limit Reached!`)
									.setDescription(`User has reached the maximum amount of warnings, it's time to ban them.`)
							],
							ephemeral: true
						})
					}

					await member.send({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.warn)
								.setTitle(`${emojis.indicators.warn_yellow} You Were Warned In ${interaction.guild.name}!`)
								.setThumbnail(interaction.guild.iconURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.miscellaneous.hammer} Warned By :`, value: `- ${interaction.user}` },
									{ name: `${emojis.miscellaneous.clock} Time :`, value: `- <t:${Math.floor(currentDate / 1000)}:F>` },
									{ name: `${emojis.miscellaneous.note} Reason :`, value: `- ${reason}` },
								)
						]
					})
				} catch (error) {
					if (error.code === 10007) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Not Found!`)
									.setDescription(`Member you were trying to warn was not found in this server.`)
							],
							ephemeral: true
						})
					} else if (error.message === "Cannot send messages to this user") {
						return interaction.followUp({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.warn)
									.setTitle(`${emojis.indicators.warn_yellow} Permission Denied!`)
									.setDescription(`I don't have permission to send messages to that user. Please inform them about their warning in public chat.`)
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

					const id = interaction.options.getString('id')

					const warn = await warnModel.findOne({
						where: {
							id: id
						}
					})

					if (!warn) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Not Found!`)
									.setDescription(`Warning with ID \`${id}\` wasn't found.`)
							],
							ephemeral: true
						});
					}

					const member = await interaction.guild.members.fetch(warn.user.id).catch(async (err) => {
						if (err.code === 10007) {

							await warnModel.destroy({
								where: {
									id: id
								}
							})

							return interaction.editReply({
								embeds: [
									new EmbedBuilder()
										.setColor(colors.wait)
										.setTitle(`${emojis.indicators.trash} Removed Warning From ${member.user.username}`)
										.setThumbnail(member.user.avatarURL({ size: 4096 }))
										.addFields(
											{ name: `${emojis.miscellaneous.hammer} Removed By :`, value: `- ${interaction.user}` },
											{ name: `${emojis.socials.discord_pixel} Member :`, value: `- ${member}` },
											{ name: `${emojis.miscellaneous.clock} Time :`, value: `- <t:${Math.floor(Date.now() / 1000)}:F>` },
											{ name: `${emojis.cubecraft.id} Warn Data : `, value: `- ID : \`${id}\`\n- Warner : <@${warn.warner}>\n- Reason : ${warn.reason}\n- Date : <t:${Math.floor(warn.date / 1000)}:F>` },
										)
								]
							})
						}
					})

					if (member.bot) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Remove!`)
									.setDescription(`You cannot remove warnings from bots.`)
							],
							ephemeral: true
						})
					}

					if (member.roles.highest.position >= interaction.member.roles.highest.position) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Remove!`)
									.setDescription(`You cannot remove warns from people who have same roles with you.`)
							],
							ephemeral: true
						})
					}

					if (member === interaction.member) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Remove!`)
									.setDescription(`You cannot remove warnings from yourself.`)
							],
							ephemeral: true
						});
					}

					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.wait)
								.setTitle(`${emojis.indicators.trash} Removed Warning From ${member.user.username}`)
								.setThumbnail(member.user.avatarURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.miscellaneous.hammer} Removed By :`, value: `- ${interaction.user}` },
									{ name: `${emojis.socials.discord_pixel} Member :`, value: `- ${member}` },
									{ name: `${emojis.miscellaneous.clock} Time :`, value: `- <t:${Math.floor(Date.now() / 1000)}:F>` },
									{ name: `${emojis.cubecraft.id} Warn Data : `, value: `- ID : \`${id}\`\n- Warner : <@${warn.warner}>\n- Reason : ${warn.reason}\n- Date : <t:${Math.floor(warn.date / 1000)}:F>` },
								)
						]
					})

					await warnModel.destroy({
						where: {
							id: id
						}
					})
				} catch (error) {
					print.error(error)
				}

				break;
		}
	}
}