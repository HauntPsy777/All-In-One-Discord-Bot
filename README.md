# 🤖 All-In-One Discord Bot

<p align="center">
  <b>A powerful, modular and feature-rich Discord bot built with Node.js.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Discord-Bot-5865F2?style=for-the-badge&logo=discord" alt="Discord">
  <img src="https://img.shields.io/github/languages/top/HauntPsy777/All-In-One-Discord-Bot?style=for-the-badge" alt="Top Language">
  <img src="https://img.shields.io/github/stars/HauntPsy777/All-In-One-Discord-Bot?style=for-the-badge" alt="Stars">
</p>

---

## 📖 About

**All-In-One Discord Bot** is a modular Discord bot designed to bring multiple server-management and utility features into a single project.

The project is organized into independent modules, making it easier to maintain, extend, and add new functionality without turning the codebase into one large file.

It includes systems for:

- 🛡️ Administration
- 🚫 Anti-abuse / protection
- 👥 Member management
- 🎙️ Voice utilities
- 💰 Economy
- ⚙️ Server setup
- 🎨 Embeds
- 🔎 Checkers
- ⚡ Slash commands
- 🔘 Discord components
- 🗄️ Database
- 🔐 Permissions
- 🔌 Plugins
- 📡 Event handlers
- 🧩 Reusable functions

---

# ✨ Features

## 🛡️ Admin Commands

Administrative commands designed to help manage and control a Discord server.

The administration system is located in:

```text
commands/
└── Admin Cmds/
🚫 Anti Commands

Protection and anti-abuse related functionality.

Located in:

commands/
└── Anti Cmds/

These commands can be extended with additional server protection features.

👥 Member Commands

Commands focused on members and user-related utilities.

commands/
└── Member Cmds/
🎙️ Voice Commands

Voice-related functionality and utilities.

commands/
└── Voice Cmds/

The project also includes a dedicated voice checker:

commands/
└── checker/
    └── checkvc.js
💰 Economy System

The project contains an economy command category:

commands/
└── eco-cmds/

This structure allows economy-related functionality to remain separated from the rest of the bot.

⚙️ Setup Commands

Server configuration and setup functionality.

commands/
└── Setup Cmds/

This keeps server setup functionality independent from normal commands.

🎨 Embed System

Reusable embed-related functionality is organized under:

commands/
└── Embeds/

Embeds can be used to create cleaner and more structured Discord messages.

⚡ Slash Commands

The project supports Discord slash commands through a dedicated directory:

slashCommands/

Keeping slash commands separated makes them easier to manage and maintain.

🔘 Components

Reusable Discord interaction components are stored in:

components/

This directory can contain interactive elements such as:

Buttons
Select menus
Modals
Other Discord interaction components
📡 Events

Discord event handlers are separated into:

events/

This allows different Discord events to be handled independently instead of putting all event logic inside the main file.

🔐 Permissions

Permission-related logic is organized under:

permissions/

This provides a dedicated place for controlling access to different commands and features.

🗄️ Database

Database-related functionality is stored in:

db/

Database models are separated into:

models/

This separation helps keep data handling and application logic organized.

🔌 Plugins

The bot includes a dedicated plugin structure:

plugins/

Plugins make it possible to extend the bot with additional functionality while keeping the main architecture modular.

📁 Project Structure
All-In-One-Discord-Bot/
│
├── client/
│
├── commands/
│   │
│   ├── Admin Cmds/
│   │
│   ├── Anti Cmds/
│   │
│   ├── Embeds/
│   │
│   ├── Member Cmds/
│   │
│   ├── Setup Cmds/
│   │
│   ├── Voice Cmds/
│   │
│   ├── checker/
│   │   └── checkvc.js
│   │
│   └── eco-cmds/
│
├── components/
│
├── controller/
│
├── db/
│
├── events/
│
├── functions/
│
├── json/
│
├── models/
│
├── permissions/
│
├── plugins/
│
├── slashCommands/
│
├── package.json
├── package-lock.json
└── README.md
🧱 Architecture

The project follows a modular architecture.

Instead of placing every feature inside a single file, functionality is separated into different directories.

Discord Events
      │
      ▼
   Client
      │
      ├──────────────┐
      ▼              ▼
 Commands       Slash Commands
      │              │
      ├──────┬───────┤
      ▼      ▼       ▼
  Admin   Member   Voice
      │      │       │
      └──────┴───────┘
             │
             ▼
        Controllers
             │
       ┌─────┴─────┐
       ▼           ▼
   Functions      DB
                    │
                    ▼
                 Models

This architecture makes the project easier to scale as more features are added.

🚀 Installation
1. Clone the repository
git clone https://github.com/HauntPsy777/All-In-One-Discord-Bot.git

Enter the project directory:

cd All-In-One-Discord-Bot
2. Install dependencies

Run:

npm install

This installs all dependencies defined inside:

package.json
🔑 Configuration

Create a .env file in the root directory:

All-In-One-Discord-Bot/
├── .env
├── package.json
└── ...

Example:

TOKEN=YOUR_DISCORD_BOT_TOKEN

Depending on your configuration, additional environment variables may be required.

🔐 Environment Variables
Variable	Description
TOKEN	Discord bot token
DATABASE_URL	Database connection string, if required

The exact environment variables depend on the configuration used by the project.

⚠️ Security

Never publish your Discord bot token.

Do not put sensitive credentials directly inside your source code.

Your .env file should be ignored by Git.

Create or update:

.gitignore

with:

node_modules/
.env
🤖 Creating the Discord Bot

Before running the project, create a Discord application through the Discord Developer Portal.

Steps
Create a new Discord application.
Create a Bot user.
Copy the bot token.
Configure the required intents.
Configure the required permissions.
Invite the bot to your Discord server.
Add the token to .env.

Example:

TOKEN=YOUR_DISCORD_BOT_TOKEN
▶️ Running the Bot

After installation and configuration, start the bot using:

node .

If your package.json contains a start script, you can also use:

npm start
🛠️ Development

For development, you can use a development script if it is configured in package.json:

npm run dev

For automatic restarting during development, a tool such as nodemon can be used if configured by the project.

📋 Command Categories

The project organizes commands into several categories.

Category	Purpose
🛡️ Admin Cmds	Administration and server management
🚫 Anti Cmds	Protection and anti-abuse functionality
🎨 Embeds	Embed-related commands
👥 Member Cmds	Member utilities
⚙️ Setup Cmds	Server setup and configuration
🎙️ Voice Cmds	Voice-related functionality
🔎 Checker	Checking and utility functionality
💰 Eco Cmds	Economy-related functionality
⚡ Slash Commands	Discord slash commands
🔎 Voice Checker

A dedicated voice checker is included in:

commands/checker/checkvc.js

This module provides voice-channel checking functionality and can be extended independently from the main voice command system.

🧩 Adding a New Command

To add a normal command, place it inside the appropriate category.

For example:

commands/
└── Member Cmds/
    └── myCommand.js

Choose the category that best matches the purpose of the command.

⚡ Adding a Slash Command

Slash commands should be placed inside:

slashCommands/

Example:

slashCommands/
└── myCommand.js

Keep slash commands separated from traditional command modules to maintain a clean architecture.

🔘 Components

Interactive Discord components can be organized inside:

components/

Recommended organization:

components/
├── buttons/
├── selectMenus/
└── modals/

The exact structure can be adapted depending on the implementation.

📡 Events

Discord event handlers belong inside:

events/

Example structure:

events/
├── ready.js
├── messageCreate.js
├── interactionCreate.js
└── voiceStateUpdate.js

This approach prevents the main client file from becoming unnecessarily large.

🗄️ Database

Database functionality is separated into:

db/

while data models are stored under:

models/

This separation allows database logic to remain independent from commands and event handlers.

🔐 Permissions

Permission-related functionality is located under:

permissions/

This allows commands and features to use centralized permission logic instead of implementing access checks repeatedly.

🔌 Plugins

Additional modules can be organized under:

plugins/

The plugin structure makes the bot easier to extend without modifying unrelated systems.

🧰 Utility Functions

Reusable functions should be placed inside:

functions/

This prevents duplicated logic across commands and event handlers.

🗂️ JSON Configuration

JSON-based configuration and data can be stored inside:

json/

Keeping configuration files separated from JavaScript logic makes the project easier to maintain.

📦 Dependencies

All project dependencies are managed through:

package.json

Install them with:

npm install

To update dependencies:

npm update
🧪 Testing

Before deploying changes, make sure to test:

Commands
Slash commands
Buttons and interactions
Permissions
Voice functionality
Database operations
Event handlers
Error handling

Always test new features in a development Discord server before using them in a production server.

🐛 Troubleshooting
Bot does not start

Check that:

Node.js is installed.
Dependencies are installed.
.env exists.
TOKEN is correctly configured.
The Discord token is valid.

Run:

npm install

and then:

node .
Commands are not working

Check:

The bot has the required permissions.
Required intents are enabled.
The command is placed in the correct directory.
The command is properly loaded.
There are no errors in the console.
Slash commands are not appearing

Check:

The bot was invited with the required application scopes.
Slash commands are correctly registered.
The command files are located inside slashCommands/.
The bot has the required permissions.
🛡️ Best Practices

When contributing to the project:

Keep features modular.
Avoid unnecessarily large files.
Reuse functions instead of duplicating code.
Keep commands organized by category.
Keep database logic separate from commands.
Validate user input.
Handle errors properly.
Never expose secrets.
Test changes before pushing them.
🤝 Contributing

Contributions are welcome.

1. Fork the repository

Create your own fork of the project.

2. Clone your fork
git clone https://github.com/YOUR_USERNAME/All-In-One-Discord-Bot.git
cd All-In-One-Discord-Bot
3. Create a branch
git checkout -b feature/my-feature
4. Make your changes

Implement your feature while following the existing project structure.

5. Test your changes

Make sure your changes do not break existing functionality.

6. Commit
git add .
git commit -m "Add new feature"
7. Push
git push origin feature/my-feature
8. Open a Pull Request

Create a Pull Request describing your changes.

📜 License

This project is provided for educational and development purposes.

If you plan to distribute or modify this project, check the repository for the applicable license.

⚠️ Disclaimer

This project is not affiliated with, endorsed by, or sponsored by Discord.

Discord is a trademark of Discord Inc.

You are responsible for ensuring that your bot follows Discord's Terms of Service and applicable API rules.

👤 Author
<p align="center"> <b>HauntPsy777</b> </p> <p align="center"> All-In-One Discord Bot </p>
⭐ Support

If you like this project, consider giving the repository a ⭐.

If you find a bug or have an idea for a new feature, feel free to open an issue or submit a pull request.
