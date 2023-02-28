require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const fs = require('fs');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/events/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/events/%DATE% error.log',
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

const { ActivityType } = require('discord.js');
const { parse } = require('path');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		const serverCount = parseInt(client.guilds.cache.size) - 1;
		if (env === 'prod') {
			client.user.setActivity(`this server and ${serverCount} others`, { type: ActivityType.Watching });
			client.user.setStatus('online');
		} else {
			client.user.setActivity(`this server and ${serverCount} others`, { type: ActivityType.Watching });
			client.user.setStatus('idle');
		}
		logger.info('Bot connected!');
		console.log('Bot ready!');
	},
};