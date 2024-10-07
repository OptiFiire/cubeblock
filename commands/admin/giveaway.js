const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const ms = require('ms')
const e = require('../../json/emojis.json')
function generateRandomCode(length) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}

	return result;
}

function selectWinners(participants, count) {
	let shuffled = participants.sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gw')
		.setDescription('Manage giveaways')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => subcommand
			.setName('start')
			.setDescription('Start a new giveaway')
			.addStringOption(option => option
				.setName('duration')
				.setDescription('Duration of the giveaway in minutes')
				.setRequired(true))
			.addStringOption(option => option
				.setName('prize')
				.setDescription('Prize of the giveaway')
				.setRequired(true))
			.addIntegerOption(option => option
				.setName('winners')
				.setDescription('Number of winners')
				.setRequired(true))
			.addChannelOption(option => option
				.setName('channel')
				.setDescription('Channel to post the giveaway')
				.setRequired(true)))
		.addSubcommand(subcommand => subcommand
			.setName('end')
			.setDescription('End an existing giveaway')
			.addStringOption(option => option
				.setName('giveaway_id')
				.setDescription('ID of the giveaway to end')
				.setRequired(true)))
		.addSubcommand(subcommand => subcommand
			.setName('reroll')
			.setDescription('Reroll a giveaway')
			.addStringOption(option => option
				.setName('giveaway_id')
				.setDescription('ID of the giveaway to reroll')
				.setRequired(true))
			.addIntegerOption(option => option
				.setName('winners')
				.setDescription('Number of new winners')
				.setRequired(true)))
		.addSubcommand(subcommand => subcommand
			.setName('edit')
			.setDescription('Edit an existing giveaway')
			.addStringOption(option => option
				.setName('giveaway_id')
				.setDescription('ID of the giveaway to edit')
				.setRequired(true))
			.addStringOption(option => option
				.setName('duration')
				.setDescription('New duration of the giveaway in minutes'))
			.addStringOption(option => option
				.setName('prize')
				.setDescription('New prize of the giveaway'))
			.addIntegerOption(option => option
				.setName('winners')
				.setDescription('New number of winners'))
			.addChannelOption(option => option
				.setName('channel')
				.setDescription('New channel to post the giveaway'))),

	async execute(interaction, client) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case 'start':
				await startGiveaway(interaction, client);
				break;
			case 'end':
				await endGiveaway(interaction, client);
				break;
			case 'reroll':
				await rerollGiveaway(interaction, client);
				break;
			case 'edit':
				await editGiveaway(interaction, client);
				break;
			default:
				await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`${e.x} Invalid command!`).setColor('Red')], ephemeral: true });
		}
	}
};

//**===================================  Giveaway Started  ==================================== **\\

async function startGiveaway(interaction, client) {
	const duration = interaction.options.getString('duration')
	const prizex = interaction.options.getString('prize');
	const winnersCountX = interaction.options.getInteger('winners');
	const channel = interaction.options.getChannel('channel');

	const endTimeX = ~~((Date.now() + ms(duration)) / 1000)
	const code = generateRandomCode(10)

	const embed = new EmbedBuilder()
		.setTitle(prizex)
		.setThumbnail(interaction.guild.iconURL())
		.setDescription(`React down below to enter!\n\n- **${e.clock} Ends : <t:${endTimeX}:R>**\n- ${e.party} **Winners : ${winnersCountX}**\n- ${e.link} **Hosted by : ${interaction.user}**\n`)
		.setTimestamp()
		.setFooter({ text: `ID: ${code}` })
		.setColor('Blue');

	const actionRow = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(`giveaway-join-${code}`)
				.setLabel('0')
				.setEmoji(e.party)
				.setStyle(ButtonStyle.Primary))

	await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`${e.checkmark} Giveaway started successfully!`).setColor('Green')], ephemeral: true });
	const sentMessage = await channel.send({ embeds: [embed], components: [actionRow] });

	await Giveaway.create({
		guildId: interaction.guild.id,
		channelId: channel.id,
		messageId: sentMessage.id,
		endTime: endTimeX,
		prize: prizex,
		winnersCount: winnersCountX,
		participants: [],
		id: code,
		ended: false
	});
}

//**===================================  Giveaway Ended  ==================================== **\\

async function endGiveaway(interaction, client) {
	const giveawayId = interaction.options.getString('giveaway_id');
	const giveaway = await Giveaway.findOne({ id: giveawayId });

	if (!giveaway) {
		return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`${e.x} Giveaway not found!`).setColor('Red')], ephemeral: true });
	}

	const winners = selectWinners(giveaway.participants, giveaway.winnersCount);
	const winnersText = winners.map(winner => `<@${winner}>`).join(', ');
	const announcement = `🎉 The giveaway has ended! Congratulations to the winners : ${winnersText}`;

	try {
		const channel = await client.channels.fetch(giveaway.channelId);
		const message = await channel.messages.fetch(giveaway.messageId);

		const embed = new EmbedBuilder()
			.setDescription(`${winnersText} won the giveaway of **[${giveaway.prize}](${message.url})**!`)
			.setColor('DarkBlue')
			.setTitle("Giveaway Ended")
			.setThumbnail(message.embeds[0].thumbnail.url)
			.setFooter({ text: `ID : ${giveaway.id} • Entries : ${giveaway.participants.length}` });

		//** ==================== EDIT OLD GIVEAWAY ================== **\\

		const joinButton = new ButtonBuilder()
			.setCustomId(`giveaway-join-${code}`)
			.setLabel(giveaway.participants.length.toString())
			.setEmoji(e.party)
			.setDisabled(true)
			.setStyle(ButtonStyle.Primary);

		const embedGiveaway = new EmbedBuilder()
			.setTitle(prizex)
			.setThumbnail(interaction.guild.iconURL())
			.setDescription(`Giveaway has ended!\n\n- **${e.clock} Ended : <t:${endTimeX}:R>\n- ${e.party} Winners: ${winnersText}\n- ${e.link} Hosted by: ${interaction.user}**\n`)
			.setTimestamp()
			.setFooter({ text: `ID: ${code}` })
			.setColor('Blue');

		//** ==================== EDIT OLD GIVEAWAY ================== **\\

		await message.edit({ components: [joinButton], embeds: [embedGiveaway] });
		await channel.send({ embeds: [embed], content: announcement });

	} catch (error) {
		console.error("Error ending giveaway:", error);
		return interaction.reply({ content: "There was an error ending the giveaway.", ephemeral: true });
	}

	giveaway.ended = true;
	await giveaway.save();

	await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`${e.checkmark} Giveaway ended successfully!`).setColor('Green')], ephemeral: true });
}

//**===================================  Giveaway Rerolled  ==================================== **\\

async function rerollGiveaway(interaction, client) {
	const giveawayId = interaction.options.getString('giveaway_id');
	const newWinnersCount = interaction.options.getInteger('winners');

	const giveaway = await Giveaway.findOne({ id: giveawayId });
	if (!giveaway) {
		return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`${e.x} Giveaway not found!`)], ephemeral: true });
	}

	const channel = await client.channels.fetch(giveaway.channelId);
	const message = await channel.messages.fetch(giveaway.messageId);

	const newWinners = selectWinners(giveaway.participants, newWinnersCount);
	const winnersText = newWinners.map(winner => `<@${winner}>`).join(', ');
	const announcement = `🎉 New winners: ${winnersText}!`;

	const embed = new EmbedBuilder()
		.setDescription(`${winnersText} new winner(s) of **[${giveaway.prize}](${message.url})**!`)
		.setColor('DarkBlue')
		.setTitle("Giveaway Rerolled")
		.setThumbnail(message.embeds[0].thumbnail.url)
		.setFooter({ text: `ID : ${giveaway.id} • Entries : ${giveaway.participants.length}` });

	await channel.send({ embeds: [embed], content: announcement });

	await interaction.reply({ embeds: [new EmbedBuilder().setDescription(`${e.checkmark} Giveaway rerolled!`).setColor('Green')], ephemeral: true });
}

//**===================================  Giveaway Edited  ==================================== **\\

async function editGiveaway(interaction, client) {
	const giveawayId = interaction.options.getString('giveaway_id');
	const newDuration = interaction.options.getString('duration');
	const newPrize = interaction.options.getString('prize');
	const newWinnersCount = interaction.options.getInteger('winners');
	const newChannel = interaction.options.getChannel('channel');

	const giveaway = await Giveaway.findOne({ id: giveawayId });
	if (!giveaway) {
		return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`${e.x} Giveaway wasn't found!`).setColor('Red')], ephemeral: true });
	}

	let newEndTime;
	if (newDuration) {
		newEndTime = Math.floor((Date.now() + ms(duration)) / 1000)
	}

	await Giveaway.findOneAndUpdate({
		id: giveawayId,
		$set: {
			endTime: newEndTime || giveaway.endTime,
			prize: newPrize || giveaway.prize,
			winnersCount: newWinnersCount || giveaway.winnersCount,
			channelId: newChannel?.id || giveaway.channelId
		}
	});

	const channel = await client.channels.fetch(giveaway.channelId);
	const message = await channel.messages.fetch(giveaway.messageId);
	if (message) {
		const embedx = new EmbedBuilder({
			title: `${newPrize || giveaway.prize}`,
			description: `React down below to enter!\n\n- **${e.clock} Ends : <t:${newEndTime || giveaway.endTime}:R>\n- ${e.party} Winners: ${newWinnersCount || giveaway.winnersCount}\n- ${e.link} Hosted by: ${interaction.user}**\n`
		})

		await message.edit({ embeds: [embedx] });
	}

	await interaction.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`${e.checkmark} Rerolled the giveaway!`)], ephemeral: true });
}
