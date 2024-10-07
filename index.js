const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { checkExpiredCooldowns } = require('./utils/cooldownExpire');
const { checkTemporaryBans } = require('./utils/temporaryBans')
const { checkEndedSessions } = require('./utils/therapyEnd')
const { checkUploads } = require('./utils/youtuberModule');
const print = require('./utils/print');
const path = require("path");
const fs = require("fs");

require("dotenv").config();

function animateLoading(animationIndex) {
  const symbols = ['○', '●'];
  const symbol = symbols[animationIndex % symbols.length];

  print.loading(`Turning on the bot...              \r`, symbol);
}

let animationIndex = 0;

const loadingInterval = setInterval(() => {
 animateLoading(animationIndex++);
}, 500)

const client = new Client({
  closeTimeout: 5_000,
  intents: [
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();

process.removeAllListeners('warning')

process.on("unhandledRejection", async (reason, promise) => {
  return print.error(`Unhandled Rejection at : ${reason}`);
});
process.on("uncaughtException", (err) => {
  return print.error(`Uncaught Exception : ${err}`);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  return print.error(`Uncaught Exception Monitor : ${err}`);
});

process.on('SIGINT', () => {
  clearInterval(loadingInterval);
  process.stdout.write('\x1b[?25h');
  process.exit(0);
});

const commandsFolder = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsFolder);

for (const folder of commandFolders) {
  const commandsPath = path.join(commandsFolder, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    }
  }
}

const eventsFolder = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsFolder).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsFolder, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.CLIENT_TOKEN).then(() => {
  clearInterval(loadingInterval)
  process.stdout.write('\x1b[?25h');
})

setInterval(async () => {
  await checkExpiredCooldowns()
}, 60_000);

setInterval(async () => {
  await checkEndedSessions()
}, 60_000);

setInterval(async () => {
  await checkTemporaryBans(client)
}, 60_000);

// setInterval(async () => {
//   await checkUploads(client)
// }, 300_000)