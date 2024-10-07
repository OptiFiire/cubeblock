const { SlashCommandBuilder, EmbedBuilder, ComponentType, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const CubeCraft = require("cc-data-api-wrapper").default;
const emojis = require("../../json/emojis.json");
const colors = require("../../json/colors.json")
const cubecraft = new CubeCraft(10 * 1000);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cubecraft")
    .setDescription("Gets the CubeCraft data.")
    .addSubcommand(command => command
      .setName("leaderboards")
      .setDescription("Get the CubeCraft leaderboards for a given category.")
      .addStringOption(option => option
        .setName("game")
        .setDescription("Enter the name of CubeCraft game to get leaderboards from.")
        .setAutocomplete(true)
        .setRequired(true)
      )
    )
    .addSubcommand(command => command
      .setName("profile")
      .setDescription("Get the statistics for a given CubeCraft player.")
      .addStringOption(option => option
        .setName("player")
        .setDescription("Enter the name of CubeCraft player to get statistics for.")
        .setAutocomplete(true)
        .setRequired(true)
      )
    )
    .addSubcommand(command => command
      .setName("marketplace")
      .setDescription("Get the CubeCraft marketplace item.")
      .addStringOption(option => option
        .setName("item")
        .setDescription("Enter the name of CubeCraft marketplace item to get information from.")
        .setAutocomplete(true)
        .setRequired(true)
      )
    )
    .addSubcommand(command => command
      .setName("level")
      .setDescription("Calculate how much XP you need to reach a particular level for CubeCraft.")
      .addIntegerOption(option => option
        .setName("level")
        .setDescription("Your current CubeCraft level.")
        .setRequired(true)
      )
      .addIntegerOption(option => option
        .setName("goal")
        .setDescription("The level you want to achieve.")
        .setRequired(true)
      )
      .addIntegerOption(option => option
        .setName("xp")
        .setDescription("Your current XP progression.")
      )
    )
    .addSubcommand(command => command
      .setName("status")
      .setDescription("Get current status of CubeCraft's games.")
    ),

  async autocomplete(interaction) {
    const value = interaction.options.getFocused(true);
    const cmd = interaction.options.getSubcommand();
    let choice;

    if (cmd === "leaderboards") {
      if (value.name === "game") {
        choice = (await cubecraft.leaderboards.getNames()).filter(name => !name.toLowerCase().includes("legacy-games-giga"));
      }
    }

    if (cmd === "profile") {
      if (value.name === "player") {
        choice = await cubecraft.players.getNames();
      }
    }

    if (cmd === "marketplace") {
      if (value.name === "item") {
        choice = await cubecraft.marketplace.getNames();
      }
    }

    const filtered = choice
      .filter((choice) => choice.toLowerCase().includes(value.value.toLowerCase()))
      .slice(0, 25);

    await interaction.respond(
      filtered.map((game) => ({
        name: game
          .split("-")
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join(" "),
        value: game,
      }))
    );
  },

  async execute(interaction) {

    switch (interaction.options.getSubcommand()) {

      case "leaderboards":

        const leaderboardGameInput = interaction.options.getString("game");

        const gameNotFoundEmbed = new EmbedBuilder()
          .setColor(colors.failure)
          .setTitle(`${emojis.indicators.x} Not Found!`)
          .setDescription(`The game you've entered doesn't exist or you've entered the game name wrong. Please use the text given in command option.`)

        if (leaderboardGameInput === "legacy-games-giga") {
          return interaction.reply({
            embeds: [gameNotFoundEmbed],
            ephemeral: true
          });
        };

        try {
          const leaderboardGame = await cubecraft.leaderboards.getByName(leaderboardGameInput)

          const emojiMap = {
            "parkour$parkour": emojis.games.parkour,
            "blockwars$bridge": emojis.games.bridges,
            "blockwars$ctf": emojis.games.blockwars,
            "blockwars$tdm": emojis.games.tdm,
            "blockwars$dtc": emojis.games.dtc,
            "blockwars$bridges": emojis.games.bridges,
            "lucky_islands$lucky_islands": emojis.games.lucky_islands,
            "skywars$skywars": emojis.games.skywars,
            "eggwars$eggwars": emojis.games.eggwars,
            "pillars_of_fortune$pillars_of_fortune": emojis.games.pillars_of_fortune,
            "snowman_survival$present_rush": emojis.games.present_rush,
            "snowman_survival$snowman_survival": emojis.games.snowman_survival,
            "bedwars$bedwars": emojis.games.bedwars,
            "carving_chaos$carving_chaos": emojis.games.carving_chaos,
            "minerware$minerware": emojis.games.minerware,
            "widget$free_for_all": emojis.games.battle_arena,
            "survival_games$survival_games": emojis.games.survival_games,
            "widget$duels": emojis.games.duels,
          };

          const getKey = (input) => {
            return Object.keys(emojiMap).find(key => {
              const formattedKey = (key.split("$")[1]).split("-").join("_")
              return input.includes(formattedKey);
            });
          };

          const leaderboardGameKey = getKey(leaderboardGameInput.split("-").join("_"));
          const leaderboardGameEmoji = leaderboardGameKey ? emojiMap[leaderboardGameKey] : null;
          const leaderboardGameIcon = `https://cubecraftcdn.com/bedrock/game_icons/${leaderboardGameKey ? leaderboardGameKey.split("$")[0] : null}.png`

          const createEmbed = (players, page) => {
            
            const fields = players.map((player, i) => {
              const place = page * 25 + i + 1;
              const placeEmojis = {
                1: emojis.rewards.first,
                2: emojis.rewards.second,
                3: emojis.rewards.third,
              };
              const placeNumb = placeEmojis[place] || `${place}.`;
              return {
                name: `${placeNumb} ${player.name}`,
                value: `- ${emojis.rewards.trophy} ${player.points}`,
                inline: true,
              };
            });

            return new EmbedBuilder()
              .setColor(colors.default)
              .setTitle(`${leaderboardGameEmoji} ${leaderboardGame.name.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ")}`)
              .setThumbnail(
                leaderboardGameIcon.includes("widget")
                  ? `https://forums.cubecraftcdn.com/xenforo/serve/styles/cubecraft/cubecraft/sidebar-icons/post-thread-widget-guy.png`
                  : leaderboardGameIcon
              )
              .addFields(fields)
              .setTimestamp(new Date(leaderboardGame.lastUpdated))
              .setFooter({
                text: `Last Updated`,
                iconURL: interaction.guild.iconURL({ size: 1024 }),
              });
          };

          const embeds = [
            createEmbed(leaderboardGame.players.slice(0, 25), 0),
            createEmbed(leaderboardGame.players.slice(25, 50), 1),
          ];

          const arrows = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId("arrowLeft")
                .setEmoji(emojis.indicators.arrowL)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId("arrowRight")
                .setEmoji(emojis.indicators.arrowR)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(embeds.length <= 1 && leaderboardGame.players.length > 25)
            );

          const page = await interaction.reply({
            embeds: [embeds[0]],
            components: [arrows],
          });

          const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60_000,
          });

          collector.on("collect", async (i) => {
            if (interaction.user.id !== i.user.id) {
              await i.reply({
                embeds: [
                  new EmbedBuilder()
                    .setColor(colors.failure)
                    .setTitle(`${emojis.indicators.x} Not For You!`)
                    .setDescription(`These buttons can be interacted only by the user who triggered the command.`)
                ],
                ephemeral: true
              });
              return;
            }

            const currentPage = 0;
            let newPage = currentPage;

            if (i.customId === "arrowRight" && currentPage < embeds.length - 1) {
              newPage++;
            } else if (i.customId === "arrowLeft" && currentPage > 0) {
              newPage--;
            }

            await i.update({
              embeds: [embeds[newPage]],
              components: [
                arrows.setComponents(
                  arrows.components[0].setDisabled(newPage === 0),
                  arrows.components[1].setDisabled(newPage === embeds.length - 1)
                )
              ]
            });

            collector.resetTimer();
          });

          collector.on("end", async () => {
            await page.edit({
              components: [
                arrows.setComponents(
                  arrows.components[0].setDisabled(true),
                  arrows.components[1].setDisabled(true)
                )
              ]
            });
          });
        } catch (err) {
          if (err.response.status === 400) {
            return interaction.reply({
              embeds: [gameNotFoundEmbed],
              ephemeral: true
            });
          };
        }

        break;

      case "profile":
        const profilePlayerInput = interaction.options.getString("player");

        try {
          const profilePlayer = await cubecraft.players.getByName(profilePlayerInput);

          const profilePlayerLeaderboards = profilePlayer.leaderboards;

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(colors.default)
                .setTitle(`${emojis.cubecraft.id} ${profilePlayer.name}`)
                .setThumbnail(profilePlayer.icon)
                .addFields(profilePlayerLeaderboards
                  .map((player) => {
                    const position = player.position;

                    const placeEmojis = {
                      1: emojis.rewards.first,
                      2: emojis.rewards.second,
                      3: emojis.rewards.third,
                    };

                    const placeNumb = placeEmojis[position] || `${player.position}.`;

                    return {
                      name: `${placeNumb} ${player.name
                        .split("-")
                        .map((word) => word[0].toUpperCase() + word.slice(1))
                        .join(" ")
                        }`,
                      value: `- ${emojis.rewards.trophy} ${player.points}`,
                      inline: true,
                    };
                  })
                  .slice(0, 25)
                )
            ]
          });
        } catch (err) {
          if (err.response.status === 400) {
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(colors.failure)
                  .setTitle(`${emojis.indicators.x} Not Found!`)
                  .setDescription(`Player name you've entered is not in any leaderboards or the player doesn't exist.`)
              ],
              ephemeral: true
            });
          }
        }

        break;

      case "marketplace":
        const marketplaceItemInput = interaction.options.getString("item");

        try {
          const marketplaceItem = await cubecraft.marketplace.getBySearchName(marketplaceItemInput)

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(colors.default)
                .setTitle(marketplaceItem.name)
                .setURL(`https://mcmarket.place/id/${marketplaceItem.id}`)
                .setDescription(`${emojis.cubecraft.loot} ${marketplaceItem.description.replace(/[•+]/g, '- ')}`)
                .addFields(
                  { name: `${emojis.cubecraft.voting} ${marketplaceItem.rating}`, value: ` `, inline: true },
                  { name: `${emojis.cubecraft.treasure} ${marketplaceItem.price}`, value: ` `, inline: true },
                  {
                    name: marketplaceItem.available
                      ? `${emojis.indicators.lock_open} Available`
                      : `${emojis.indicators.lock_closed} Unavailable`,
                    value: ` `, inline: true
                  }
                )
                .setImage(marketplaceItem.thumbnail)
            ]
          });

        } catch (err) {
          if (err.message.status === 400) {
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(colors.failure)
                  .setTitle(`${emojis.indicators.x} Not Found!`)
                  .setDescription(`Marketplace item name you've entered doesn't exist. Please use the text given in command option.`)
              ],
              ephemeral: true
            });
          }
        }

        break;

      case "level":
        const goal = interaction.options.getInteger("goal");
        const level = interaction.options.getInteger("level") || 1;
        const xp = interaction.options.getInteger("xp") || 0;

        function calculateValue(n, u) {
          return 100 * (Math.pow(n, 2) + 9 * n) + u;
        }

        function calculateGames(xp_per_game, available_xp) {
          return Math.ceil(available_xp / xp_per_game);
        }

        if (goal < level) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(colors.failure)
                .setTitle(`${emojis.indicators.x} Invalid Number!`)
                .setDescription(`Your desired level should be higher than your current one.`)
            ],
            ephemeral: true
          });
        }

        let desired_xp = calculateValue(goal, 0);
        let available_xp = calculateValue(level, xp);

        let required_xp = desired_xp - available_xp;

        let games_map = [
          { name: `${emojis.games.eggwars} Eggwars Solo/Duo/Squad/Mega`, value: 250, type: "wins" },
          { name: `${emojis.games.eggwars} EggWars Duels`, value: 45, type: "wins" },
          { name: `${emojis.games.skywars} Skywars Mega`, value: 250, type: "wins" },
          { name: `${emojis.games.skywars} Skywars Solo/Duo/Squad`, value: 125, type: "wins" },
          { name: `${emojis.games.skywars} Skywars Duels`, value: 20, type: "wins" },
          { name: `${emojis.games.blockwars} BlockWars CTF`, value: 30, type: "wins [+50 xp per score]" },
          { name: `${emojis.games.blockwars} BlockWars CTF Duels`, value: 50, type: "wins" },
          { name: `${emojis.games.blockwars} BlockWars Giga`, value: 50, type: "wins" },
          { name: `${emojis.games.bridges} BlockWars Bridges/Duels`, value: 30, type: "wins [+5 xp per score]" },
          { name: `${emojis.games.lucky_islands} Lucky Blocks Solo/Squad`, value: 120, type: "wins" },
          { name: `${emojis.games.lucky_islands} Lucky Blocks Duels`, value: 25, type: "wins" },
          { name: `${emojis.games.survival_games} Survival Games Solo/Duo`, value: 100, type: "wins" },
          { name: `${emojis.games.minerware} Minerware`, value: 125, type: "wins" },
          { name: `${emojis.games.duels} Battle Arena Duels`, value: 10, type: "wins" },
          { name: `${emojis.cubecraft.gg} Type "GG"`, value: 1, type: "of GGs" },
        ];

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(colors.default)
              .setTitle(`${level} ${emojis.indicators.arrowR} ${goal}`)
              .setURL("https://discord.gg/tJq2EG9Tnk")
              .setThumbnail("https://dl.labymod.net/img/server/cubecraft/icon@2x.png")
              .addFields(
                games_map.map((game) => ({
                  name: game.name,
                  value: `- ${emojis.rewards.trophy} ${calculateGames(
                    game.value,
                    required_xp
                  )} ${game.type}`,
                  inline: true,
                }))
              )
          ]
        });

        break;

      case "status":
        const statusGames = (await cubecraft.status.getAll()).filter(game => game.name !== "Online");
        const onlineInTotal = await cubecraft.status.getByName("online");

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(colors.default)
              .setTitle(`${emojis.cubecraft.logo} Current status of CubeCraft [${onlineInTotal.value}]`)
              .setThumbnail("https://dl.labymod.net/img/server/cubecraft/icon@2x.png")
              .addFields(
                statusGames.map((game) => {
                  const statusGamesEmojis = {
                    "beta-games": emojis.games.beta_games,
                    "eggwars": emojis.games.eggwars,
                    "skywars": emojis.games.skywars,
                    "survival-games": emojis.games.survival_games,
                    "lucky-blocks": emojis.games.lucky_islands,
                    "blockwars": emojis.games.blockwars,
                    "parkour": emojis.games.parkour,
                    "skyblock": emojis.games.skyblock,
                    "minerware": emojis.games.minerware,
                    "battle-arena": emojis.games.battle_arena
                  };

                  return {
                    name: `${statusGamesEmojis[game.name]} ${game.name
                      .split("-")
                      .map((word) => word[0].toUpperCase() + word.slice(1))
                      .join(" ")}`,
                    value: `- ${game.value} `,
                    inline: true,
                  };
                })
              )
              .setTimestamp(new Date((await cubecraft.status.getByName("online")).lastUpdated))
              .setFooter({
                text: "Last updated",
                iconURL: interaction.guild.iconURL({ size: 1024 }),
              })
          ]
        })

        break;
    }
  },
};
