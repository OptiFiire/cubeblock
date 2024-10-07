const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");
const emojis = require("../../json/emojis.json");
const colors = require("../../json/colors.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emoji")
    .setDescription("Manages server emojis.")
    // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) => command
      .setName("add")
      .setDescription("Adds an emoji to the server.")
      .addAttachmentOption((option) => option
        .setName("emoji")
        .setDescription("The emoji you want to add to the server.")
        .setRequired(true))
      .addStringOption((option) => option
        .setName("name")
        .setDescription("The name of the emoji you want to add.")
        .setRequired(true)))
    .addSubcommand((command) => command
      .setName("remove")
      .setDescription("Removes an emoji from the server.")
      .addStringOption(option => option
        .setName("emoji")
        .setDescription("The emoji you want to remove.")
        .setRequired(true)))
    .addSubcommand((command) => command
      .setName("steal")
      .setDescription("Add a given emoji to the server.")
      .addStringOption(option => option
        .setName("emoji")
        .setDescription("The emoji you want to add to the server.")
        .setRequired(true))
      .addStringOption(option => option
        .setName("name")
        .setDescription("The name for your emoji.")
        .setRequired(true))),

  async execute(interaction) {
    const command = interaction.options.getSubcommand();

    switch (command) {
      case "add":
        const addingEmojiName = interaction.options.getString('name');
        const addingEmojiAttachment = interaction.options.getAttachment("emoji");
        const addingEmoji = await interaction.guild.emojis.create({
          name: addingEmojiName,
          attachment: addingEmojiAttachment.attachment,
        }).catch((err) => {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(colors.failure)
                .setDescription(`${emojis.indicators.x} Error : ${err.rawError.message}`)
            ]
          });
        });

        const emojiAddedMessage = new EmbedBuilder()
          .setColor(colors.success)
          .setDescription(`${emojis.indicators.checkmark} Emoji ${addingEmoji} has successfully \
been added to the server!`);

        await interaction.reply({ embeds: [emojiAddedMessage] });
        break;

      case "remove":
        const removingEmojiObject = interaction.options.getString("emoji");
        const removingEmoji = await interaction.guild.emojis.cache.find(
          (emj) => emj === removingEmojiObject
        ).catch(err => {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(colors.failure)
                .setDescription(`${emojis.indicators.x} Error: ${err.rawError.message}`)
            ]
          });
        })

        await removingEmoji.delete().catch(err => {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(colors.failure)
                .setDescription(`${emojis.indicators.x} Error: ${err.rawError.message}`)
            ]
          });
        })

        const emojiRemovedMessage = new EmbedBuilder()
          .setColor(colors.success)
          .setDescription(`${emojis.indicators.checkmark} Emoji :${removingEmojiObject.name}: \
has successfully been removed from the server!`);

        await interaction.reply({ embeds: [emojiRemovedMessage] });

        const errorEmbed = new EmbedBuilder()
          .setColor(colors.failure)
          .setDescription(
            `${emojis.indicators.x} Error: ${err.rawError.message}`
          );

        await interaction.reply({ embeds: [errorEmbed] });
        break;

      case "steal":
        let stealingEmojiObject = interaction.options.getString("emoji")?.trim();
        const stealingEmojiName = interaction.options.getString("name");

        if (stealingEmojiObject.startsWith("<") && stealingEmojiObject.endsWith(">")) {
          const id = stealingEmojiObject.match(/\d{15,}/g)[0];

          const type = await axios
            .get(`https://cdn.discordapp.com/emojis/${id}.gif`)
            .then((image) => {
              if (image) return "gif";
              else return "png";
            })
            .catch(() => {
              return "png";
            });

          stealingEmojiObject = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
        }

        await interaction.guild.emojis.cache.find(emj => emj === stealingEmojiObject)

        await interaction.guild.emojis
          .create({
            name: stealingEmojiName,
            attachment: stealingEmojiObject
          })
          .then((stolenEmojiNew) => {
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(colors.success)
                  .setDescription(`${emojis.indicators.checkmark} Stolen ${stolenEmojiNew}, with \
the name ${stealingEmojiName}.`)
              ]
            });
          })
          .catch((err) => {
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(colors.failure)
                  .setDescription(
                    `${emojis.indicators.x} Error: ${err.rawError.message}`
                  )
              ]
            });
          });
    }
  }
}
