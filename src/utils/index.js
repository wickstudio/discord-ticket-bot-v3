const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const path = require('path');
const fs = require('fs');

const generateHtmlPage = async (channel) => {
  const discordTranscripts = require('discord-html-transcripts');
  const attachment = await discordTranscripts.createTranscript(channel, {
    limit: -1,
    returnType: 'string',
    filename: 'transcript.html',
    saveImages: true,
    poweredBy: false,
    ssr: false,
  });
  return attachment;
};

class CustomClient extends Client {
  constructor() {
    super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });

    this.locale = new Collection();
    this.commands = new Collection();
    this.interactions = new Collection();
    this.db = new QuickDB({ filePath: './database/tickets.sqlite' });

    const configPath = path.resolve(__dirname, '../../config.json');
    if (fs.existsSync(configPath)) {
      this.config = require(configPath);
      console.log('Configuration loaded successfully.');
    } else {
      console.error('config.json not found. Please ensure it exists in the root directory.');
      this.config = {};
    }
  }

  reloadConfig() {
    const configPath = path.resolve(__dirname, '../../config.json');
    delete require.cache[require.resolve(configPath)];
    try {
      this.config = require(configPath);
      console.log('Configuration reloaded.');
    } catch (error) {
      console.error('Error reloading config.json:', error);
    }
  }
}

module.exports = { generateHtmlPage, CustomClient };