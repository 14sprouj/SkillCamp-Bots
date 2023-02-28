require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const mysql = require('mysql2');
const fs = require('fs');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/events/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/events/%DATE% error.log',
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
const { guildData } = require('../../data/guildData.json');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(guildData.guildIDs);
		const serverCount = parseInt(client.guilds.cache.size) - 1;
		if (env === 'prod') {
			client.user.setActivity(`this server and ${serverCount} others`, { type: ActivityType.Watching });
			client.user.setStatus('online');
		} else if (env === 'dev') {
			client.user.setActivity(`this server and ${serverCount} others`, { type: ActivityType.Watching });
			client.user.setStatus('dnd');
		} else {
			client.user.setActivity(`this server and ${serverCount} others`, { type: ActivityType.Watching });
			client.user.setStatus('idle');
		}
		logger.info('Bot connected!');
		console.log('Bot ready!');

		const connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT,
			database: process.env.DB_NAME,
		});

		setInterval(() => {
			guildData.guildIDs.forEach(guildID => {
				const guild = client.guilds.cache.get(guildID);
				if (guild) {
					console.log("Checking for members in " + guild.name + "...");
					// get all members in the guild
					guild.members.fetch().then(members => {
						// connect to the database
						connection.connect(function (err) {
							if (err) {
								logger.error(err);
								console.error('error connecting: ' + err.stack);
								return;
							}
							members.forEach(member => {
								console.log(`[${guild.name}] Found ${member.user.tag}`);

								connection.query(`SELECT * FROM users WHERE discordUserID = '${member.user.id}'`, (error, results, fields) => {
									if (error) {
										console.error(error);
										logger.error(error);
										return;
									}
									let bot, nitro, booster = 0;
									if (member.user.bot) bot = 1;
									if (member.premiumSince) {
										booster = 1;
										const bRole = guild.roles.cache.find(role => role.name === 'Server Booster');
										member.roles.add(bRole);
									} else {
										const bRole = guild.roles.cache.find(role => role.name === 'Server Booster');
										member.roles.remove(bRole);
									}
									if (member.user.avatar.startsWith('a_')) nitro = 1;

									sql = `INSERT INTO users (discordUserID, discordUsername, discordDiscriminator, Bot, Booster) VALUES ('${member.user.id}', '${member.user.username}', '${member.user.discriminator}', ${bot}, ${booster})'`;
									if (results.length == 0) {
										connection.query(sql, (error, results, fields) => {
											if (error) {
												console.error(error);
												logger.error(error);
												return;
											}
										});
									} else if (results.length > 1) {
										console.error(`Multiple users with same ID: ${member.user.id}`);
										logger.error(`Multiple users with same ID: ${member.user.id}`);
									} else {
										results.forEach(result => {
											if (result.discordUsername != member.user.username) {
												connection.query(`UPDATE users SET discordUsername = '${member.user.username}' WHERE discordUserID = '${member.user.id}'`, (error, results, fields) => {
													if (error) {
														console.error(error);
														logger.error(error);
														return;
													}
												});
											}
											if (result.discordDiscriminator != member.user.discriminator) {
												connection.query(`UPDATE users SET discordDiscriminator = '${member.user.discriminator}' WHERE discordUserID = '${member.user.id}'`, (error, results, fields) => {
													if (error) {
														console.error(error);
														logger.error(error);
														return;
													}
												});
											}
											if (result.Bot != bot) {
												connection.query(`UPDATE users SET Bot = ${bot} WHERE discordUserID = '${member.user.id}'`, (error, results, fields) => {
													if (error) {
														console.error(error);
														logger.error(error);
														return;
													}
												});
											}
											if (result.Booster != booster) {
												connection.query(`UPDATE users SET Booster = ${booster} WHERE discordUserID = '${member.user.id}'`, (error, results, fields) => {
													if (error) {
														console.error(error);
														logger.error(error);
														return;
													}
												});
											}
										});
									}
								});
							});
						});
					});
				}
			});
		}, 1000 * 60 * 10);
	},
};