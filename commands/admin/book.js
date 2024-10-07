const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const colors = require('../../json/colors.json')
const emojis = require('../../json/emojis.json')
const roles = require('../../json/roles.json')
const therapyModel = require('../../models/therapyModel')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("book")
    .setDescription("Make someone book lv's therapy.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option => option
      .setName("user")
      .setDescription("Choose a user to make them book.")
      .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const userRoles = interaction.guild.members.cache.get(user.id).roles.cache
    const lvRole = interaction.guild.roles.cache.find(role => role.id === "1215609070250106941")
    const lvUser = await interaction.guild.members.cache.get("811143342309507092")

    if (user.id === interaction.user.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.failure)
            .setTitle(`${emojis.indicators.x} Cannot Book Yourself.`)
            .setDescription("You cannot book your own therapy session.")
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

    const userTherapySession = await therapyModel.findOne({
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

    const availableTimes = [
      new Date(new Date().setHours(10, 0, 0, 0)), // 10:00 AM
      new Date(new Date().setHours(11, 0, 0, 0)), // 11:00 AM
      new Date(new Date().setHours(14, 0, 0, 0)), // 2:00 PM
      new Date(new Date().setHours(16, 0, 0, 0)), // 4:00 PM
      new Date(new Date().setHours(17, 0, 0, 0))  // 5:00 PM
    ];


    let nextAvailableTime = null;
    for (const time of availableTimes) {
      const existingBooking = await therapyModel.findOne({ where: { startTime: new Date(time), type: 'basic' } });

      if (!existingBooking) {
        nextAvailableTime = new Date(time);
        break;
      }
    }

    if (nextAvailableTime) {

      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await therapyModel.create({
        startTime: nextAvailableTime,
        endTime: endTime,
        type: 'basic',
        user: {
          username: user.username,
          id: user.id
        }
      });

      let amountDue = "100$";

      if (userRoles.has(roles.vip) || userRoles.has(roles.staff)) {
        amountDue = "70$"
      }
      if (userRoles.has(roles.booster)) {
        amountDue = "Free!"
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(lvRole.color)
            .setTitle(`${emojis.rewards.party} Booked Therapy!`)
            .setThumbnail(user.avatarURL({ size: 4096 }))
            .setDescription(`${lvUser}, you have successfully booked a therapy session tomorrow for ${user}.`)
            .addFields({
              name: ` ${emojis.rewards.dollar} Amount due : ${amountDue}`,
              value: ` `
            })
        ],
      });
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.failure)
            .setTitle(`${emojis.indicators.barrier} Fully booked sessions today.`)
            .setDescription("Reached the maximum number of therapy sessions that can be booked today.")
        ]
      });
    }
  },
};
