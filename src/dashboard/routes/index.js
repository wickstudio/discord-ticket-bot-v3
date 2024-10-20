const express = require('express');
const path = require('path');
const { ChannelType } = require('discord.js');

module.exports = (client) => {
    const router = express.Router();

    const getUptime = () => {
        const totalSeconds = client.uptime / 1000;
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    router.get('/', async (req, res) => {
        let config = client.config;
        let channels = [];
        let categories = [];
        let members = [];
        let totalMembers = 0;
        let onlineMembers = 0;

        try {
            const guildID = config.guildID;
            if (!guildID) {
                console.error('guildID is not defined in config.json.');
                return res.status(500).send('Server configuration error: guildID not set.');
            }

            console.log('Attempting to fetch guild with ID:', guildID);
            const guild = await client.guilds.fetch(guildID).catch((error) => {
                console.error(`Failed to fetch guild with ID ${guildID}:`, error);
                return null;
            });

            if (guild) {
                console.log(`Guild fetched successfully: ${guild.name}`);
                channels = guild.channels.cache
                    .filter(c => [ChannelType.GuildText, ChannelType.GuildVoice].includes(c.type))
                    .map(c => ({ id: c.id, name: c.name, type: c.type }));

                categories = guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildCategory)
                    .map(c => ({ id: c.id, name: c.name }));

                await guild.members.fetch();
                members = guild.members.cache;
                totalMembers = members.size;
                onlineMembers = members.filter(member => member.presence && member.presence.status !== 'offline').size;
            } else {
                console.error(`Guild with ID ${guildID} not found or bot lacks access.`);
                return res.status(500).send('Server configuration error: Guild not found.');
            }
        } catch (error) {
            console.error('Error loading config.json:', error);
            return res.status(500).send('Server configuration error.');
        }

        const ticketCount = config.optionConfig ? Object.keys(config.optionConfig).length : 0;
        const sectionCount = config.ticketOptions ? config.ticketOptions.length : 0;
        const botUptime = getUptime();

        const ticketOptionsLabels = config.ticketOptions ? config.ticketOptions.map(option => option.label) : [];
        const ticketOptionsData = config.ticketOptions ? config.ticketOptions.map(option => {
            return Math.floor(Math.random() * 100) + 1;
        }) : [];

        const message = req.query.message || null;
        const error = req.query.error || null;

        res.render('index', {
            config,
            ticketCount,
            sectionCount,
            channels,
            categories,
            totalMembers,
            onlineMembers,
            botUptime,
            ticketOptionsLabels,
            ticketOptionsData,
            activePage: 'home',
            message,
            error
        });
    });

    return router;
};
