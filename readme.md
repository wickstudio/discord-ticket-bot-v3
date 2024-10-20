# Discord Bot with Dashboard

Welcome to the **Discord Bot with Dashboard** project! This bot offers a comprehensive, intuitive, and sleek web dashboard, allowing you to manage your Discord server effortlessly. Whether it's configuring ticket systems, managing bot settings, or viewing real-time server statistics, this bot provides all the features you'll need to streamline server administration.

## Key Features

- **Ticket System**: Create, manage, and customize server tickets seamlessly.
- **Server Management**: View and manage server sections, roles, and channels with ease.
- **Real-time Metrics**: Monitor server activity, including online members, total members, and bot uptime.
- **Multi-language Support**: Support for both English and Arabic, with easy language switching options.
- **Customizable**: Easily customize dashboard visuals like background images and ticket display styles.
- **Authentication**: Secure authentication for administrators using basic HTTP authentication.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [Dashboard Features](#dashboard-features)
5. [Localization](#localization)
6. [Contributing](#contributing)
7. [Contact](#contact)

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v18)
- [Discord.js](https://discord.js.org/) (v14)
- [Quick.db](https://www.npmjs.com/package/quick.db) for data persistence

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/wickstudio/discord-ticket-bot-v3.git
   ```

2. Navigate to the project directory:

   ```bash
   cd discord-ticket-bot-v3
   ```

3. Install the necessary dependencies:

   ```bash
   npm install
   ```

4. Set up the configuration by renaming `config.example.json` to `config.json`:

   ```bash
   mv config.example.json config.json
   ```

5. Configure your bot's settings in `config.json` (bot token, dashboard credentials, guild ID, etc.).

6. Run the bot:

   ```bash
   node bot.js
   ```

## Configuration

The `config.json` file is the central configuration file where you set up your bot’s key settings.

```json
{
  "token": "YOUR_BOT_TOKEN",
  "prefix": "!",
  "guildID": "YOUR_GUILD_ID",
  "dashboard": {
    "username": "admin",
    "password": "password",
    "port": 3000
  },
  "ticketOptions": [
    {
      "label": "Support",
      "emoji": "💬",
      "roleId": "ROLE_ID"
    }
  ],
  "language": "en",
  "logChannel": "LOG_CHANNEL_ID",
  "feedbackLogChannel": "FEEDBACK_LOG_CHANNEL_ID",
  "BACKGROUND": "https://example.com/banner.png",
  "LINE": "https://example.com/line.png"
}
```

### Important Fields:

- **`token`**: Your bot's Discord token.
- **`guildID`**: The ID of your Discord server.
- **`dashboard`**: Set the login credentials and port for your dashboard.
- **`ticketOptions`**: Configure ticket categories, roles, and emojis for ticket types.
- **`language`**: Set the default language for the bot (`en` for English, `ar` for Arabic).
- **`logChannel`** & **`feedbackLogChannel`**: Specify the channels for logging and feedback.

## Usage

Once the bot is running, you can access the dashboard through your browser at:

```
http://localhost:3000
```

### Authentication

The dashboard requires basic authentication. Use the username and password set in the `config.json` file to log in.

- **Username**: `admin` (or as set in config)
- **Password**: `password` (or as set in config)

### Available Bot Commands

| Command          | Description                                         |
|------------------|-----------------------------------------------------|
| `/help`          | Displays a help message with available commands.    |
| `/ticket`        | Opens a new support ticket.                         |
| `/close`         | Closes an existing support ticket.                  |
| `/stats`         | Shows the server and bot statistics.                |
| `/settings`      | Access bot settings within the Discord server.      |

## Dashboard Features

### 1. **Ticket System**

Easily manage server tickets through the dashboard. Add, edit, or remove ticket categories, assign roles, and monitor ticket activities.

### 2. **Real-Time Stats**

Get insights into your server's statistics, such as:

- Total members and online members
- Bot uptime and memory usage
- Available channels and categories

### 3. **Customizable Visuals**

Tailor the dashboard's appearance by changing the background image, line image, and ticket display style (buttons or list view).

### 4. **Role Management**

Assign roles to different ticket categories. When users open a ticket, they’ll be automatically assigned to the specified role.

### 5. **Multi-language Support**

Switch between English and Arabic on the dashboard. The bot’s language can also be dynamically switched based on user preference.

## Localization

The bot supports both **English** and **Arabic** out of the box. The localization files are found in the `locales` directory:

- `locales/en.json` for English
- `locales/ar.json` for Arabic

You can easily add more languages by creating additional JSON files following the same format.

## Contributing

If you'd like to contribute to the project, feel free to fork the repository and submit a pull request. All contributions are welcome, from fixing bugs to adding new features!

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## Contact

Feel free to reach out if you have any questions or need support:

- Discord: [discord.gg/wicks](https://discord.gg/wicks)
- GitHub: [github.com/wickstudio](https://github.com/wickstudio)
- Instagram: [@mik__subhi](https://www.instagram.com/mik__subhi/)

Thank you for using this Discord Bot with Dashboard! We hope it helps enhance your server management experience.