const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis = require('../../json/emojis.json');
const colors = require('../../json/colors.json');
const print = require('../../utils/print');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bans')
		.setDescription("Displays a list of banned members with their ban reasons and expiration.")
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

	async execute(interaction) {
		try {
			await interaction.deferReply();

			const bans = await interaction.guild.bans.fetch();

			if (!bans.size) {
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(colors.warn)
							.setTitle(`${emojis.indicators.x} No Bans Found!`)
							.setDescription(`${interaction.guild.name} does not have any banned members.`)
							.setThumbnail(" ")
					]
				});
				return;
			}

			const banList = Array.from(bans.values()).map((ban, index) => {
				const reasonMatch = ban.reason?.match(/(.*)\s~\s(\d+)/);
				const reason = reasonMatch ? reasonMatch[1] : ban.reason || '`No reason provided`';
				const banEnd = reasonMatch ? `<t:${Math.floor(reasonMatch[2] / 1000)}:R>` : '`Permanent`';
				return `**${index + 1}**. <@${ban.user.id}> - ${reason} (${banEnd})`;
			});

			const pageSize = 30;
			const pages = [];

			for (let i = 0; i < banList.length; i += pageSize) {
				const page = new EmbedBuilder()
					.setColor(colors.warn)
					.setTitle(`${emojis.indicators.warn_yellow} Banned Members of ${interaction.guild.name}`)
					.setDescription(banList.slice(i, i + pageSize).join('\n'))
					.setThumbnail(interaction.guild.iconURL({ size: 4096 }))
				pages.push(page);
			}

			let currentPage = 0;

			const message = await interaction.editReply({
				embeds: [pages[currentPage]],
				components: [
					new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('prev')
								.setEmoji(emojis.indicators.arrowL)
								.setStyle(ButtonStyle.Primary)
								.setDisabled(currentPage === 0),
							new ButtonBuilder()
								.setCustomId('page')
								.setLabel(`Page ${currentPage + 1}/${pages.length}`)
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),
							new ButtonBuilder()
								.setCustomId('next')
								.setEmoji(emojis.indicators.arrowR)
								.setStyle(ButtonStyle.Primary)
								.setDisabled(currentPage === pages.length - 1)
						)
				]
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
					components: [
						new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setCustomId('prev')
									.setEmoji(emojis.indicators.arrowL)
									.setStyle(ButtonStyle.Primary)
									.setDisabled(currentPage === 0),
								new ButtonBuilder()
									.setCustomId('page')
									.setLabel(`Page ${currentPage + 1}/${pages.length}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(true),
								new ButtonBuilder()
									.setCustomId('next')
									.setEmoji(emojis.indicators.arrowR)
									.setStyle(ButtonStyle.Primary)
									.setDisabled(currentPage === pages.length - 1)
							)
					]
				});
			});

			collector.on('end', async () => {
				await message.edit({
					components: [
						new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setCustomId('prev')
									.setEmoji(emojis.indicators.arrowL)
									.setStyle(ButtonStyle.Primary)
									.setDisabled(true),
								new ButtonBuilder()
									.setCustomId('page')
									.setLabel(`Page ${currentPage + 1}/${pages.length}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(true),
								new ButtonBuilder()
									.setCustomId('next')
									.setEmoji(emojis.indicators.arrowR)
									.setStyle(ButtonStyle.Primary)
									.setDisabled(true)
							)
					]
				});
			});

		} catch (error) {
			print.error(error);
		}
	}
};
