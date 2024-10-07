const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const roles = require('../../json/roles.json');
const emojis = require('../../json/emojis.json');
const colors = require('../../json/colors.json');
const print = require('../../utils/print');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Manages server\'s bans.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addSubcommand(command => command
			.setName('temporary')
			.setDescription('Ban a member from the server temporarily.')
			.addUserOption(option => option
				.setName('member')
				.setDescription('Choose a member to ban from the server.')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('duration')
				.setDescription('Choose a time for user to be timed out.')
				.setRequired(true)
				.addChoices(
					{ name: '1 day', value: '1' },
					{ name: '3 days', value: '3' },
					{ name: '7 days', value: '7' },
					{ name: '14 days', value: '14' },
					{ name: '30 days', value: '30' }
				)
			)
			.addStringOption(option => option
				.setName('reason')
				.setDescription('Choose a reason to ban from the server.')
			),
		)
		.addSubcommand(command => command
			.setName('permanent')
			.setDescription('Ban a member from the server permanently.')
			.addUserOption(option => option
				.setName('member')
				.setDescription('Choose a member to ban from the server.')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('reason')
				.setDescription('Choose a reason to ban from the server.')
			)
		)
		.addSubcommand(command => command
			.setName('remove')
			.setDescription('Unban a user from the server.')
			.addUserOption(option => option
				.setName('user')
				.setDescription('Enter a user ID to unban from the server.')
				.setRequired(true)
			)
		),

	async execute(interaction) {

		switch (interaction.options.getSubcommand()) {
			case 'temporary':
				try {
					await interaction.deferReply()

					const reason = (interaction.options.getString('reason') || "No reason provided").toString();
					const member = interaction.options.getMember('member');

					if (reason.includes("~")) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Illegal Character!`)
									.setDescription(`Invalid reason format, reason field cannot include the character \` ~ \`.`)
							],
							ephemeral: true
						})
					}

					if (member.roles.cache.has(roles.staff)) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Ban`)
									.setDescription(`You cannot ban any of staff members.`)
							],
							ephemeral: true
						})
					}

					if (member.roles.highest.position >= interaction.member.roles.highest.position) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Can't Ban`)
									.setDescription(`You cannot ban people who have same roles with you.`)
							],
							ephemeral: true
						})
					}

					if (member === interaction.user) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Cannot Ban!`)
									.setDescription(`You cannot ban yourself.`)
							],
							ephemeral: true
						});
					}

					const currentDate = Math.floor(Date.now() / 1000)
					const duration = parseInt(interaction.options.getString('duration'), 10);

					let unbanDate = new Date();
					unbanDate.setDate(unbanDate.getDay() + duration);
					unbanDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

					await interaction.guild.bans.create(member, {
						reason: `${reason} ~ ${unbanDate.getTime()}`
					});

					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.failure)
								.setTitle(`${emojis.indicators.barrier} Temporarily Banned ${member.user.username}!`)
								.setThumbnail(member.user.avatarURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.cubecraft.exclamation} Reason :`, value: `- ${reason}` },
									{ name: `${emojis.socials.discord_pixel} Member :`, value: `- ${member}` },
									{ name: `${emojis.indicators.lock_closed} Ban Date :`, value: `- <t:${currentDate}:F>` },
									{ name: `${emojis.indicators.lock_open} Unban Date :`, value: `- <t:${Math.floor(unbanDate.getTime() / 1000)}:F>` },
									{ name: `${emojis.miscellaneous.hammer} Banned by :`, value: `- ${interaction.user}` }
								)
						]
					})

					await member.send({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.failure)
								.setTitle(`${emojis.indicators.barrier} You have been temporarily banned from ${interaction.guild.name}!`)
								.setThumbnail(interaction.guild.iconURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.cubecraft.exclamation} Reason :`, value: `- ${reason}` },
									{ name: `${emojis.indicators.lock_closed} Ban Date :`, value: `- <t:${currentDate}:F>` },
									{ name: `${emojis.indicators.lock_open} Unban Date :`, value: `- <t:${Math.floor(unbanDate.getTime() / 1000)}:F>` },
									{ name: `${emojis.miscellaneous.hammer} Banned by :`, value: `- ${interaction.user}` }
								)
						]
					}).catch(async () => {
						await interaction.followUp({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.warn)
									.setTitle(`${emojis.indicators.warn_yellow} Not notified.`)
									.setDescription(`Failed to send a notifying message to the banned member.`)
							],
							ephemeral: true
						})
					})

				} catch (error) {
					if (error.code === 10007) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Not Found!`)
									.setDescription(`Member you were trying to ban was not found in this server.`)
							],
							ephemeral: true
						})
					} else {
						print.error(error)
					}
				}

				break;

			case 'permanent':
				try {
					await interaction.deferReply()

					const reason = interaction.options.getString('reason') || "No reason provided";
					const member = interaction.options.getMember('member');

					if (reason.toString().includes("~")) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Illegal Character!`)
									.setDescription(`Invalid reason format, reason field cannot include the character \` ~ \`.`)
							],
							ephemeral: true
						})
					}
					if (member.roles.cache.has(roles.staff)) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Cannot Ban!`)
									.setDescription(`You cannot ban any of staff members.`)
							],
							ephemeral: true
						})
					}
					if (member.roles.highest.position >= interaction.member.roles.highest.position) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Cannot Ban!`)
									.setDescription(`You cannot ban people who have same roles with you.`)
							],
							ephemeral: true
						})
					}
					if (member === interaction.member) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Cannot Ban!`)
									.setDescription(`You cannot ban yourself.`)
							],
							ephemeral: true
						});
					}

					const currentDate = Math.floor(Date.now() / 1000)

					await interaction.guild.bans.create(member, { reason: reason })

					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.failure)
								.setTitle(`${emojis.indicators.barrier} Permanently Banned ${member.user.username}!`)
								.setThumbnail(member.user.avatarURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.cubecraft.exclamation} Reason :`, value: `- ${reason}` },
									{ name: `${emojis.socials.discord_pixel} Member :`, value: `- ${member}` },
									{ name: `${emojis.miscellaneous.clock} Date :`, value: `- <t:${currentDate}:F>` },
									{ name: `${emojis.miscellaneous.hammer} Banned by :`, value: `- ${interaction.user}` }
								)
						]
					})

					await member.send({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.failure)
								.setTitle(`${emojis.indicators.barrier} You have been permanently banned from ${interaction.guild.name}!`)
								.setThumbnail(interaction.guild.iconURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.cubecraft.exclamation} Reason :`, value: `- ${reason}` },
									{ name: `${emojis.miscellaneous.clock} Date :`, value: `- <t:${currentDate}:F>` },
									{ name: `${emojis.miscellaneous.hammer} Banned by :`, value: `- ${interaction.user}` }
								)
						]
					}).catch(async () => {
						await interaction.followUp({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.warn)
									.setTitle(`${emojis.indicators.warn_yellow} Not notified.`)
									.setDescription(`Failed to send a notifying message to the banned member.`)
							],
							ephemeral: true
						})
					})

				} catch (error) {
					if (error.code === 10007) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Not Found!`)
									.setDescription(`Member you were trying to ban was not found in this server.`)
							],
							ephemeral: true
						})
					} else {
						print.log(error)
					}
				}

				break;

			case 'remove':
				try {
					await interaction.deferReply()

					const user = interaction.options.getUser('user');
					const bans = await interaction.guild.bans.fetch();

					bans.find(b => b.user.id === user.id);

					await interaction.guild.members.unban(user)

					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.success)
								.setTitle(`${emojis.indicators.checkmark} Unbanned ${user.username}!`)
								.setThumbnail(user.avatarURL({ size: 4096 }))
								.addFields(
									{ name: `${emojis.socials.discord_pixel} User :`, value: `- ${user}` },
									{ name: `${emojis.miscellaneous.clock} Date :`, value: `- <t:${Math.floor(Date.now() / 1000)}:F>` },
									{ name: `${emojis.miscellaneous.hammer} Unbanned by :`, value: `- ${interaction.user}` }
								)
						]
					})
				} catch (error) {
					if (error.code === 10026) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} Unknown Ban!`)
									.setDescription(`This user was not banned in this server.`)
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