require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/%DATE% full.log',
	datePattern: 'YYYY-MM-DD HH',
	zippedArchive: true,
	maxSize: '20m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/%DATE% error.log',
	datePattern: 'YYYY-MM-DD HH',
	zippedArchive: true,
	maxSize: '20m',
});

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json(),
	),
	transports: [
		transport1,
		transport2,
	],
});

const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, Routes, EmbedBuilder, Partials, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const formatJsonFiles = require('format-json-files');
const { guildData } = require('./data/guildData.json');
const { listeners } = require('node:process');

let i;

logger.info('Starting up...');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
	],
	//partials: [
	////	Partials.User,
	//	Partials.Channel,
	//],
	allowedMentions: { parse: ['users', 'roles'] },
});

client.commands = new Collection();
let commandsPath, commandFiles, command, filePath, commandName, file;

commandsPath = path.join(__dirname, 'commands/CampMaster');
commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('._'));

i = 0;
for (file of commandFiles) {
	filePath = path.join(commandsPath, file);
	command = require(filePath);

	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		logger.error(`The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
	//logger.info(`Loaded BW command: ${command.data.name}`);
	i++;
}

// EVENTS
let eventsPath = path.join(__dirname, 'events/CampMaster');
let eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') && !file.startsWith('._'));

i = 0;
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	//logger.info(`Loaded event file: ${event.name}`);
	i++;
}

if (env == "dev") {
	eventsPath = path.join(__dirname, 'events/CampMaster/beta');
	eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') && !file.startsWith('._'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
		//logger.info(`Loaded beta event file: ${event.name}`);
		i++;
	}
}
logger.info(`Loaded ${i} event files`);

// when bot stops running
process.on('SIGINT', () => {
	logger.info('Shutting down...');
	console.log('Shutting down...');
	client.destroy();
	process.exit();
});

client.on('interactionCreate', async interaction => {
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			logger.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			logger.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} else if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			logger.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
			logger.error(error);
		}
	} else if (interaction.isUserContextMenuCommand()) {
		logger.info(`User context menu command: ${interaction.commandName}`);
		console.log(interaction);

		const user = interaction.targetUser;
		const command = interaction.client.commands.get(interaction.commandName);
	}
});

setInterval(() => {
	const d = new Date();
	const hour = d.getHours();
	const minute = d.getMinutes();
	const second = d.getSeconds();
	formatJsonFiles('data');
}, 1000 * 60 * 60 * 5); // Every 5 hours


client.login(String(process.env.CampMasterToken));