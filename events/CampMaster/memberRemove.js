require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const fs = require('node:fs');

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

const { EmbedBuilder } = require('discord.js');
const { guildData } = require('../../data/guildData.json');
const SkillCampGuildIds = guildData.guildIDs;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();

module.exports = {
	name: 'guildMemberRemove',
	execute(member) {
		if (env == "dev") return;
		// Get guild
		const guild = member.guild;
		const guildId = guild.id;
		const guildName = guild.name;
		const userId = member.user.id;

		let embed;
		// get number of members
		const memberCount = member.guild.members.cache.filter(member => !member.user.bot).size;
		logger.info(`Member ${member.user.tag} (${member.user.id}) left the SkillCamp: ${guild.name} server`);
		console.log(`${guildName} member count: ${memberCount}`);

		embed = new EmbedBuilder()
			.setTitle(`Member Left`)
			.setDescription(`${member.user.tag} (${member.user.id}) has left the server.`)
			.setColor('#e24444');

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

		const banList = member.guild.fetchBans();
		const kickList = member.guild.fetchKicks();

		const bannedUser = banList.find(user => user.id == member.user.id);
		const kickedUser = kickList.find(user => user.id == member.user.id);

		//if member was kicked
		if (kickedUser) {
			embed.setName(`Member Kicked`);
			embed.setDescription(`${member.user.tag} (${member.user.id}) has been kicked from the server.`);
			embed.addFields(
				{ name: 'Reason', value: bannedUser.reason },
				{ name: 'Kicked By', value: bannedUser.bannedBy },
			);
			embed.setColor('#f73636');
		}

		//if member was banned
		if (bannedUser) {
			embed.setName(`Member Banned`);
			embed.setDescription(`${member.user.tag} (${member.user.id}) has been banned from the server.`);
			embed.addFields(
				{ name: 'Reason', value: bannedUser.reason },
				{ name: 'Banned By', value: bannedUser.bannedBy },
			);
			embed.setColor('#d60505');
		}

		try {
			// open JSON file
			fs.readFile('./data/SkillCamp.json', (err, data) => {
				if (err) throw err;
				const SkillCamp = JSON.parse(data);
				// update member count
				if (guildName == "CodeCamp") {
					SkillCamp.Discord.CodeCamp.MemberCount = memberCount;
					const statsChannel = member.guild.channels.cache.find(ch => ch.name === 'stats');
					if (!statsChannel) {
						return;
					}
					statsChannel.messages.get(guildData.CodeCamp.statsMsgs.Users).then(message => {
						message.edit(`**Users:** ${member.guild.members.cache.size}`);
					});
					statsChannel.messages.get(guildData.CodeCamp.statsMsgs.Members).then(message => {
						message.edit(`**Members:** ${member.guild.members.cache.filter(member => !member.user.bot).size}`);
					});
				} else if (guildName == "ScriptCamp") {
					SkillCamp.Discord.ScriptCamp.MemberCount = memberCount;
				} else if (guildName == "DesignCamp") {
					SkillCamp.Discord.DesignCamp.MemberCount = memberCount;
				} else if (guildName == "WordCamp") {
					SkillCamp.Discord.WordCamp.MemberCount = memberCount;
				} else if (guildName == "CampMaster") {
					SkillCamp.Discord.CampMaster.MemberCount = memberCount;
				}

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

		logChannel.send(embed);
	},
};