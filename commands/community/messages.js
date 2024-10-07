const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { prettifyNumbers } = require('../../utils/prettifyNumbers')
const messagesModule = require('../../utils/messagesModule')
const UserModule = require('../../utils/userModule')
const emojis = require('../../json/emojis.json')
const colors = require('../../json/colors.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messages')
        .setDescription('Display\'s the amount of messages sent in server.')
        .addSubcommand(command => command
            .setName('user')
            .setDescription('Display\'s the amount of messages sent by a user.')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to check for messages of.')
            )
        )
        .addSubcommand(command => command
            .setName('server')
            .setDescription('Display\'s the amount of messages sent in server.')
        ),

    async execute(interaction) {

        switch (interaction.options.getSubcommand()) {
            case 'user':

                await interaction.deferReply()

                const user = interaction.options.getUser('user') || interaction.user
                const userProfile = await new UserModule(user.id).getProfile()
                const userMessages = await messagesModule.user(user.id, interaction.guild.id)

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(userProfile.user_profile.theme_colors === undefined ? userProfile.user_profile.accent_color : userProfile.user_profile.theme_colors[0])
                            .setTitle(`${emojis.cubecraft.social} ${user.username}'s messages.`)
                            .setDescription(`${user} has sent in total of \`${prettifyNumbers(userMessages.total_results)}\` messages in ${interaction.guild.name}.`)
                            .setThumbnail(user.avatarURL({ size: 4096 }))
                    ]
                })

                break;

            case 'server':

                await interaction.deferReply()

                const creationDateObj = new Date(interaction.guild.createdTimestamp);
                const humanReadableCreationDate = creationDateObj.toISOString().split('T')[0];
                const unixTimestampMilliseconds = new Date(humanReadableCreationDate).getTime();

                const serverMessages = await messagesModule.server(interaction.guild.id, unixTimestampMilliseconds)

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(colors.default)
                            .setTitle(`${emojis.cubecraft.social} ${interaction.guild.name}'s messages.`)
                            .setDescription(`There have sent in total of \`${prettifyNumbers(serverMessages.total_results)}\` messages in CubeBlock.`)
                            .setThumbnail(interaction.guild.iconURL({ size: 4096 }))
                    ]
                })

                break;
        }
    }
}