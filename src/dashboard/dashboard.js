const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const i18n = require('i18n');
const chokidar = require('chokidar');


/**
 * @param {CustomClient} client 
 */
function initializeDashboard(client) {
    const configPath = path.resolve(__dirname, '../../config.json');
    let config;

    const loadConfig = () => {
        delete require.cache[require.resolve(configPath)];
        try {
            config = require(configPath);
            client.config = config;
            console.log('Configuration loaded successfully.');
        } catch (error) {
            console.error('Error loading config.json:', error);
            config = {};
            client.config = config;
        }
    };

    loadConfig();

    chokidar.watch(configPath).on('change', () => {
        console.log('config.json has changed. Reloading...');
        loadConfig();
    });

    const app = express();

    i18n.configure({
        locales: ['en', 'ar'],
        directory: path.join(__dirname, 'locales'),
        defaultLocale: config.language || 'en',
        queryParameter: 'lang',
        objectNotation: true,
        autoReload: true,
        updateFiles: false,
        syncFiles: false,
    });

    app.use(i18n.init);

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));

    const auth = (req, res, next) => {
        const authHeader = req.headers.authorization;

        const username = config.dashboard ? config.dashboard.username : null;
        const password = config.dashboard ? config.dashboard.password : null;

        if (!username || !password) {
            console.error('Dashboard credentials are not set in config.json.');
            return res.status(500).send('Server configuration error.');
        }

        if (!authHeader) {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).send('Authentication required.');
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [inputUsername, inputPassword] = credentials.split(':');

        if (inputUsername === username && inputPassword === password) {
            req.admin = username;
            return next();
        } else {
            res.setHeader('WWW-Authenticate', 'Basic');
            return res.status(401).send('Authentication required.');
        }
    };

    app.use(auth);

    const indexRoute = require('./routes/index')(client);
    const settingsRoute = require('./routes/settings')(client);
    const sectionsRoute = require('./routes/sections')(client);

    app.use('/', indexRoute);
    app.use('/settings', settingsRoute);
    app.use('/sections', sectionsRoute);

    const PORT = config.dashboard.port;
    app.listen(PORT, () => {
        console.log(`Dashboard is running at http://localhost:${PORT}`);
    });
}

module.exports = initializeDashboard;

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