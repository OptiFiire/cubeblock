const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const colors = require('../../json/colors.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('icon')
        .setDescription('Gets the icon of the server.'),

    async execute(interaction) {
        await interaction.deferReply()

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.default)
                    .setTitle(`${interaction.guild.name}'s server icon.`)
                    .setImage(interaction.guild.iconURL({ size: 4096 }))
            ],
        })
    }
}