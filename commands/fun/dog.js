const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dog')
    .setDescription('moo'),

  async execute(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#b300ff')
          .setImage('https://media.discordapp.net/attachments/1079044051564773477/1201547470304456877/IMG_20240123_133959_778.jpg?ex=65ca3748&is=65b7c248&hm=5cfd190de098f43fc6e30d8ec49e91a6a8154c1f72f5443532328e0ccec4c19f&=&format=webp&width=669&height=669')
      ]
    })
  }
}