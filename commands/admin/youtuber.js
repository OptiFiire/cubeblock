const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const youtuberModel = require('../../models/youtuberModel')
const colors = require('../../json/colors.json')
const emojis = require('../../json/emojis.json')
const roles = require('../../json/roles.json')
const print = require('../../utils/print')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtuber')
        .setDescription("Manage cubeblock's youtuber partnership system.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(command => command
            .setName('add')
            .setDescription('Adds a youtuber to the programme.')
            .addStringOption(option => option
                .setName('id')
                .setDescription('The channel ID of the youtuber.')
                .setRequired(true)
            )
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user whose channel ID to add.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('auto-reaction')
                .setDescription('The reaction to assign automatically after every post.')
            )
        )
        .addSubcommand(command => command
            .setName('remove')
            .setDescription('Removes a youtuber from the programme.')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user whose channel ID to remove.')
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName('edit-reaction')
            .setDescription('Edits the reaction assigned to a youtuber.')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user whose channel ID to edit.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('reaction')
                .setDescription('The new reaction to assign to the youtuber.')
                .setRequired(true)
            )
        ),

    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'add':
                try {
                    const channelID = interaction.options.getString('id');
                    const user = interaction.options.getUser('user');
                    const reaction = interaction.options.getString('auto-reaction');

                    const youtuber = await youtuberModel.findOne({ where: { id: channelID } })

                    if (youtuber) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(colors.failure)
                                    .setTitle(`${emojis.indicators.x} Youtuber already a part of the programme!`)
                                    .setDescription(`${user} is already a part of CubeBlock's YouTube partners.`)
                            ],
                            ephemeral: true
                        })
                    }

                    await youtuberModel.create({
                        id: channelID,
                        user: {
                            id: user.id,
                            username: user.username
                        },
                        reaction: reaction,
                        lastVideo: ""
                    });

                    await interaction.guild.members.cache.get(user.id).roles.add(roles.youtuber);

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.success)
                                .setTitle(`${emojis.rewards.party} New YouTube Partner!`)
                                .setDescription(`Congratulations! ${user} has become one of CubeBlock's YouTube partners.`)
                        ]
                    })
                } catch (error) {
                    print.error(error)
                }

                break;


            case 'remove':
                try {
                    const user = interaction.options.getUser('user');

                    const youtuber = await youtuberModel.findOne({
                        where: {
                            user: {
                                id: user.id
                            }
                        }
                    })

                    if (!youtuber) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(colors.failure)
                                    .setTitle(`${emojis.indicators.x} User not a part of the programme!`)
                                    .setDescription(`${user} is not a part of CubeBlock's YouTube partners.`)
                            ],
                            ephemeral: true
                        })
                    }

                    await youtuber.destroy()

                    await interaction.guild.members.cache.get(user.id).roles.remove(roles.youtuber);

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.success)
                                .setTitle(`${emojis.indicators.checkmark} YouTube Partner Removed!`)
                                .setDescription(`The ${user}'s partner status has been updated. You are no longer a part of CubeBlock's YouTube partners.`)
                        ]
                    })
                } catch (error) {
                    print.error(error)
                }
                break;

            case 'edit-reaction':
                try {
                    const user = interaction.options.getUser('user')
                    const reaction = interaction.options.getString('reaction');

                    const member = await interaction.guild.members.cache.get(user.id)

                    if ((await member.roles.cache.get(roles.youtuber) === undefined)) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(colors.failure)
                                    .setTitle(`${emojis.indicators.x} User not a part of the programme!`)
                                    .setDescription(`${user} is not a part of CubeBlock's YouTube partners.`)
                            ],
                            ephemeral: true
                        })
                    }

                    const youtuber = await youtuberModel.findOne({
                        where: {
                            user: {
                                id: user.id
                            }
                        }
                    })

                    youtuber.reaction = reaction
                    youtuber.save()

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.success)
                                .setTitle(`${emojis.indicators.checkmark} Reaction Updated!`)
                                .setDescription(`Successfully updated the reaction for ${user}'s uploads to ${reaction}.`)
                        ]
                    })
                } catch (error) {
                    print.error(error)
                }
                break;
        }
    }
}

