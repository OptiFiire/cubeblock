const {
  EmbedBuilder,
  PermissionsBitField,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
} = require("discord.js");
const emojis = require("../json/emojis.json");
const roles = require("../json/roles.json");
const colors = require("../json/colors.json");
const channels = require("../json/channels.json");
const ticketModel = require("../models/ticketModel");
const { createTranscript } = require("discord-html-transcripts");

class Ticket {

  async openModal(interaction) {
    await interaction.showModal(
      new ModalBuilder()
        .setTitle("CubeBlock Support")
        .setCustomId("ticketModal")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("ticketReasonInput")
              .setRequired(true)
              .setPlaceholder("Explain your issue...")
              .setLabel("How can we assist you?")
              .setStyle(TextInputStyle.Paragraph)
          )
        )
    );
  }

  async open(interaction, guild, user, reason) {

    await interaction.guild.channels.create({
      name: `💌・${user.username}`,
      parent: "1099732798736175265",
      topic: `This is the ticket channel opened by ${user} for support.`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        {
          id: guild.roles.cache.get(roles.ticket).id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.EmbedLinks,
          ],
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.EmbedLinks,
          ],
        },
      ],
    })
      .then(async (channel) => {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(colors.success)
              .setTitle(`${emojis.indicators.checkmark} Ticket Created!`)
              .setDescription(`Successfully created ticket, check it out : ${channel}.`)
          ],
          ephemeral: true,
        });

        const ticketPanelMessage = await channel.send({
          content: `Hey! ${user}, You have successfully opened ticket! Please wait for <@&${roles.ticket}>,\
they will try to assist you as fast as they can.`,
          embeds: [
            new EmbedBuilder()
              .setColor(colors.default)
              .setTitle(`${emojis.miscellaneous.mail_open} New Ticket!`)
              .setThumbnail('https://i.ibb.co/yVp6K2G/cubeblock-logo-default-no-background.png')
              .setDescription(
                `The ticket has been opened with reason :
\`\`\`${reason}\`\`\`

Support will be with you shortly. Again please be patient!`
              )
              .setFields(
                {
                  name: `${emojis.indicators.arrowR} Rules :`,
                  value:
                    `- **1.** Do not ping staff in tickets.
- **2.** Do not reopen tickets for the same reason.`,
                },
                {
                  name: `${emojis.indicators.arrowR} FAQs :`,
                  value:
                    `- **1.** [What are the youtuber role requirements?](https://discord.com/channels/1053689289592025098/1279436081162358877)
- **2.** [What are the partnership rules and requirements?](https://discord.com/channels/1053689289592025098/1279436214893809684)
- **3.** [What is this servers ad?](https://discord.com/channels/1053689289592025098/1279436351824990219)
- **4.** [What exclusive perks will i get as a result of boosting](https://discord.com/channels/1053689289592025098/1279435558313267240)
`,
                }
              )
          ],
          components: [
            new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId("closeTicketButton")
                  .setLabel("Close")
                  .setStyle(ButtonStyle.Danger)
                  .setEmoji(emojis.indicators.lock_closed)
              )
          ],
        });

        await ticketModel.create({
          owner: {
            id: user.id,
            username: user.username
          },
          openedTime: new Date(),
          channel: channel.id,
          reason: reason,
          panel: ticketPanelMessage.id,
        });
      });
  }

  async requestClosure(interaction, channel, closer) {

    const ticketPanel = await ticketModel.findOne({ where: { channel: channel.id } });
    const ticketPanelMessage = await channel.messages.fetch(ticketPanel.panel)
    const messageComponents = await ticketPanelMessage.components[0].components[0]

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.warn)
          .setTitle(`${emojis.indicators.warn_yellow} Are You Sure?`)
          .setDescription(`${closer} Are you sure you want to close the ticket?`)
      ],
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("confirmTicketClosureButton")
              .setLabel("Yes")
              .setStyle(ButtonStyle.Success)
              .setEmoji(emojis.indicators.checkmark),
            new ButtonBuilder()
              .setCustomId("cancelTicketClosureButton")
              .setLabel("No")
              .setStyle(ButtonStyle.Danger)
              .setEmoji(emojis.indicators.x)
          )
      ],
    });

    await ticketPanelMessage.edit({
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setDisabled(true)
              .setCustomId(messageComponents.customId)
              .setLabel(messageComponents.label)
              .setStyle(messageComponents.style)
              .setEmoji(messageComponents.emoji)
          )
      ]
    });

    return;
  }

  async confirmClosure(message, confirmer, channel, guild) {

    await channel.permissionOverwrites.set(
      [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        }
      ]
    );

    await message.edit({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.wait)
          .setTitle(`${emojis.miscellaneous.clock} Confirmed Closure...`)
          .setDescription(`${confirmer} has **confirmed** ticket closure. Closing ticket <t:${Math.floor(Date.now() / 1000) + 10}:R>...`)
      ],
      components: [],
    });

    const transcript = await createTranscript(channel, {
      limit: -1,
      returnBuffer: false,
      saveImages: true,
      filename: `${channel.name}.html`,
      poweredBy: false
    });

    const ticketData = await ticketModel.findOne({ where: { channel: channel.id } })
    const ticketOwner = await guild.members.cache.get(ticketData.owner.id);

    setTimeout(async () => {

      if (guild.channels.cache.get(channel.id)) {
        channel.delete()
      }

      const transcriptMessage = await guild.channels.cache
        .get(channels.ticketStorage)
        .send({ files: [transcript] });

      const messageObject = {
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel("Open")
                .setURL(`https://mahto.id/chat-exporter?url=${transcriptMessage.attachments.first()?.url}`)
                .setStyle(ButtonStyle.Link)
                .setEmoji(emojis.miscellaneous.mail_open)
            )],
        embeds: [
          new EmbedBuilder()
            .setColor(colors.default)
            .setTitle(`${ticketOwner.user.username}'s Ticket`)
            .setThumbnail(ticketOwner.user.avatarURL({ size: 4096 }))
            .addFields(
              { name: `${emojis.miscellaneous.crown} Owner :`, value: `- ${ticketOwner}` },
              { name: `${emojis.miscellaneous.note} Reason :`, value: `- ${ticketData.reason}` },
              { name: `${emojis.miscellaneous.mail_closed} Closed by :`, value: `- ${confirmer}` },
              { name: `${emojis.indicators.lock_open} Opened at :`, value: `- <t:${Math.floor(ticketData.openedTime.getTime() / 1000)}:F>` },
              { name: `${emojis.indicators.lock_closed} Closed at :`, value: `- <t:${Math.floor(new Date() / 1000)}:F>` }
            )
        ],
      };

      ticketOwner
        .send({ files: [transcript] })
        .then(() => ticketOwner.send(messageObject))

      guild.channels.cache
        .get(channels.ticketStorage)
        .send(messageObject)

    }, 10_000);

    await ticketModel.destroy({ where: { channel: channel.id } })
  }

  async cancelClosure(message, canceler, channel) {

    const ticketChannel = await ticketModel.findOne({ where: { channel: channel.id } });
    const panelMessage = await channel.messages.fetch(ticketChannel.panel);

    await panelMessage.edit({
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setDisabled(false)
              .setLabel(panelMessage.components[0].components[0].label)
              .setStyle(panelMessage.components[0].components[0].style)
              .setEmoji(panelMessage.components[0].components[0].emoji)
              .setCustomId(panelMessage.components[0].components[0].customId)
          )],
    });

    await message.edit({
      embeds: [
        new EmbedBuilder()
          .setColor(colors.failure)
          .setTitle(`${emojis.indicators.x} Canceled Closure!`)
          .setDescription(`${canceler} has **canceled** ticket closure.`)
      ],
      components: []
    });
  }
};

module.exports = new Ticket()