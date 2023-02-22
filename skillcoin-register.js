require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/%DATE% full.log',
	datePattern: 'YYYY-MM-DD HH',
	zippedArchive: true,
	maxSize: '20m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/%DATE% error.log',
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
const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const rest = new REST({ version: '10' }).setToken(process.env.SkillCoinToken);
let i, commands, commandsPath, commandFiles, file, command, filePath, filePaths;

logger.info('Starting skillcoin-register.js');
console.log('Starting skillcoin-register.js');

commands = [];
commandsPath = path.join(__dirname, './commands/SkillCoin');
commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('._'));

for (file of commandFiles) {
	command = require(`./commands/SkillCoin/${file}`);
	commands.push(command.data.toJSON());
}

console.log("Global commands:");
console.log(commands);
// for global commands
rest.put(Routes.applicationCommands(process.env.SkillCoinClientId), { body: commands })
	.then(() => logger.info('Successfully registered ' + commands.length + ' global commands.'))
	.catch(logger.error);

console.log("Done");