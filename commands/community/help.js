const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const emojis = require('../../json/emojis.json')
const colors = require('../../json/colors.json')
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all the commands and their descriptions.'),

    async execute(interaction) {
        const communityCommandsPath = path.join(__dirname);
        const funCommandsPath = path.join(__dirname, '../fun');
        const communityCommandFiles = fs.readdirSync(communityCommandsPath).filter(file => file.endsWith('.js'));
        const funCommandFiles = fs.readdirSync(funCommandsPath).filter(file => file.endsWith('.js'));

        let commands = []
        let commandsCount = 0;

        communityCommandFiles.forEach(file => {
            const command = require(path.join(communityCommandsPath, file));
            const subcommands = command.data.options
                .filter(option => option instanceof SlashCommandSubcommandBuilder)
                .map(option => ({ name: option.name, description: option.description }))
            commands.push({
                name: command.data.name,
                description: command.data.description,
                subcommands: subcommands,
            });

            commandsCount += (subcommands.length !== 0 ? subcommands.length : 1);
        });

        funCommandFiles.forEach(file => {
            const command = require(path.join(funCommandsPath, file));
            const subcommands = command.data.options
                .filter(option => option instanceof SlashCommandSubcommandBuilder)
                .map(option => ({ name: option.name, description: option.description }))
            commands.push({
                name: command.data.name,
                description: command.data.description,
                subcommands: subcommands,
            });

            commandsCount += (subcommands.length !== 0 ? subcommands.length : 1);
        });

        const commandsPerPage = 15;
        const totalPages = Math.ceil(commandsCount / commandsPerPage);

        let currentPage = 0;

        const generateEmbed = (page) => {
            const start = page * commandsPerPage;
            const end = start + commandsPerPage;

            const embed = new EmbedBuilder()
                .setTitle(`${emojis.cubecraft.heart} Help is here!`)
                .setThumbnail(interaction.guild.iconURL({ size: 4096 }))
                .setColor(colors.default);

            let description = '';
            console.log(page, start, end)
            console.log(commands)
            commands.slice(start, end).forEach(command => {
                if (command.subcommands.length > 0) {
                    description += command.subcommands.map(subcommand =>
                        `\`/${command.name} ${subcommand.name}\` - ${subcommand.description}\n`
                    ).join('');
                } else {
                    description += `\`/${command.name}\` - ${command.description}\n`
                }
            });

            embed.setDescription(description.trim());

            return embed;
        };

        const embedMessage = await interaction.reply({
            embeds: [generateEmbed(currentPage)],
            components: [getRow(currentPage, totalPages)],
            fetchReply: true
        });

        const collector = embedMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60_000
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(colors.failure)
                            .setTitle(`${emojis.indicators.x} Not For You!`)
                            .setDescription(`This interaction is not for you.`)
                    ],
                    ephemeral: true
                });
            }

            if (i.customId === 'previous') {
                currentPage--;
            } else if (i.customId === 'next') {
                currentPage++;
            }

            await i.update({
                embeds: [generateEmbed(currentPage)],
                components: [getRow(currentPage, totalPages)]
            });
        });

        collector.on('end', () => {
            embedMessage.edit({
                components: [
                    getRow(currentPage, totalPages).components[0].setDisabled(true),
                    getRow(currentPage, totalPages).components[1].setDisabled(true)
                ]
            });
        });

        function getRow(page, total) {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setDisabled(page === 0)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(emojis.indicators.arrowL),
                    new ButtonBuilder()
                        .setCustomId('page')
                        .setLabel(`${page + 1}/${total}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === total - 1)
                        .setEmoji(emojis.indicators.arrowR)
                );
        }
    },
};
