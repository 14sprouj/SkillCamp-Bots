require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/%DATE% error.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
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
const rest = new REST({ version: '10' }).setToken(process.env.SkillCampToken);

logger.info('Starting clear.js');
console.log('Starting clear.js');

console.log("CampMaster commands:");
// for global commands
rest.put(Routes.applicationCommands(process.env.CampMasterClientId), { body: [] })
	.then(() => logger.info('Successfully deleted CampMaster commands.'))
	.catch(logger.error);

console.log("SkillCamp commands:");
// for global commands
rest.put(Routes.applicationCommands(process.env.SkillCampClientId), { body: [] })
	.then(() => logger.info('Successfully deleted SkillCamp global commands.'))
	.catch(logger.error);

console.log("SkillCoin commands:");
// for global commands
rest.put(Routes.applicationCommands(process.env.SkillCoinClientId), { body: [] })
	.then(() => logger.info('Successfully deleted SkillCoin global commands.'))
	.catch(logger.error);

console.log("Done");