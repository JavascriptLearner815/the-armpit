const fs = require('fs'); // Require the file system

const { token, prefix } = require('./config.json'); // Gets data from config

const Discord = require('discord.js'); // Require the discord.js module

const client = new Discord.Client(); // Create a new Discord client

client.commands = new Discord.Collection(); // Creates a collection to store inside

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // Gets all of the command files

for (const file of commandFiles) { // Loops through each command
    const command = require(`./commands/${file}`); // Require the command

    client.commands.set(command.name, command); // Make this command valid
}

const cooldowns = new Discord.Collection(); // Creates a collection to store inside

client.once('ready', () => { // Once the client is ready, run this code
    client.user.setActivity(`${prefix}help`, { type: 'PLAYING' }); // Sets the bot's status
    console.log(`A wild bot has appeared as ${client.user.tag}!`); // Logs to the console
});

client.on('message', message => { // Runs when someone sends a message
    if (message.author.bot || message.webhookID || message.channel.type === 'dm' || !message.guild.me.hasPermission('SEND_MESSAGES') || !message.guild.me.hasPermission('VIEW_CHANNEL')) return;

    if (message.mentions.has(client.user)) { // Runs if someone mentions the bot
        return message.reply(`hello there, my prefix is ${prefix}. Use \`${prefix}help\` for all my commands.`);
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    // Gets the command name from the message

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)); // Gets the command or an alias

    if (!command) return; // Runs if this isn't a valid command

    if (command.args && !args.length) { // Runs if they need to provide arguments
        let message = 'What are you providing idiot';

        if (command.usage) {
            message = `If you were smart you'd use it like this \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(message);
    }

    if (!cooldowns.has(command.name)) { // If there is no cooldown
        cooldowns.set(command.name, new Discord.Collection()); // Create a new cooldown 
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;

    if (timestamps.has(message.author.id)) { // Runs if they have a cooldown
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.channel.send(`You're too tired and must wait ${timeLeft.toFixed(1)} more second(s).`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount); // Deletes the cooldown

    try {
        command.execute(message, args);
    } catch (error) {
        console.error('Error executing command:', error);
        message.reply('an error occurred trying to execute that command. Sucks to be you.');
    }
});

client.on('shardError', error => {
    console.error('The bot connection had an error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Rejected promise:', error);
});

client.on('debug', console.debug);

client.login(token); // Login to Discord with the application's token