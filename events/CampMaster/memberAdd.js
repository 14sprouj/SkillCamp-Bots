require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const mysql = require('mysql2');
const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/users/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/users/%DATE% error.log',
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

const { guildData } = require('../../data/guildData.json');
const SkillCampGuildIds = guildData.guildIDs;
// !TODO convert to mysql2

module.exports = {
	name: 'guildMemberAdd',
	execute(member) {
		if (env == "dev") {
			return;
		}
		// Get guild
		const guild = member.guild;
		const guildId = guild.id;
		const guildName = guild.name;
		const userId = member.user.id;
		// get number of users
		const userCount = member.guild.members.cache.size;
		// get number of members
		const memberCount = member.guild.members.cache.filter(member => !member.user.bot).size;
		// get number of bots
		const botCount = member.guild.members.cache.filter(m => m.user.bot).size;

		let embed, role;
		logger.info(`New member ${member.user.tag} (${member.user.id}) joined the SkillCamp: ${guild.name} server`);
		console.log(`${guildName} member count: ${memberCount}`);

		embed = new EmbedBuilder()
			.setTitle(`Member Joined`)
			.setDescription(`<@${member.user.id}> has joined the server.`)
			.setColor('#32f524');
		let logChannel = member.guild.channels.cache.find(ch => ch.name === 'system-logs');
		if (!logChannel) {
			logChannel = member.guild.channels.cache.find(ch => ch.name === 'system-log');
		}
		if (!logChannel) {
			logChannel = member.guild.channels.cache.find(ch => ch.name === 'log');
		}
		if (!logChannel) {
			logChannel = member.guild.channels.cache.find(ch => ch.name === 'logs');
		}

		// send message
		logChannel.send({ embeds: [embed] });

		if (member.user.bot) {
			role = member.guild.roles.cache.find(role => role.name === "Bots");
			member.roles.add(role);
		}
		const statsChannel = member.guild.channels.cache.find(ch => ch.name === 'stats');
		if (!statsChannel) {
			return;
		}

		if (member.guild.id == guildData.CodeCamp.guildId) {
			console.log("CodeCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Coders");
				member.roles.add(role);
			}

			statsChannel.messages.get(guildData.CodeCamp.statsMsgs.Users).then(message => {
				message.edit(`**Users:** ${member.guild.members.cache.size}`);
			});
			statsChannel.messages.get(guildData.CodeCamp.statsMsgs.Members).then(message => {
				message.edit(`**Members:** ${member.guild.members.cache.filter(member => !member.user.bot).size}`);
			});
		} else if (member.guild.id == guildData.ScriptCamp.guildId) {
			console.log("ScriptCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Screenwriter");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.WordCamp.guildId) {
			console.log("WordCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Camper");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.CampMaster.guildId) {
			console.log("CampMaster member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Camper");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.FilmCamp.guildId) {
			console.log("FilmCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Filmmaker");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.MusicCamp.guildId) {
			console.log("MusicCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Musician");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.ToonCamp.guildId) {
			console.log("ToonCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Animator");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.GameCamp.guildId) {
			console.log("GameCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Gamer");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.ArtCamp.guildId) {
			console.log("ArtCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Artist");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.CreatorCamp.guildId) {
			console.log("CreatorCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Creator");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.DesignCamp.guildId) {
			console.log("DesignCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Designer");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.SkillCamp.guildId) {
			console.log("SkillCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Camper");
				member.roles.add(role);
			}
		} else if (member.guild.id == guildData.LingoCamp.guildId) {
			console.log("LingoCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Camper");
				member.roles.add(role);
			}
		}

		// TODO Connect to database
		// TODO check if user is in database
		// TODO get user data
		// TODO if not, add user to database

		try {
			console.log(`${guildName} member count: ${memberCount}`);
			// open JSON file
			fs.readFile('./data/SkillCamp.json', (err, data) => {
				if (err) throw err;
				const SkillCamp = JSON.parse(data);
				// update member count
				if (member.guild.id == guildData.CodeCamp.guildId) {
					SkillCamp.Discord.CodeCamp.UserCount = userCount;
					SkillCamp.Discord.CodeCamp.MemberCount = memberCount;
					SkillCamp.Discord.CodeCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.ScriptCamp.guildId) {
					SkillCamp.Discord.ScriptCamp.UserCount = userCount;
					SkillCamp.Discord.ScriptCamp.MemberCount = memberCount;
					SkillCamp.Discord.ScriptCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.DesignCamp.guildId) {
					SkillCamp.Discord.DesignCamp.UserCount = userCount;
					SkillCamp.Discord.DesignCamp.MemberCount = memberCount;
					SkillCamp.Discord.DesignCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.WordCamp.guildId) {
					SkillCamp.Discord.WordCamp.UserCount = userCount;
					SkillCamp.Discord.WordCamp.MemberCount = memberCount;
					SkillCamp.Discord.WordCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.CampMaster.guildId) {
					SkillCamp.Discord.CampMaster.UserCount = userCount;
					SkillCamp.Discord.CampMaster.MemberCount = memberCount;
					SkillCamp.Discord.CampMaster.BotCount = botCount;
				} else if (member.guild.id == guildData.FilmCamp.guildId) {
					SkillCamp.Discord.FilmCamp.UserCount = userCount;
					SkillCamp.Discord.FilmCamp.MemberCount = memberCount;
					SkillCamp.Discord.FilmCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.MusicCamp.guildId) {
					SkillCamp.Discord.MusicCamp.UserCount = userCount;
					SkillCamp.Discord.MusicCamp.MemberCount = memberCount;
					SkillCamp.Discord.MusicCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.ToonCamp.guildId) {
					SkillCamp.Discord.ToonCamp.UserCount = userCount;
					SkillCamp.Discord.ToonCamp.MemberCount = memberCount;
					SkillCamp.Discord.ToonCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.GameCamp.guildId) {
					SkillCamp.Discord.GameCamp.UserCount = userCount;
					SkillCamp.Discord.GameCamp.MemberCount = memberCount;
					SkillCamp.Discord.GameCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.ArtCamp.guildId) {
					SkillCamp.Discord.ArtCamp.UserCount = userCount;
					SkillCamp.Discord.ArtCamp.MemberCount = memberCount;
					SkillCamp.Discord.ArtCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.CreatorCamp.guildId) {
					SkillCamp.Discord.CreatorCamp.UserCount = userCount;
					SkillCamp.Discord.CreatorCamp.MemberCount = memberCount;
					SkillCamp.Discord.CreatorCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.SkillCamp.guildId) {
					SkillCamp.Discord.SkillCamp.UserCount = userCount;
					SkillCamp.Discord.SkillCamp.MemberCount = memberCount;
					SkillCamp.Discord.SkillCamp.BotCount = botCount;
				} else if (member.guild.id == guildData.LingoCamp.guildId) {
					SkillCamp.Discord.LingoCamp.UserCount = userCount;
					SkillCamp.Discord.LingoCamp.MemberCount = memberCount;
					SkillCamp.Discord.LingoCamp.BotCount = botCount;
				}


				SkillCamp = JSON.stringify('"SkillCamp": {' + SkillCamp + '}', null, 2);

				// save to JSON file
				fs.writeFile(`./data/SkillCamp.json`, JSON.stringify(SkillCamp), (err) => {
					if (err) throw err;
					console.log(`Updated ${guildName} member count to ${memberCount}`);
					logger.info(`Updated ${guildName} member count to ${memberCount}`);
				});
			});
		} catch (error) {
			logger.error("Unable to update member count in /data/SkillCamp.json file");
			console.error("Unable to update member count in /data/SkillCamp.json file");
		}
	},
};