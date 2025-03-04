const { REST, Routes } = require('discord.js');
const path = require('path');
const fs = require('fs').promises;
const Table = require('cli-table3');
const colors = require('colors');
const mongoose = require('mongoose');
const chokidar = require('chokidar');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB);
        return true;
    } catch (error) {
        console.error('🍃: Error connecting to MongoDB:', error);
        return false;
    }
};

module.exports = async (client = {}) => {
    const botTag = client.user?.tag || 'HΣAD 好';
    const botAvatar = client.user?.avatarURL() || 'No Avatar';
    const guildCount = client.guilds?.cache.size || 0;
    const userCount = client.users?.cache.size || 0;

    const table = new Table({
        chars: {
            'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
            'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
            'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
            'right': '║', 'right-mid': '╢', 'middle': '│'
        },
        style: {
            head: ['cyan'],
            border: ['gray'],
        }
    });

    table.push(
        [{ colSpan: 3, content: colors.rainbow('╔═══════════ BOT INFORMATION ═══════════╗'), hAlign: 'center' }],
        [colors.yellow('Bot Tag'), colors.green(botTag), colors.magenta('Avatar URL')],
        [colors.yellow('Guilds'), colors.green(guildCount.toString()), colors.magenta(botAvatar)],
        [colors.yellow('Users'), colors.green(userCount.toString()), ''],
        [{ colSpan: 3, content: colors.rainbow('╠═════════ SYSTEM INFORMATION ══════════╣'), hAlign: 'center' }],
    );

    const dbConnected = await connectToDatabase();
    table.push([
        colors.yellow('MongoDB'),
        dbConnected ? colors.green('✓ Connected') : colors.red('✗ Disconnected'),
        colors.gray(`URL: ${process.env.MONGO_DB?.split('@')[1] || 'N/A'}`)
    ]);

    const { slashcmd } = require('../controller/authority');
    
    if (!slashcmd) {
        table.push([colors.yellow('Slash Commands'), colors.red('✗ Disabled'), '']);
        console.log(table.toString());
        return;
    }

    const slashCommands = client.slashCommands || new Map();
    const slashCommandsArray = [];
    const organizedCommands = [];

    const loadCommands = async () => {
        try {
            slashCommands.clear();
            slashCommandsArray.length = 0;
            organizedCommands.length = 0;
    
            const commandFolders = await fs.readdir(path.join(__dirname, '../slashCommands'));
            const loadedNames = new Set();
    
            for (const folder of commandFolders) {
                const folderPath = path.join(__dirname, '../slashCommands', folder);
                const folderStat = await fs.stat(folderPath);
    
                if (!folderStat.isDirectory()) continue;
    
                const commandFiles = (await fs.readdir(folderPath)).filter(file => file.endsWith('.js'));
    
                if (commandFiles.length === 0) {
                    console.log(colors.yellow(`Empty folder: ${folder}`));
                    continue;
                }
    
                for (const file of commandFiles) {
                    const commandPath = path.join(folderPath, file);
                    let command;
    
                    try {
                        delete require.cache[require.resolve(commandPath)];
                        command = require(commandPath);
                    } catch (error) {
                        continue;
                    }
    
                    if (!command.data) {
                        continue;
                    }
    
                    // Log command data for debugging
                    
                    // Validate command name and description lengths
                    const nameLength = command.data.name.length;
                    const descriptionLength = command.data.description.length;
    
                    if (nameLength > 32) {
                        continue;
                    }
    
                    if (descriptionLength > 100) {
                        continue;
                    }
    
                    if (loadedNames.has(command.data.name)) {
                        continue;
                    }
    
                    loadedNames.add(command.data.name);
                    slashCommands.set(command.data.name, command);
                    slashCommandsArray.push(command.data.toJSON());
                    organizedCommands.push({ folder, file, command: command.data.name });
                }
            }
    
            // Initialize the REST API for discord.js and update global commands
            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    
            // Register or update all global commands
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: slashCommandsArray }
            );
    
            console.log(colors.green('Slash commands reloaded successfully.'));
            updateTable();
        } catch (error) {
        }
    };
    

    const updateTable = () => {
        table.splice(6)
        table.push([
            colors.yellow('Slash Commands'),
            colors.green(`✓ Loaded (${organizedCommands.length})`),
            colors.gray('Use /help for command list')
        ]);

        table.push([{ colSpan: 3, content: colors.rainbow('╠═══════════ COMMAND LIST ═══════════╣'), hAlign: 'center' }]);

        organizedCommands.forEach(({ folder, file, command }) => {
            table.push([colors.yellow(folder), colors.green(command), colors.gray(file)]);
        });

        table.push([{ colSpan: 3, content: colors.rainbow('╚═════════════════════════════════════╝'), hAlign: 'center' }]);

        console.clear();
        console.log(table.toString());
    };

    await loadCommands();

    if (client && typeof client === 'object') {
        client.slashCommands = slashCommands;
    }

    const watcher = chokidar.watch(path.join(__dirname, '../slashCommands'), {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    watcher
        .on('add', path => {
            loadCommands();
        })
        .on('change', path => {
            loadCommands();
        })
        .on('unlink', path => {
            loadCommands();
        });

    return slashCommands;
};
