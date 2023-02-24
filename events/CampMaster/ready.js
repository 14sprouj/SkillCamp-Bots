require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const fs = require('fs');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/events/%DATE% full.log',
	datePattern: 'YYYY-MM-DD HH',
	zippedArchive: true,
	maxSize: '20m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/events/%DATE% error.log',
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

const { ActivityType } = require('discord.js');
const { parse } = require('path');
const { guildData } = require('../../data/guildData.json');
const { SkillCampGuildIds } = guildData.guildIDs;

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
			client.user.setStatus('dnd');
		}
		logger.info('Bot connected!');
		console.log('Bot ready!');

		setInterval(() => {
			SkillCampGuildIds.forEach(guildID => {
				const guild = client.guilds.cache.get(guildID);
				if (guild) {
					// get all members in the guild
					guild.members.fetch().then(members => {
						console.log(`[${guild.name}] Updating member roles...`);
						members.forEach(member => {
							//console.log(`[${guild.name}] Found ${member.user.tag}`);

							// TODO connect to the database

							// TODO check if user is in the database

							// if not, add them
						});
					});
				}
			});
		}, 1000 * 60 * 10);

		setInterval(() => {
			SkillCampGuildIds.forEach(async guildID => {
				const guild = client.guilds.cache.get(guildID);
				if (!guild) return;
				const boostedMembers = guild.members.cache.filter(member => member.premiumSince);
				const bRole = guild.roles.cache.find(role => role.name === 'Server Booster');
				// add the role to all boosted members
				boostedMembers.forEach(member => {
					member.roles.add(bRole);
				});
			});
		}, 1000 * 60 * 10);
	},
};