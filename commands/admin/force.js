const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");
const colors = require('../../json/colors.json')
const emojis = require('../../json/emojis.json')
const therapy = require('../../models/therapyModel')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("force")
        .setDescription("Urgent therapy required!")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(command => command
            .setName('book')
            .setDescription("Urgent therapy required!")
            .addUserOption(option => option
                .setName("user")
                .setDescription("Choose a user to force to book.")
                .setRequired(true)
            ),
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const lvRole = interaction.guild.roles.cache.find(role => role.id === "1215609070250106941")
        const lvUser = await interaction.guild.members.cache.get("811143342309507092")

        if (user.id === interaction.user.id) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(colors.failure)
                        .setTitle(`${emojis.indicators.x} Cannot Force Yourself.`)
                        .setDescription("You cannot force yourself to book your own therapy session.")
                ]
            });
        }

        if (user === lvUser) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(colors.failure)
                        .setTitle(`${emojis.indicators.x} Cannot Force ${lvUser.user.username}`)
                        .setDescription(`You cannot force ${lvUser} to book their own therapy.`)
                ]
            });
        }

        const userTherapySession = await therapy.findOne({
            where: {
                user: {
                    id: user.id
                }
            }
        })

        if (userTherapySession) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(colors.failure)
                        .setTitle(`${emojis.indicators.x} Found Session!`)
                        .setDescription(`${user} already has a therapy session scheduled.`)
                ]
            });
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);

        await therapy.create({
            type: 'urgent',
            user: {
                username: user.username,
                id: user.id
            },
            startTime: startTime,
            endTime: endTime
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(lvRole.color)
                    .setTitle(`${emojis.indicators.warn_red} Urgent therapy!`)
                    .setThumbnail(user.avatarURL({ size: 4096 }))
                    .setDescription(`${user} has successfully booked an emergency therapeutical session with ${lvUser}.`)
            ],
        });
    },
};
