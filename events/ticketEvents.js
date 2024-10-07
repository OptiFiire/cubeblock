const { EmbedBuilder, Events } = require("discord.js");
const emojis = require("../json/emojis.json");
const roles = require('../json/roles.json')
const colors = require("../json/colors.json");
const ticketModel = require("../models/ticketModel");
const ticketModule = require("../utils/ticketModule");

const interactiveButtons = ["closeTicketButton", "confirmTicketClosureButton", "cancelTicketClosureButton"]

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {

        if (interaction.isModalSubmit()) {
            if (interaction.customId === "ticketModal") {
                return ticketModule.open(interaction, interaction.guild, interaction.user, interaction.fields.getTextInputValue("ticketReasonInput"));
            }
        }

        if (interaction.isButton()) {

            if (interactiveButtons.includes(interaction.customId)) {
                if (!interaction.member.roles.cache.has(roles.ticket)) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.warn)
                                .setTitle(`${emojis.indicators.warn_yellow} Only Staff!`)
                                .setDescription(`Only <@&${roles.ticket}> can control the ticket, not you!`)
                        ],
                        ephemeral: true
                    });
                };
            }

            if (interaction.customId === "openTicketButton") {

                const ticketObject = await ticketModel.findOne({
                    where: {
                        owner: { id: interaction.user.id }
                    }
                }).catch(err => { })

                if (ticketObject) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(colors.warn)
                                .setTitle(`${emojis.indicators.warn_yellow} Ticket Found!`)
                                .setDescription(`Hold up! You already have an open ticket in <#${ticketObject.channel}>`)
                        ],
                        ephemeral: true,
                    });
                }

                return ticketModule.openModal(interaction);
            };
            if (interaction.customId === "closeTicketButton") {
                return ticketModule.requestClosure(
                    interaction,
                    interaction.channel,
                    interaction.user
                );
            }
            if (interaction.customId === "confirmTicketClosureButton") {
                return ticketModule.confirmClosure(
                    interaction.message,
                    interaction.user,
                    interaction.channel,
                    interaction.guild
                );
            }
            if (interaction.customId === "cancelTicketClosureButton") {
                return ticketModule.cancelClosure(
                    interaction.message,
                    interaction.user,
                    interaction.channel
                );
            }
        }
    }
};