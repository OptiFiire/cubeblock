const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticker')
    .setDescription('Adds a sticker to the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
    .addSubcommand(command => command
      .setName('add')
      .setDescription('Adds a sticker to the server')
      .addAttachmentOption(option => option
        .setName('sticker')
        .setDescription('The sticker you want to add to the server')
        .setRequired(true))
      .addStringOption(option => option
        .setName('name')
        .setDescription('The name of the sticker you want to add')
        .setRequired(true)))
    .addSubcommand(command => command
      .setName('remove')
      .setDescription('Removes a sticker from the server')
      .addStringOption(option => option
        .setName('name')
        .setDescription('The name of the sticker you want to remove')
        .setRequired(true))),

  async execute(interaction) {

    const command = interaction.options.getSubcommand();
    const stickerName = interaction.options.getString('name');

    switch (command) {
      case 'add':

        const stickerUpload = interaction.options.getAttachment('sticker');

        const sticker = await interaction.guild.stickers.create({ file: `${stickerUpload.attachment}`, name: `${stickerName}` }).catch(err => {
          console.log(err);

          const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`<:z_cross:1117744812691570688> **${err.rawError.message}**`)

          return interaction.reply({ embeds: [errorEmbed] });
        });

        const stickerAddedEmbed = new EmbedBuilder()
          .setColor('Green')
          .setDescription('**<:z_tick:1117744832736149604> Your sticker has successfully been added to the server!**')

        if (!sticker) return;

        await interaction.reply({ embeds: [stickerAddedEmbed] })
    }
    //====================================================================
    switch (command) {

      case 'remove':

        try {
          const sticker = interaction.guild.stickers.cache.find(sticker =>
            sticker.name.toLowerCase() === stickerName.toLowerCase());

          if (!sticker) {

            const notFoundEmbed = new EmbedBuilder()
              .setColor('Red')
              .setDescription(`<:z_cross:1117744812691570688> **The sticker you wanted to remove is not found.**`)

            return interaction.reply({ embeds: [notFoundEmbed] })
          }
          await sticker.delete()

          const stickerRemoved = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`<:z_tick:1117744832736149604> **Your sticker has successfully been removed from the server!**`);

          return interaction.reply({ embeds: [stickerRemoved] });
        } catch (error) {
          console.error(error);

          const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`<:z_cross:1117744812691570688> **${err.rawError.message}**`)

          await interaction.reply({ embeds: [errorEmbed] })
        }
    }
  }
}