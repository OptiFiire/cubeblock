const { REST, Routes } = require('discord.js');
const print = require('./utils/print');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const clientId = process.env.CLIENT_ID
const token = process.env.CLIENT_TOKEN

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      print.warn(`Command at \x1b[1m${filePath}\x1b[0m is missing required data.`);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {

  function animateLoading(animationIndex) {
    const symbols = ['○', '●'];
    const symbol = symbols[animationIndex % symbols.length];

    print.loading(`Started refreshing \x1b[1m${commands.length}\x1b[0m commands.\r`, symbol);
  }

  let animationIndex = 0;

  const loadingInterval = setInterval(() => {
    animateLoading(animationIndex++);
  }, 500)
  
  process.on('SIGINT', () => {
    clearInterval(loadingInterval);
    process.stdout.write('\n');
    process.stdout.write('\x1b[?25h');
    process.exit(0);
  });

  try {
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    print.success(`Successfully reloaded \x1b[1m${data.length}\x1b[0m commands.`, true);
    clearInterval(loadingInterval)
    process.stdout.write('\x1b[?25h');
  } catch (error) {
    print.error(error)
    clearInterval(loadingInterval)
    process.stdout.write('\x1b[?25h');
  }
})();
