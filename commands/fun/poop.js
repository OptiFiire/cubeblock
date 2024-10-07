const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poop")
    .setDescription("Gives you co-kicked role."),

  async execute(interaction) {

    const laradeRole = interaction.guild.roles.cache.find(role => role.id === "1171760993840398366")

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(laradeRole.color)
          .setDescription('Yes, my lord?')
          .setImage(
            'https://media.discordapp.net/attachments/1142776999971143710/1201545095271428178/IMG_8119.jpg?ex=65ca3512&is=65b7c012&hm=3c5f283aba3dd43a4446cd79748ee06d685e4da917601f7a877a5f1967c4704f&=&format=webp&width=669&height=669'
          )
      ]
    })
  }
}