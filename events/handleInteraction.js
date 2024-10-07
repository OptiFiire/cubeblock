const { Events, EmbedBuilder, DiscordAPIError } = require('discord.js');
const emojis = require("../json/emojis.json")
const colors = require("../json/colors.json")
const print = require("../utils/print")

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (err) {
				if (err.code !== 10062) return
				
				print.error(err)
			}
		}

		if (interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setColor(colors.failure)
							.setTitle(`${emojis.indicators.x} Not found!`)
							.setDescription(`Command you triggered was not found!`)
					],
					ephemeral: true
				});
			}

			try {
				await command.execute(interaction);
			} catch (err) {
				if (err.code === 10062) {
					const somethingWrongEmbed = new EmbedBuilder()
						.setColor(colors.failure)
						.setTitle(`${emojis.indicators.x} Error!`)
						.setDescription(`Something went wrong. Please try again.`)

					if (interaction.replied || interaction.deferred) {
						await interaction.followUp({ embeds: [somethingWrongEmbed], ephemeral: true });
					} else {
						await interaction.reply({ embeds: [somethingWrongEmbed], ephemeral: true });
					}
				} else {
					print.error(err)

					const unexpectedErrorEmbed = new EmbedBuilder()
						.setTitle(`${emojis.indicators.x} Error!`)
						.setDescription(`An unexpected error occurred. Please try again later.`)
						.setColor(colors.failure);

					if (interaction.replied || interaction.deferred) {
						await interaction.followUp({ embeds: [unexpectedErrorEmbed], ephemeral: true });
					} else {
						await interaction.reply({ embeds: [unexpectedErrorEmbed], ephemeral: true });
					}
				}
			}
		}
	}
}