const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { prettifyNumbers } = require('../../utils/prettifyNumbers')
const messagesModule = require('../../utils/messagesModule')
const emojis = require('../../json/emojis.json')
const colors = require('../../json/colors.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Shows the information about server.'),

	async execute(interaction) {

		await interaction.deferReply()

		const memberCount = interaction.guild.memberCount;
		const botCount = interaction.guild.members.cache.filter(member => member.user.bot).size;
		const userCount = memberCount - botCount;

		const creationDateObj = new Date(interaction.guild.createdTimestamp);
		const humanReadableCreationDate = creationDateObj.toISOString().split('T')[0];
		const unixTimestampMilliseconds = new Date(humanReadableCreationDate).getTime();

		const serverMessages = await messagesModule.server(interaction.guild.id, unixTimestampMilliseconds)

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(colors.default)
					.setTitle(`${emojis.socials.cubeblock_pixel} ${interaction.guild.name}`)
					.setThumbnail(interaction.guild.iconURL({ size: 4096 }))
					.setImage(interaction.guild.bannerURL({ size: 4096 }))
					.addFields(
						{ name: `${emojis.miscellaneous.clock} Created : `, value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:R>`, inline: true },
						{ name: `${emojis.miscellaneous.crown} Owner : `, value: `<@${interaction.guild.ownerId}>`, inline: true },
						{ name: ` `, value: ` `, inline: true },
						{ name: `${emojis.miscellaneous.link} Vanity URL (${interaction.guild.vanityURLCode === null ? `Inactive` : `Active`}) : `, value: `\`.gg/cubeblock\``, inline: true },
						{ name: `${emojis.cubecraft.social} Messages : `, value: `\`${prettifyNumbers(serverMessages.total_results)}\``, inline: true },
						{ name: ` `, value: ` `, inline: true },
						{ name: `${emojis.miscellaneous.upvote} Members : `, value: `- Total : \`${prettifyNumbers(memberCount)}\`\n- Bots : \`${botCount}\`\n- Users: \`${prettifyNumbers(userCount)}\``, inline: true },
						{ name: `${emojis.miscellaneous.note} Description : `, value: `${interaction.guild.description || "`None`"}`, inline: true },
						{ name: ` `, value: ` `, inline: true },
						{ name: `${emojis.miscellaneous.boost} Boosts : `, value: `\`${interaction.guild.premiumSubscriptionCount}\``, inline: true },
					)
			]
		});
	}
}