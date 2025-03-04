require("dotenv").config();
const client = require("./client/api");
const loadCommands = require("./components/commands");
const loadSlashCommands = require("./components/slashCommands");
const loadEvents = require("./components/events");
const refreshSlashCommands = require("./plugins/slashCommand");
const connectToDatabase = require("./plugins/slashCommand");
const eventHandler = require("./events/eventHandler");
const fs = require("fs");
const path = require("path");
client.commands = new Map();
const checkVCCommand = require('./commands/checker/checkvc.js');
client.commands.set(checkVCCommand.name, checkVCCommand);

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const slashCommands = [];
    const basePath = "./slashCommands"; // Base folder

    // Loop through all directories inside slashCommands
    const folders = fs.readdirSync(basePath);
    for (const folder of folders) {
      const folderPath = path.join(basePath, folder);
      
      // Ensure it's a directory before reading files
      if (fs.statSync(folderPath).isDirectory()) {
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {
          const command = require(`./slashCommands/${folder}/${file}`);
          slashCommands.push(command.data.toJSON());
        }
      }
    }

    // Register commands globally (for all servers)
    await client.application.commands.set(slashCommands);
    console.log("✅ All slash commands registered successfully.");
  } catch (error) {
    console.error("❌ Error registering slash commands:", error);
  }
});

// Load features
loadCommands(client);
loadSlashCommands(client);
loadEvents(client);
eventHandler.execute(client);
refreshSlashCommands(client);
connectToDatabase();

client.login(process.env.TOKEN);

// Error Handling
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
