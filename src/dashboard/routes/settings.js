const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { ChannelType } = require('discord.js');

module.exports = (client) => {
    const router = express.Router();

    const fetchGuildAndChannels = async (config) => {
        const guildID = config.guildID;
        if (!guildID) {
            throw new Error('guildID is not defined in config.json.');
        }

        console.log('Attempting to fetch guild with ID:', guildID);
        const guild = await client.guilds.fetch(guildID).catch((error) => {
            console.error(`Failed to fetch guild with ID ${guildID}:`, error);
            return null;
        });

        if (!guild) {
            throw new Error('Guild not found or bot lacks access.');
        }

        console.log(`Guild fetched successfully: ${guild.name}`);
        const channels = guild.channels.cache
            .filter(c => [ChannelType.GuildText, ChannelType.GuildVoice].includes(c.type))
            .map(c => ({ id: c.id, name: c.name, type: c.type }));

        const categories = guild.channels.cache
            .filter(c => c.type === ChannelType.GuildCategory)
            .map(c => ({ id: c.id, name: c.name }));

        return { channels, categories };
    };

    router.get('/', async (req, res) => {
        try {
            const config = client.config;
            let channels = [];
            let categories = [];

            try {
                const fetchedData = await fetchGuildAndChannels(config);
                channels = fetchedData.channels;
                categories = fetchedData.categories;
            } catch (guildError) {
                console.error(guildError.message);
                return res.status(500).send(`Server configuration error: ${guildError.message}`);
            }

            res.render('settings', { 
                config, 
                channels, 
                categories, 
                message: req.query.message || null, 
                error: req.query.error || null 
            });
        } catch (error) {
            console.error('Error in GET /settings:', error);
            return res.status(500).send('Server configuration error.');
        }
    });

    router.post('/update', express.urlencoded({ extended: true }), async (req, res) => {
        const configPath = path.resolve(__dirname, '../../../config.json');
        let config = { ...client.config };

        try {
            console.log('Received POST /settings/update');
            console.log('Form Data:', req.body);

            const { section } = req.body;

            if (!section) {
                console.error('Validation Error: Section identifier missing.');
                return res.redirect('/settings?error=' + encodeURIComponent('Invalid request.'));
            }

            const validSections = ['images', 'category', 'logs', 'language', 'sectionType'];
            if (!validSections.includes(section)) {
                console.error(`Validation Error: Invalid section '${section}' provided.`);
                return res.redirect('/settings?error=' + encodeURIComponent('Invalid section identifier.'));
            }

            let isUpdated = false;

            const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/gm;

            switch (section) {
                case 'images':
                    {
                        const { backgroundImageURL, lineImageURL } = req.body;

                        if (!urlPattern.test(backgroundImageURL)) {
                            console.error('Validation Error: Invalid background image URL provided.');
                            return res.redirect('/settings?error=' + encodeURIComponent('Invalid background image URL provided.'));
                        }

                        if (lineImageURL && !urlPattern.test(lineImageURL)) {
                            console.error('Validation Error: Invalid line image URL provided.');
                            return res.redirect('/settings?error=' + encodeURIComponent('Invalid line image URL provided.'));
                        }

                        config.BACKGROUND = backgroundImageURL;
                        config.LINE = lineImageURL || '';

                        console.log('Updated Images:');
                        console.log('Background Image URL:', config.BACKGROUND);
                        console.log('Line Image URL:', config.LINE);

                        isUpdated = true;
                    }
                    break;

                case 'category':
                    {
                        const { categoryID } = req.body;

                        if (!categoryID) {
                            console.error('Validation Error: categoryID is required.');
                            return res.redirect('/settings?error=' + encodeURIComponent('Category ID is required.'));
                        }

                        config.categoryID = categoryID;

                        console.log('Updated Category ID:', config.categoryID);

                        isUpdated = true;
                    }
                    break;

                case 'logs':
                    {
                        const { logChannel, feedbackLogChannel } = req.body;

                        if (!logChannel || !feedbackLogChannel) {
                            console.error('Validation Error: logChannel and feedbackLogChannel are required.');
                            return res.redirect('/settings?error=' + encodeURIComponent('Log channels are required.'));
                        }

                        config.logChannel = logChannel;
                        config.feedbackLogChannel = feedbackLogChannel;

                        console.log('Updated Log Channels:');
                        console.log('Log Channel:', config.logChannel);
                        console.log('Feedback Log Channel:', config.feedbackLogChannel);

                        isUpdated = true;
                    }
                    break;

                case 'language':
                    {
                        const { language } = req.body;

                        const validLanguages = ['en', 'ar'];
                        if (!validLanguages.includes(language)) {
                            console.error('Validation Error: Invalid language selected.');
                            return res.redirect('/settings?error=' + encodeURIComponent('Invalid language selected.'));
                        }

                        config.language = language;

                        console.log('Updated Language:', config.language);

                        isUpdated = true;
                    }
                    break;

                case 'sectionType':
                    {
                        const { sectionType } = req.body;

                        const validSectionTypes = ['buttons', 'list'];
                        if (!validSectionTypes.includes(sectionType)) {
                            console.error('Validation Error: Invalid section type selected.');
                            return res.redirect('/settings?error=' + encodeURIComponent('Invalid section type selected.'));
                        }

                        config.sectionType = sectionType;

                        console.log('Updated Section Type:', config.sectionType);

                        isUpdated = true;
                    }
                    break;

                default:
                    console.error(`Unhandled section: ${section}`);
                    return res.redirect('/settings?error=' + encodeURIComponent('Unhandled section.'));
            }

            if (isUpdated) {
                try {
                    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
                    console.log('config.json updated successfully.');
                    await client.reloadConfig();
                    console.log('Configuration reloaded.');
                } catch (writeErr) {
                    console.error('Error writing to config.json:', writeErr);
                    return res.redirect('/settings?error=' + encodeURIComponent('Failed to update settings.'));
                }

                res.redirect('/settings?message=' + encodeURIComponent('Settings updated successfully!'));
            } else {
                res.redirect('/settings?error=' + encodeURIComponent('No changes detected.'));
            }

        } catch (error) {
            console.error('Error in POST /settings/update:', error);
            res.redirect('/settings?error=' + encodeURIComponent('Failed to update settings.'));
        }
    });

    return router;
};
