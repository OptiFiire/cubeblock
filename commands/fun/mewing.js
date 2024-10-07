const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const colors = require("../../json/colors.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mewing")
    .setDescription(
      "99.9% of the mewers quit before getting a perfect jawline"
    ),

  async execute(interaction) {
    const mewGif =
      "https://media.discordapp.net/attachments/1221325947475726397/1222184500746780752/a_48f0e253f22ef348b1d8c6921b8e79aa.gif?ex=6627c004&is=66154b04&hm=7e5a6745297bbc60453eaafec6a38250db6636fe1829e0291bf74bd872d6e1f6&=&width=160&height=160";

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.invisible)
          .setTitle("mew")
          .setImage(mewGif)
      ],
    });
  },
};
