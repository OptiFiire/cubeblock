# 🧊 CubeBlock Bot

CubeBlock Bot is a powerful, customizable Discord bot designed for community management, moderation, and content integration. It offers a variety of features such as handling bans, temporary sessions, cooldowns, and content uploads.

## 🔥 Features

- **Moderation**: Handle temporary and permanent bans.
- **Session Management**: Automatically end and track user sessions.
- **Cooldown Management**: Keep track of expired cooldowns.
- **CubeCraft Statistics View**: Display cubecraft's statistics right in discord.
- **YouTube Content Integration**: Fetch and notify users of new YouTube uploads.

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/cubeblock-bot.git
   cd cubeblock-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the environment variables**:

   You will need to create a `.env` file in the root directory of your project with the following content:

   ```env
   CLIENT_TOKEN=YOUR_CLIENT_TOKEN_HERE
   CLIENT_ID=YOUR_CLIENT_ID_HERE
   CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
   OATC=YOUR_DISCORD_ACCOUNT_TOKEN_HERE
   ```

   Replace the placeholders with your actual credentials. You can get the `CLIENT_TOKEN`, `CLIENT_ID`, and `CLIENT_SECRET` by creating an application on the [Discord Developer Portal](https://discord.com/developers/applications). Obtaining value for `OATC` is instructed [in this article](https://www.geeksforgeeks.org/how-to-get-discord-token/).

4. **Set up the database**:

   Since the `.sqlite` database files are not included in the repository for security reasons, you can generate a fresh SQLite database for your local development environment.

   1. **Database Migration**:
      If your project uses an ORM like Sequelize or TypeORM, run the following to generate the necessary database tables:

      ```bash
      npx sequelize-cli db:migrate
      ```

      Otherwise, provide instructions to manually create the database tables if necessary.

   2. **Database Folder**:
      Ensure that a `databases` folder exists in the project root. The bot will automatically create the SQLite files in that directory if they don’t already exist.

      ```bash
      mkdir databases
      ```

## 🔰 Usage

1. **Start the bot**:
   ```bash
   node .
   ```

   The bot will automatically connect to Discord using the token provided in your `.env` file and will perform tasks like checking for expired bans and fetching YouTube uploads.

2. **Bot Commands**:
   The bot offers a range of commands for moderation, content integration, and more. Use `/help` to get a list of available commands.

## ⭐ Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Issues

If you encounter any issues, feel free to open an issue on the [GitHub Issues](https://github.com/OptiFiire/cubeblock/issues) page.