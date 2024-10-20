const express = require('express');
const path = require('path');
const fs = require('fs').promises;

module.exports = (client) => {
    const router = express.Router();

    const fetchGuildAndRoles = async (config) => {
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
        const roles = guild.roles.cache
            .filter(r => !r.managed && r.name !== '@everyone')
            .map(r => ({ id: r.id, name: r.name }));

        return roles;
    };

    router.get('/', async (req, res) => {
        const config = client.config;
        let roles = [];
        let message = req.query.message || null;
        let error = req.query.error || null;

        try {
            roles = await fetchGuildAndRoles(config);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send(`Server configuration error: ${err.message}`);
        }

        if (!config.ticketOptions) config.ticketOptions = [];
        if (!config.optionConfig) config.optionConfig = {};

        res.render('sections', { config, roles, message, error });
    });

    router.post('/add', async (req, res) => {
        const configPath = path.resolve(__dirname, '../../../config.json');
        let config = client.config;
        let roles = [];

        try {
            roles = await fetchGuildAndRoles(config);
        } catch (err) {
            console.error(err.message);
            return res.redirect('/sections?error=' + encodeURIComponent(`Server configuration error: ${err.message}`));
        }

        if (!config.ticketOptions) config.ticketOptions = [];
        if (!config.optionConfig) config.optionConfig = {};

        const newSectionLabel = req.body.sectionName.trim();
        const newSectionValue = newSectionLabel.toLowerCase().replace(/\s+/g, '-');
        const newEmoji = req.body.emoji.trim() || '';

        if (config.optionConfig[newSectionValue]) {
            return res.redirect('/sections?error=' + encodeURIComponent('Section already exists!'));
        }

        const newSection = {
            label: newSectionLabel,
            value: newSectionValue,
            emoji: newEmoji
        };

        config.ticketOptions.push(newSection);
        config.optionConfig[newSectionValue] = {
            roleId: req.body.roleId,
            image: req.body.image
        };

        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
            console.log('config.json updated successfully.');
            await client.reloadConfig();
        } catch (writeErr) {
            console.error('Error updating config.json:', writeErr);
            return res.redirect('/sections?error=' + encodeURIComponent('Failed to add section.'));
        }

        res.redirect('/sections?message=' + encodeURIComponent('Section added successfully!'));
    });

    router.post('/edit', async (req, res) => {
        const configPath = path.resolve(__dirname, '../../../config.json');
        let config = client.config;

        try {
            await fetchGuildAndRoles(config);
        } catch (err) {
            console.error(err.message);
            return res.redirect('/sections?error=' + encodeURIComponent(`Server configuration error: ${err.message}`));
        }

        const { originalSection, newSectionName, roleId, image, emoji } = req.body;

        if (!originalSection || !config.optionConfig[originalSection]) {
            return res.redirect('/sections?error=' + encodeURIComponent('Original section does not exist.'));
        }

        const newSectionNameTrimmed = newSectionName.trim();
        if (!newSectionNameTrimmed) {
            return res.redirect('/sections?error=' + encodeURIComponent('Section name cannot be empty.'));
        }

        const newSectionValue = newSectionNameTrimmed.toLowerCase().replace(/\s+/g, '-');

        if (newSectionValue !== originalSection && config.optionConfig[newSectionValue]) {
            return res.redirect('/sections?error=' + encodeURIComponent('New section name already exists.'));
        }

        if (newSectionValue === originalSection) {
            config.optionConfig[originalSection] = {
                roleId: roleId,
                image: image
            };
        } else {
            config.optionConfig[newSectionValue] = {
                roleId: roleId,
                image: image
            };
            delete config.optionConfig[originalSection];
        }

        const optionIndex = config.ticketOptions.findIndex(option => option.value === originalSection);
        if (optionIndex !== -1) {
            config.ticketOptions[optionIndex].label = newSectionNameTrimmed;
            config.ticketOptions[optionIndex].value = newSectionValue;
            if (emoji.trim()) {
                config.ticketOptions[optionIndex].emoji = emoji.trim();
            } else {
                delete config.ticketOptions[optionIndex].emoji;
            }
        } else {
            console.warn(`Ticket option with value ${originalSection} not found.`);
        }

        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
            console.log('config.json updated successfully.');
            await client.reloadConfig();
        } catch (writeErr) {
            console.error('Error updating config.json:', writeErr);
            return res.redirect('/sections?error=' + encodeURIComponent('Failed to edit section.'));
        }

        res.redirect('/sections?message=' + encodeURIComponent('Section edited successfully!'));
    });

    router.post('/delete', async (req, res) => {
        const configPath = path.resolve(__dirname, '../../../config.json');
        let config = client.config;

        const { sectionToDelete } = req.body;

        if (!sectionToDelete || !config.optionConfig[sectionToDelete]) {
            return res.redirect('/sections?error=' + encodeURIComponent('Section does not exist.'));
        }

        delete config.optionConfig[sectionToDelete];

        config.ticketOptions = config.ticketOptions.filter(option => option.value !== sectionToDelete);

        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
            console.log('config.json updated successfully.');
            await client.reloadConfig();
        } catch (writeErr) {
            console.error('Error updating config.json:', writeErr);
            return res.redirect('/sections?error=' + encodeURIComponent('Failed to delete section.'));
        }

        res.redirect('/sections?message=' + encodeURIComponent('Section deleted successfully!'));
    });

    return router;
};
