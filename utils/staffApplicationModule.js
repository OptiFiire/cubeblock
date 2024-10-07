const {
    EmbedBuilder,
    ButtonBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonStyle,
    ActionRowBuilder,
    ThreadAutoArchiveDuration
} = require("discord.js");
const roles = require("../json/roles.json")
const emojis = require("../json/emojis.json");
const colors = require("../json/colors.json");
const channels = require("../json/channels.json");
const { generateCode } = require("./codeGenerator")
const { decodeColor } = require("./colorIdentifier")
const Cooldown = require("../models/cooldownModel");
const StaffApplication = require('../models/staffApplicationModel')
const UserFunctions = require("./userModule");

class staffApplication {
    constructor(interaction) {
        this.interaction = interaction;
    }

    async openModal() {
        const interaction = this.interaction

        if (interaction.member.roles.cache.has(roles.staff)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(colors.failure)
                        .setTitle(`${emojis.indicators.x} Only Members!`)
                        .setDescription(`You are already a staff member in this server.`)
                ],
                ephemeral: true,
            });
        }

        const userApplicationCooldown = await Cooldown.findOne({
            where: {
                user: {
                    id: interaction.user.id
                },
                action: "applyForStaffButton"
            }
        });

        if (userApplicationCooldown) {
            if (Date.now() < userApplicationCooldown.expires) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(colors.failure)
                            .setTitle(`${emojis.indicators.x} On Cooldown!`)
                            .setDescription(`You are on cooldown until \
**<t:${Math.floor(userApplicationCooldown.expires / 1000)}:F>.**`)
                    ],
                    ephemeral: true,
                });
            }
        }

        const activeApplication = await StaffApplication.findOne({
            where: {
                submitter: {
                    id: interaction.user.id
                }
            }
        })

        if (activeApplication) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(colors.failure)
                        .setTitle(`${emojis.indicators.x} Active Application!`)
                        .setDescription(`You have active staff application which is not checked by staff yet.`)
                ],
                ephemeral: true,
            });
        }

        await interaction.showModal(
            new ModalBuilder()
                .setCustomId("applyForStaffModal")
                .setTitle("Staff StaffApplication")
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setLabel("How old are you?")
                            .setCustomId("submitterAge")
                            .setMaxLength(2)
                            .setMinLength(2)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setLabel("How much time can you dedicate to the server?")
                            .setCustomId("submitterAvailability")
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setLabel("What timezone are you in?")
                            .setCustomId("submitterTimezone")
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setLabel("What attributes make you a good staff?")
                            .setCustomId("submitterAttributes")
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setLabel("Why would you like to work as a moderator?")
                            .setCustomId("submitterMotivation")
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                    )
                )
        );
    }

    async sendConfirmSubmissionMessage() {
        const interaction = this.interaction

        const submitterAge = interaction.fields.getTextInputValue("submitterAge");
        const submitterAvailability = interaction.fields.getTextInputValue("submitterAvailability");
        const submitterTimezone = interaction.fields.getTextInputValue("submitterTimezone");
        const submitterAttributes = interaction.fields.getTextInputValue("submitterAttributes");
        const submitterMotivation = interaction.fields.getTextInputValue("submitterMotivation");

        const confirmSubmissionMessage = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.warn)
                    .setTitle(`${emojis.indicators.warn_yellow} Are you sure?`)
                    .setDescription(`The staff team will save and go over what you wrote. Would \
you like to submit this application anyway? If you do not press any of the buttons, \
<t:${Math.floor((new Date(Date.now() + 600000)).getTime() / 1000)}:R> your application will be canceled automatically!`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        {
                            name: `How old are you?`,
                            value: `- ${submitterAge}`
                        },
                        {
                            name: `How much time can you dedicate to the server?`,
                            value: `- ${submitterAvailability}`,
                        },
                        {
                            name: `What timezone are you in?`,
                            value: `- ${submitterTimezone}`,
                        },
                        {
                            name: `What attributes make you a good staff?`,
                            value: `- ${submitterAttributes}`,
                        },
                        {
                            name: `Why would you like to work as a moderator?`,
                            value: `- ${submitterMotivation}`,
                        }
                    )
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Yes")
                            .setEmoji(emojis.indicators.checkmark)
                            .setCustomId("confirmSubmittingStaffAppButton")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setLabel("No")
                            .setEmoji(emojis.indicators.x)
                            .setCustomId("cancelSubmittingStaffAppButton")
                            .setStyle(ButtonStyle.Danger)
                    )
            ],
            ephemeral: true,
        });

        setTimeout(async () => {
            await confirmSubmissionMessage.delete().catch((err) => { })
        }, 600000);
    }

    async confirmSubmission() {
        const interaction = this.interaction

        const activeApplication = await StaffApplication.findOne({
            where: {
                submitter: {
                    id: interaction.user.id
                }
            }
        })

        if (activeApplication) {
            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(colors.failure)
                        .setTitle(`${emojis.indicators.x} Active Application!`)
                        .setDescription(`You have active staff application which is not checked by staff yet.`)
                ],
                components: [],
                ephemeral: true,
            });
        }

        const confirmedSubmissionMessage = await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.success)
                    .setTitle(`${emojis.rewards.party} Submitted!`)
                    .setThumbnail(interaction.user.avatarURL({ size: 4096 }))
                    .setDescription(`${emojis.indicators.checkmark} The admin team has received your application. We appreciate \
your application. Furthermore, best of luck!`)
            ],
            components: []
        })

        setTimeout(async () => {
            await confirmedSubmissionMessage.delete().catch(err => { });
        }, 300000);

        const getApplicationEmbedFields = await interaction.message.embeds[0].fields
        const getAge = getApplicationEmbedFields[0].value.substring(2, getApplicationEmbedFields[0].length);
        const getAvailability = getApplicationEmbedFields[1].value.substring(2, getApplicationEmbedFields[1].length);
        const getTimezone = getApplicationEmbedFields[2].value.substring(2, getApplicationEmbedFields[2].length);
        const getAttributes = getApplicationEmbedFields[3].value.substring(2, getApplicationEmbedFields[3].length);
        const getMotivation = getApplicationEmbedFields[4].value.substring(2, getApplicationEmbedFields[4].length);

        const generatedApplicationId = generateCode(7).toString()
        const generatedCooldownId = generateCode(7).toString()

        const userFunctions = new UserFunctions(interaction.user.id)
        const applicationStorageChannel = interaction.guild.channels.cache.get(channels.applicationStorage);

        const embedApplication = await applicationStorageChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`New Staff`)
                    .setColor(decodeColor((await userFunctions.getProfile()).user.accent_color) || colors.invisible)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setDescription(`${emojis.indicators.orb} Status : \`Unchecked\`
${emojis.miscellaneous.hammer} Checked by : \`None\`
${emojis.miscellaneous.note} Submitted by : **${interaction.user}**
${emojis.cubecraft.id} StaffApplication ID : \`${generatedApplicationId}\``)
                    .addFields(
                        {
                            name: `How old are you?`,
                            value: `- ${getAge}`
                        },
                        {
                            name: `How much time can you dedicate to the server?`,
                            value: `- ${getAvailability}`,
                        },
                        {
                            name: `What timezone are you in?`,
                            value: `- ${getTimezone}`,
                        },
                        {
                            name: `What attributes make you a good staff?`,
                            value: `- ${getAttributes}`,
                        },
                        {
                            name: `Why would you like to work as a moderator?`,
                            value: `- ${getMotivation}`,
                        }
                    )
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Accept")
                            .setEmoji(emojis.indicators.checkmark)
                            .setCustomId("acceptStaffAppButton")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setLabel("Decline")
                            .setEmoji(emojis.indicators.x)
                            .setCustomId("declineStaffAppButton")
                            .setStyle(ButtonStyle.Danger)
                    )
            ]
        });

        await embedApplication.startThread({
            name: `Discussion - ${generatedApplicationId}`,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneDay
        }).then(async (discussion) => {
            await discussion.setLocked(false);
        })

        await StaffApplication.create({
            id: generatedApplicationId,
            message: embedApplication.id,
            submitter: {
                id: interaction.user.id,
                username: interaction.user.username
            },
            answers: {
                age: getAge,
                availability: getAvailability,
                timezone: getTimezone,
                attributes: getAttributes,
                motivation: getMotivation,
            }
        });

        await Cooldown.create({
            user: {
                id: interaction.user.id,
                username: interaction.user.username
            },
            id: generatedCooldownId,
            expires: new Date() + 604800000,
            action: "applyForStaffButton"
        })
    }

    async cancelSubmission() {
        const interaction = this.interaction;

        const cancelSubmissionMessage = await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.cancel)
                    .setTitle(`${emojis.indicators.trash} Cancelled Process!`)
                    .setThumbnail(interaction.user.avatarURL({ size: 4096 }))
                    .setDescription(`The application process has been cancelled. If you wish to reapply, \
    please ensure that you meet all the necessary requirements before starting a new application.`)
            ],
            components: []
        })

        setTimeout(async () => {
            await cancelSubmissionMessage.delete().catch(err => { });
        }, 300000);
    }

    async accept() {
        const interaction = this.interaction

        const applicationData = await StaffApplication.findOne({ where: { message: interaction.message.id } });
        const applicationSubmitter = await interaction.guild.members.cache.get(applicationData.submitter.id);
        const messageComponent = await interaction.message.components[0]

        await interaction.message.edit({
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setDisabled(true)
                            .setLabel(messageComponent.components[0].label)
                            .setEmoji(messageComponent.components[0].emoji)
                            .setStyle(messageComponent.components[0].style)
                            .setCustomId(messageComponent.components[0].customId),
                        new ButtonBuilder()
                            .setDisabled(true)
                            .setLabel(messageComponent.components[1].label)
                            .setEmoji(messageComponent.components[1].emoji)
                            .setStyle(messageComponent.components[1].style)
                            .setCustomId(messageComponent.components[1].customId)
                    )
            ]
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.warn)
                    .setTitle(`${emojis.indicators.warn_yellow} Are you sure?`)
                    .setThumbnail(applicationSubmitter.user.avatarURL({ size: 4096 }))
                    .setDescription(`${interaction.user} are you sure you want to **accept** ${applicationSubmitter}'s application? \
    If you will not press any of the buttons, <t:${Math.floor((new Date(Date.now() + 600000)).getTime() / 1000)}:R> \
    accepting process will automatically be cancelled!`)
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Yes")
                            .setEmoji(emojis.indicators.checkmark)
                            .setCustomId("confirmStaffAppAcceptanceButton")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setLabel("No")
                            .setEmoji(emojis.indicators.x)
                            .setCustomId("cancelStaffAppAcceptanceButton")
                            .setStyle(ButtonStyle.Danger)
                    )
            ],
        });
    }

    async confirmAcceptance() {
        const interaction = this.interaction

        const getApplicationMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        const applicationData = await StaffApplication.findOne({ where: { message: getApplicationMessage.id } });
        const applicationSubmitter = await interaction.guild.members.cache.get(applicationData.submitter.id);

        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.success)
                    .setTitle(`${emojis.indicators.checkmark} Accepted!`)
                    .setThumbnail(applicationSubmitter.user.avatarURL({ size: 4096 }))
                    .setDescription(`${interaction.user} has **accepted** ${applicationSubmitter}'s application and now they \
are part of our staff team!`)
            ],
            components: []
        });

        await applicationSubmitter.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${emojis.rewards.party} You were accepted!`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setColor(colors.default)
                    .setDescription(`You have been accepted into the staff team of **${interaction.guild.name}**!
            
You can see which channels are unlocked by scrolling all the way to the bottom of the channels. \
Please head over to <#${channels.staffGuide}> and read the rules and guidelines.`)
            ]
        }).catch((err) => { });

        const messageEmbeds = getApplicationMessage.embeds[0];

        await getApplicationMessage.edit({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Checked StaffApplication`)
                    .setDescription(`${messageEmbeds.description}`
                        .replace(`\`None\``, `**${interaction.user}**`)
                        .replace(`\`Unchecked\``, `**Accepted**`))
                    .setColor(messageEmbeds.color)
                    .setThumbnail(messageEmbeds.thumbnail.url)
                    .addFields(messageEmbeds.fields)
            ]
        });

        await Cooldown.destroy({
            where: {
                user: {
                    id: applicationSubmitter.id
                },
                action: "applyForStaffButton"
            }
        });

        await StaffApplication.destroy({
            where: {
                submitter: {
                    id: applicationSubmitter.id
                }
            }
        })

        await applicationSubmitter.roles.add(interaction.guild.roles.cache.get(roles.staff));
        await applicationSubmitter.roles.add(interaction.guild.roles.cache.get(roles.helper));
        await applicationSubmitter.roles.add(interaction.guild.roles.cache.get(roles.ticket));
        await applicationSubmitter.roles.add(interaction.guild.roles.cache.get(roles["semi-staff"]));

        const applicationDiscussion = await interaction.channel.threads.cache
            .find(thread => thread.name === `Discussion - ${applicationData.id}`)
        await applicationDiscussion.setLocked(true)
        await applicationDiscussion.setArchived(true)
    }

    async cancelAcceptance() {
        const interaction = this.interaction

        const getApplicationMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        const getApplicationData = await StaffApplication.findOne({ where: { message: getApplicationMessage.id } });
        const applicationSubmitter = interaction.guild.members.cache.get(getApplicationData.submitter.id);
        const buttonComponents = getApplicationMessage.components[0]

        await getApplicationMessage.edit({
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setDisabled(false)
                            .setLabel(buttonComponents.components[0].label)
                            .setEmoji(buttonComponents.components[0].emoji)
                            .setStyle(buttonComponents.components[0].style)
                            .setCustomId(buttonComponents.components[0].customId),
                        new ButtonBuilder()
                            .setDisabled(false)
                            .setLabel(buttonComponents.components[1].label)
                            .setEmoji(buttonComponents.components[1].emoji)
                            .setStyle(buttonComponents.components[1].style)
                            .setCustomId(buttonComponents.components[1].customId)
                    )
            ]
        });

        const cancelAcceptanceMessage = await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.cancel)
                    .setTitle(`${emojis.indicators.cancel} Canceled Acceptance`)
                    .setThumbnail(applicationSubmitter.user.avatarURL({ size: 4096 }))
                    .setDescription(`${interaction.user} has **canceled the acceptance** of ${applicationSubmitter}'s application.`)
            ],
            components: []
        })

        setTimeout(async () => {
            await cancelAcceptanceMessage.delete().catch((err) => { })
        }, 300000);
    }

    async decline() {
        const interaction = this.interaction;

        const applicationData = await StaffApplication.findOne({ where: { message: interaction.message.id } });
        const applicationSubmitter = await interaction.guild.members.cache.get(applicationData.submitter.id);
        const messageComponent = await interaction.message.components[0]

        await interaction.message.edit({
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setDisabled(true)
                            .setLabel(messageComponent.components[0].label)
                            .setEmoji(messageComponent.components[0].emoji)
                            .setStyle(messageComponent.components[0].style)
                            .setCustomId(messageComponent.components[0].customId),
                        new ButtonBuilder()
                            .setDisabled(true)
                            .setLabel(messageComponent.components[1].label)
                            .setEmoji(messageComponent.components[1].emoji)
                            .setStyle(messageComponent.components[1].style)
                            .setCustomId(messageComponent.components[1].customId),
                    )
            ]
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.warn)
                    .setTitle(`${emojis.indicators.warn_yellow} Are you sure?`)
                    .setThumbnail(applicationSubmitter.user.avatarURL({ size: 4096 }))
                    .setDescription(`${interaction.user} are you sure you want to **decline** ${applicationSubmitter}'s \
application? If you will not press any of the buttons, <t:${Math.floor((new Date(Date.now() + 600000)).getTime() / 1000)}:R> \
declining process will automatically be cancelled!`)
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Yes")
                            .setEmoji(emojis.indicators.checkmark)
                            .setStyle(ButtonStyle.Success)
                            .setCustomId("confirmDeclineStaffAppButton"),
                        new ButtonBuilder()
                            .setLabel("No")
                            .setEmoji(emojis.indicators.x)
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("cancelDeclineStaffAppButton")
                    )
            ],
        });
    }

    async confirmDecline() {
        const interaction = this.interaction

        const getApplicationMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        const applicationData = await StaffApplication.findOne({ where: { message: getApplicationMessage.id } });
        const applicationSubmitter = await interaction.guild.members.cache.get(applicationData.submitter.id);
        const messageEmbeds = getApplicationMessage.embeds[0];

        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.failure)
                    .setTitle(`${emojis.indicators.x} Declined!`)
                    .setThumbnail(applicationSubmitter.user.avatarURL({ size: 4096 }))
                    .setDescription(`${interaction.user} has **declined** ${applicationSubmitter}'s application.`)
            ],
            components: []
        });

        await getApplicationMessage.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(messageEmbeds.color)
                    .setTitle(`Checked StaffApplication`)
                    .setThumbnail(messageEmbeds.thumbnail.url)
                    .setDescription(`${messageEmbeds.description}`
                        .replace(`\`None\``, `**${interaction.user}**`)
                        .replace(`\`Unchecked\``, `**Declined**`))
                    .addFields(messageEmbeds.fields)
            ]
        });

        await Cooldown.destroy({
            where: {
                user: {
                    id: applicationSubmitter.id
                },
                action: "applyForStaffButton"
            }
        });

        await StaffApplication.destroy({
            where: {
                submitter: {
                    id: applicationSubmitter.id
                }
            }
        });

        const applicationDiscussion = await interaction.channel.threads.cache
            .find(thread => thread.name === `Discussion - ${applicationData.id}`)
        await applicationDiscussion.setLocked(true)
        await applicationDiscussion.setArchived(true)
    }

    async cancelDecline() {
        const interaction = this.interaction

        const getApplicationMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        const getApplicationData = await StaffApplication.findOne({ where: { message: getApplicationMessage.id } });
        const applicationSubmitter = interaction.guild.members.cache.get(getApplicationData.submitter.id);
        const buttonComponents = getApplicationMessage.components[0]

        await getApplicationMessage.edit({
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setDisabled(false)
                            .setLabel(buttonComponents.components[0].label)
                            .setEmoji(buttonComponents.components[0].emoji)
                            .setStyle(buttonComponents.components[0].style)
                            .setCustomId(buttonComponents.components[0].customId),
                        new ButtonBuilder()
                            .setDisabled(false)
                            .setLabel(buttonComponents.components[1].label)
                            .setEmoji(buttonComponents.components[1].emoji)
                            .setStyle(buttonComponents.components[1].style)
                            .setCustomId(buttonComponents.components[1].customId)
                    )
            ]
        });

        const canceledDeclineMessage = await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor(colors.cancel)
                    .setTitle(`${emojis.indicators.cancel} Canceled Decline`)
                    .setDescription(`${interaction.user} has **canceled the decline** of ${applicationSubmitter}'s \ application.`)
                    .setThumbnail(applicationSubmitter.user.avatarURL({ size: 4096 }))
            ],
            components: []
        })

        setTimeout(async () => {
            await canceledDeclineMessage.delete().catch((err) => { });
        }, 300000);
    }
}

module.exports = staffApplication;
