// const Giveaway = require("../schemas/giveawaySchema");
// const { request } = require("node:http");
// const { Events } = require('discord.js')

// client.on(Events.InteractionCreate, async (interaction) => {
//     if (interaction.isButton()) {
//         const customId = interaction.customId;

//         if (customId.startsWith("giveaway-join")) {
//             const giveawayId = customId.split("-").slice(2).join("-");
//             const giveaway = await Giveaway.findOne({ id: giveawayId });

//             //**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**\\

//             if (giveaway.participants.includes(interaction.user.id)) {
//                 const row = new ActionRowBuilder().addComponents(
//                     new ButtonBuilder()
//                         .setCustomId(`leave-giveaway-${giveawayId}`)
//                         .setLabel("Leave Giveaway")
//                         .setStyle(ButtonStyle.Danger)
//                 );
//                 await interaction.reply({
//                     embeds: [
//                         new EmbedBuilder()
//                             .setDescription(
//                                 `${e.warn} You\'ve already **joined** the giveaway!`
//                             )
//                             .setColor("Yellow"),
//                     ],
//                     ephemeral: true,
//                     components: [row],
//                 });
//             }

//             //**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**\\
//             else {
//                 const channel = await client.channels.fetch(giveaway.channelId);
//                 const message = await channel.messages.fetch(giveaway.messageId);
//                 const code = await Giveaway.findOne({ id: giveawayId });
//                 let buttonLabel = message.components[0].components[0].label;
//                 buttonLabel = (parseInt(buttonLabel) + 1).toString();

//                 const joinButton = new ButtonBuilder()
//                     .setCustomId(`giveaway-join-${code.id}`)
//                     .setLabel(buttonLabel)
//                     .setEmoji(e.party)
//                     .setStyle(ButtonStyle.Primary);

//                 giveaway.participants.push(interaction.user.id);
//                 const messagetf = await channel.messages.fetch(giveaway.messageId);
//                 await messagetf.edit({
//                     components: [new ActionRowBuilder().addComponents(joinButton)],
//                 });
//                 await giveaway.save();

//                 interaction.reply({
//                     embeds: [
//                         new EmbedBuilder()
//                             .setDescription(
//                                 `${e.checkmark} You've successfully **joined** the giveaway!`
//                             )
//                             .setColor("Green"),
//                     ],
//                     ephemeral: true,
//                 });
//             }

//             //**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**\\
//         } else if (customId.startsWith("leave-giveaway")) {
//             const giveawayId = customId.split("-").slice(2).join("-");
//             const giveaway = await Giveaway.findOne({ id: giveawayId });
//             const channel = await client.channels.fetch(giveaway.channelId);
//             const message = await channel.messages.fetch(giveaway.messageId);
//             const code = await Giveaway.findOne({ id: giveawayId });

//             let buttonLabel = await message.components[0].components[0].label;
//             buttonLabel = (parseInt(buttonLabel) - 1).toString();

//             const joinButton = new ButtonBuilder()
//                 .setCustomId(`giveaway-join-${code.id}`)
//                 .setLabel(buttonLabel)
//                 .setEmoji(e.party)
//                 .setStyle(ButtonStyle.Primary);

//             giveaway.participants = giveaway.participants.filter(
//                 (participantId) => participantId !== interaction.user.id
//             );
//             const messagetf = await channel.messages.fetch(giveaway.messageId);
//             await messagetf.edit({
//                 components: [new ActionRowBuilder().addComponents(joinButton)],
//             });
//             await giveaway.save();

//             if (interaction.message.embeds[0].description.includes("already")) {
//                 await interaction.message.edit({
//                     embeds: [
//                         new EmbedBuilder()
//                             .setDescription(
//                                 `${e.checkmark} You've successfully **left** the giveaway!`
//                             )
//                             .setColor("Green"),
//                     ],
//                     ephemeral: true,
//                 });
//             }
//         }
//     }
// });

// //**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**\\

// function selectWinners(participants, count) {
//     return participants.slice(0, count);
// }

// //**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**\\

// setInterval(async () => {
//     const giveaways = await Giveaway.find();

//     for (const giveaway of giveaways) {
//         if (!giveaway.ended) {
//             const now = ~~(Date.now() / 1000);
//             if (now >= giveaway.endTime) {
//                 try {
//                     giveaway.ended = true;
//                     await giveaway.save();
//                     const channel = await client.channels.fetch(giveaway.channelId);
//                     const message = await channel.messages.fetch(giveaway.messageId);
//                     const code = await Giveaway.findOne({ id: giveaway.id });

//                     const winners = selectWinners(
//                         giveaway.participants,
//                         giveaway.winnersCount
//                     );
//                     const winnersText = winners
//                         .map((winner) => `<@${winner}>`)
//                         .join(", ");
//                     const announcement = `${e.party} Congratulations to the winners : ${winnersText}!`;
//                     let buttonLabel = message.components[0].components[0].label;

//                     const joinButton = new ButtonBuilder()
//                         .setCustomId(`giveaway-join-${code.id}`)
//                         .setLabel(buttonLabel)
//                         .setEmoji(e.party)
//                         .setDisabled(true)
//                         .setStyle(ButtonStyle.Primary);

//                     const embed = new EmbedBuilder()
//                         .setDescription(
//                             `${winnersText} won the giveaway of **[${giveaway.prize}](${message.url})**!`
//                         )
//                         .setColor("DarkBlue")
//                         .setTitle("Giveaway Ended")
//                         .setThumbnail(message.embeds[0].thumbnail.url)
//                         .setFooter({
//                             text: `ID : ${giveaway.id}  •  Entries : ${giveaway.participants.length}`,
//                         });

//                     await message.edit({
//                         components: [new ActionRowBuilder().addComponents(joinButton)],
//                     });
//                     await channel.send({ embeds: [embed], content: announcement });
//                 } catch (error) {
//                     console.error("Error in giveaway check:", error);
//                 }
//             }
//         }
//     }
// }, 1500);