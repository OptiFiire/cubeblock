const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const emojis = require('../../json/emojis.json')
const colors = require('../../json/colors.json')
const channels = require('../../json/channels.json')
const path = require('path')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Sets up a specific system for the server.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(command => command
			.setName('ticket')
			.setDescription('Sets up ticket system for the server.'))
		.addSubcommand(command => command
			.setName('rules')
			.setDescription('Sets up rules for the server.'))
		.addSubcommand(command => command
			.setName('applications')
			.setDescription('Sets up staff applications system for the server.')
			.addStringOption(option => option
				.setName('type')
				.setDescription('The type of application you want to set up.')
				.addChoices(
					{ name: 'Helper Applications', value: 'helperApps' }
				)
				.setRequired(true)
			)),

	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case 'ticket':
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${emojis.indicators.checkmark} Set Up Ticket.`)
							.setDescription(`Ticket system has been set up.`)
							.setColor(colors.success)
					],
					ephemeral: true,
				});

				const ticketsChannel = await interaction.guild.channels.cache.get(channels.tickets);

				await ticketsChannel.send({
					content: ` `,
					files: [path.join(__dirname, "../../images/ticket.png")],
				}).then(async () => {
					await ticketsChannel.send({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.default)
								.setTitle(`${emojis.socials.cubeblock_pixel} CubeBlock Tickets`)
								.setThumbnail('https://i.ibb.co/yVp6K2G/cubeblock-logo-default-no-background.png')
								.setDescription(
									`Need assistance? Having trouble or want to apply for a particular role? This is the right place! \
Simply click the ${emojis.indicators.lock_open} button below this embed, explain the problem and that's it! Our support team will \
assist you as soon as they can.`
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
										.setCustomId("openTicketButton")
										.setEmoji(emojis.indicators.lock_open)
										.setStyle(ButtonStyle.Secondary)
								)
						]
					})
				});

				break;

			case 'rules':
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`${emojis.indicators.checkmark} Set Up Rules`)
							.setDescription(`Successfully set up server rules.`)
							.setColor(colors.success)
					],
					ephemeral: true,
				});

				const rulesChannel = interaction.guild.channels.cache.get(channels.rules);

				await rulesChannel.send({
					content: ` `,
					files: [path.join(__dirname, "../../images/rules.png")],
				}).then(async () => {
					await rulesChannel.send({
						embeds: [
							new EmbedBuilder()
								.setColor(colors.default)
								.setThumbnail("https://media.discordapp.net/attachments/1173183110058360882/1243138591148998666/cubeblock_logo.png?ex=66510b48&is=664fb9c8&hm=3684b1be1e87165460b3e36b87828f6f539fd9cf625f1e3a0e4e79be168fbc67&=&format=webp&quality=lossless&width=662&height=662")
								.setDescription(
									`### 📌 Note : Even if a user takes an action that isn't on this list, the CubeBlock staff team still has rights take action. \
That's why we advise you staying friendly and civil.

- **0.1** - No insulting or disrespecting members.
- **0.2** - No spamming or flooding (Exceptions : <#1146396276821344257>).
- **0.3** - No content with age restrictions.
- **0.4** - No advertising (Exceptions : <#1103130077555851274>).
- **0.5** - No getting around the ban.
- **0.6** - No begging.
- **0.7** - No impersonating.
- **0.8** - No political discussions.
- **0.9** - No swearing.
- **1.0** - No making weird noises in VCs.
- **1.1** - Do not try to bypass blacklisted words.
- **1.2** - Avoid arguing or beefing with staff members.
- **1.3** - No threats, either direct or indirect.
- **1.4** - Do not exploit any NSFW commands.

\`\`\`NOTE : You will be banned after 5 warnings.\`\`\``
								)
						]
					})
				})
				break;

			case 'applications':
				const applicationsChannel = await interaction.guild.channels.cache.get(channels.applications);

				switch (interaction, interaction.options.getString('type')) {
					case 'helperApps':

						await interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle(`${emojis.indicators.checkmark} Set Up Staff Applications.`)
									.setDescription(`Successfully set up staff applications system.`)
									.setColor(colors.success)
							],
							ephemeral: true,
						});

						await applicationsChannel.send({
							content: ` `,
							files: [path.join(__dirname, "../../images/applications.png")],
						}).then(async () => {
							await applicationsChannel.send({
								embeds: [
									new EmbedBuilder()
										.setColor(colors.default)
										.setThumbnail('https://i.ibb.co/hVq8RG7/cubeblock-logo-default-no-background.png')
										.setTitle('CubeBlock Staff Applications')
										.setDescription(
											`Are you interested in joining the CubeBlock staff team? You can apply for a staff \
position here if you meet all the requirements. Please note that applications will be reviewed by administrators as time permits. \
If you are accepted, our CubeBlock bot will send you a direct message. If you do not receive a message, it means your application \
was not successful. By applying youre agreeing to our Terms and Conditions linked below.`)
										.addFields(
											{
												name: `${emojis.indicators.arrowR} Rules :`, value:
													`- 1. Do not spam-apply.
- 2. Do not use the same context used in your previous applications if you were rejected.
- 3. Do not require owner/admins to accept you.
- 4. Do not argue with admins about your rejection.
- 5. Do not pretend to be applying for someone else.`
											},
											{
												name: `${emojis.indicators.arrowR} Requirements :`, value:
													`- 1. Must be over age of 14.
- 2. Must be active in the server.
- 3. Must be active CubeCraft player.
- 4. Must be in server at least a week.
- 5. Must be able to speak fluently in English.`
											},
											{
												name: `${emojis.indicators.arrowR} Notes :`, value:
													`- By applying youre agreeing to our [Staff terms and conditions](<https://screeching-target-0aa.notion.site/Staff-T-C-10f7a13848f88061a418fd87e2bcbcfb?pvs=4>)`
											}
										)
								],
								components: [
									new ActionRowBuilder()
										.addComponents(
											new ButtonBuilder()
												.setCustomId('applyForStaffButton')
												.setLabel('Apply for staff')
												.setStyle(ButtonStyle.Secondary)
												.setEmoji(emojis.miscellaneous.hammer),
										)
								]
							})
						})

						break;
				}
				break;
		}
	}
}