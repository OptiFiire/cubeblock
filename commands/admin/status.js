const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('presence')
        .setDescription('Manage the status of CubeBlock bot.')
        .addStringOption(option => option
            .setName('type')
            .setDescription('The type of activity (Playing, Streaming, Listening, Watching).')
            .setRequired(true)
            .addChoices(
                { name: 'Playing', value: 'PLAYING' },
                { name: 'Streaming', value: 'STREAMING' },
                { name: 'Listening', value: 'LISTENING' },
                { name: 'Watching', value: 'WATCHING' }
            )
        )
        .addStringOption(option => option
            .setName('name')
            .setDescription('The name of the activity.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('status')
            .setDescription('The status of the bot (DND, Online, IDLE).')
            .setRequired(false)
            .addChoices(
                { name: 'DND', value: 'dnd' },
                { name: 'Online', value: 'online' },
                { name: 'IDLE', value: 'idle' }
            )
        ),

    async execute(interaction) {
        await interaction.reply('Pong!')
    }
}