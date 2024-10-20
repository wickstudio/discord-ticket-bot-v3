console.log(`
    ██╗    ██╗██╗ ██████╗██╗  ██╗    ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ 
    ██║    ██║██║██╔════╝██║ ██╔╝    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
    ██║ █╗ ██║██║██║     █████╔╝     ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
    ██║███╗██║██║██║     ██╔═██╗     ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
    ╚███╔███╔╝██║╚██████╗██║  ██╗    ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
     ╚══╝╚══╝ ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ 
  `);
  
  const { Routes, REST } = require('discord.js');
  const { CustomClient } = require('./src/utils/index');
  const fs = require('fs');
  const path = require('path');
  
  const client = new CustomClient();
  
  // Load commands
  const commands = [];
  const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
    commands.push(command.data);
  }
  
  // Load interactions
  const interactionsFiles = fs.readdirSync('./src/interactions').filter((file) => file.endsWith('.js'));
  for (const file of interactionsFiles) {
    const interaction = require(`./src/interactions/${file}`);
    client.interactions.set(interaction.name, interaction);
  }
  
  // Load events
  const eventsFiles = fs.readdirSync('./src/events').filter((file) => file.endsWith('.js'));
  for (const file of eventsFiles) {
    const event = require(`./src/events/${file}`);
    client.on(event.name, async (...args) => {
      event.execute(client, ...args);
    });
  }
  
  // Load locale files
  const localesPath = path.resolve(__dirname, './src/locale');
  const localeFiles = fs.readdirSync(localesPath).filter((file) => file.endsWith('.json'));
  for (const file of localeFiles) {
    const locale = require(path.join(localesPath, file));
    const localeName = path.basename(file, '.json');
    client.locale.set(localeName, locale);
  }
  
  const rest = new REST({ version: '10' }).setToken(client.config.TOKEN);
  
  client.once('ready', async () => {
    try {
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log(`\x1b[32mBot is online! ${client.user.username}\x1b[0m`);
      console.log('\x1b[34mCode by Wick Studio\x1b[0m');
      console.log('\x1b[33mdiscord.gg/wicks\x1b[0m');
      console.info(`Bot ${client.user.username} is online.`);
    } catch (error) {
      console.error('Error registering slash commands:', error);
      console.error('Error registering slash commands:', error);
    }
  
    require('./src/dashboard/dashboard')(client);
  });
  
  client.login(client.config.TOKEN);
  
  process.on('unhandledRejection', (reason, p) => {
    console.log(' [antiCrash] :: Unhandled Rejection/Catch');
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch');
    console.log(err, origin);
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
    console.log(err, origin);
});