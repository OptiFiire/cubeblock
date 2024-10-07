const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js')
const userFunctions = require('../../utils/userModule')
const warnModel = require('../../models/warnModel')
const emojis = require('../../json/emojis.json');
const colors = require('../../json/colors.json');
const print = require('../../utils/print');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warns')
		.setDescription('Shows all server warnings.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addSubcommand(command => command
			.setName('user')
			.setDescription('View the warns of a specific user.')
			.addUserOption(option => option
				.setName('user')
				.setDescription('Enter the user to check their warnings.')
				.setRequired(true)
			)
		)
		.addSubcommand(command => command
			.setName('server')
			.setDescription('Shows the list of everyone who were warned.')
		),

	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case 'user':
				try {
					await interaction.deferReply();

					const user = interaction.options.getUser('user')

					const warns = await warnModel.findAll({
						where: {
							user: {
								id: user.id
							}
						}
					})

					if (user.bot) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} No warnings`)
									.setDescription(`Bot's cannot have any warnings!`)

							]
						})
					}

					if (warns.length === 0) {
						return interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.failure)
									.setTitle(`${emojis.indicators.x} No warnings`)
									.setDescription(`${user} doesn't have any warnings.`)
							]
						})
					}

					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor((await (new userFunctions(user.id)).getProfile()).user.accent_color || colors.invisible)
								.setTitle(`${user.username}'s Warns.`)
								.setDescription(
									warns.length < 5
										? `${emojis.cubecraft.exclamation} Member needs to have **${5 - warns.length}** warnings to reach warn limit.`
										: `${emojis.indicators.warn_red} Member has reached warn limit. No more warnings can be added.`
								)
								.setThumbnail(user.avatarURL({ size: 4096 }))
								.addFields(warns.map((warn, i) => {
									return {
										name: `${i + 1}. ${emojis.cubecraft.id} \`${warn.id}\` :`,
										value: `- Reason : ${warn.reason}\n- Warner : <@${warn.warner}>\n- Date : <t:${Math.floor(warn.date / 1000)}:F>`
									}
								}))
						]
					})
				} catch (error) {
					print.error(error)
				}
				break;

			case 'server':
				try {
					await interaction.deferReply();
					
					const warns = await warnModel.findAll();

					const userWarns = warns.reduce((acc, warn) => {
						if (!acc[warn.user.id]) {
							acc[warn.user.id] = [];
						}
						acc[warn.user.id].push(warn);
						return acc;
					}, {});

					const serverWarns = Object.entries(userWarns).map(([userId, userWarns], i) => {
						const warnDetails = userWarns.map(warn => `- \`${warn.id}\` - ${warn.reason}`).join('\n');
						return `**${i + 1}**. <@${userId}> - **${userWarns.length}** warn${userWarns.length > 1 ? 's' : ''} ${userWarns.length >= 5 ? `${emojis.indicators.warn_red}` : ''} :\n${warnDetails}\n`;
					});

					const pageSize = 10;
					const pages = [];

					for (let i = 0; i < serverWarns.length; i += pageSize) {
						const page = new EmbedBuilder()
							.setColor(colors.warn)
							.setTitle(`${emojis.indicators.warn_yellow} All Warned Members of CubeBlock.`)
							.setDescription(`The users marked with ${emojis.indicators.warn_red}, have reached the maximum limit of warns.\n\n${serverWarns.slice(i, i + pageSize).join('\n')}`)
							.setThumbnail(interaction.guild.iconURL({ size: 4096 }));
						pages.push(page);
					}

					if (pages.length === 0) {
						await interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setColor(colors.warn)
									.setTitle(`${emojis.indicators.x} Not Found!`)
									.setDescription(`${interaction.guild.name} does not have any warned members.`)
									.setThumbnail(" ")
							]
						});
						return;
					}

					let currentPage = 0;

					const updateButtons = (currentPage) => [
						new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setCustomId('prev')
									.setEmoji(emojis.indicators.arrowL)
									.setStyle(ButtonStyle.Primary)
									.setDisabled(currentPage === 0),
								new ButtonBuilder()
									.setCustomId('current')
									.setLabel(`${currentPage + 1}/${pages.length}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(true),
								new ButtonBuilder()
									.setCustomId('next')
									.setEmoji(emojis.indicators.arrowR)
									.setStyle(ButtonStyle.Primary)
									.setDisabled(currentPage === pages.length - 1)
							)
					];

					const message = await interaction.editReply({
						embeds: [pages[currentPage]],
						components: updateButtons(currentPage)
					});

					const filter = i => i.user.id === interaction.user.id;
					const collector = message.createMessageComponentCollector({ filter, time: 60_000 });

					collector.on('collect', async i => {
						if (i.customId === 'prev') {
							currentPage--;
						} else if (i.customId === 'next') {
							currentPage++;
						}

						await i.update({
							embeds: [pages[currentPage]],
							components: updateButtons(currentPage)
						});
					});

					collector.on('end', async () => {
						await message.edit({
							components:
								updateButtons(currentPage)
									.map(row => row.components.forEach(button => button.setDisabled(true)))
						});
					});

				} catch (error) {
					print.error(error);
				}

				break;
		}
	}
}