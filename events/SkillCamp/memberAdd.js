require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/users/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '20m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/users/%DATE% error.log',
	datePattern: 'YYYY-MM-DD',
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

const { guildData } = require('../../data/guildData.json');
const SkillCampGuildIds = guildData.SkillCamps.guildIDs;

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

		console.log(logChannel);

		// send message
		logChannel.send({ embeds: [embed] });

		if (member.user.bot) {
			role = member.guild.roles.cache.find(role => role.name === "Bots");
			member.roles.add(role);
		}

		if (member.guild.id == guildData.SkillCamps.CodeCamp.guildId) {
			console.log("CodeCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Coders");
				member.roles.add(role);
			}
			let welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
			if (!welcomeChannel) {
				welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'general-chat');
			}
			if (!welcomeChannel) {
				welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'coding-chat');
			}
			if (!welcomeChannel) {
				logger.error("Unable to find welcome channel in CodeCamp");
			}

			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Coders");
				member.roles.add(role);
			}

			const welcomeMsg = welcomeChannel.send(`Welcome to CodeCamp, ${member}!`);

			embed = new EmbedBuilder()
				.setTitle('Welcome to CodeCamp!')
				.setDescription(`We are a computer coding community with members from across the world. We recommend you do three things:\n1. Get roles in tag-yourself\n2. Tell us about yourself in introduce-yourself\n3. Get chatting. We can often be found talking in coding-chat. Feel free to make use of all the channels - we like conversations here.`);
			welcomeChannel.send({ embeds: [embed] });

			const statsChannel = member.guild.channels.cache.find(ch => ch.name === 'stats');
			if (!statsChannel) {
				return;
			}
			statsChannel.messages.get(guildData.SkillCamps.CodeCamp.statsMsgs.Users).then(message => {
				message.edit(`**Users:** ${member.guild.members.cache.size}`);
			});
			statsChannel.messages.get(guildData.SkillCamps.CodeCamp.statsMsgs.Members).then(message => {
				message.edit(`**Members:** ${member.guild.members.cache.filter(member => !member.user.bot).size}`);
			});

			try {
				welcomeMsg.react('👋');
			} catch (error) {
				logger.error("Unable to react to welcome message");
			}
		} else if (member.guild.id == guildData.SkillCamps.ScriptCamp.guildId) {
			console.log("ScriptCamp member joined");
			if (!member.user.bot) {
				role = member.guild.roles.cache.find(role => role.name === "Screenwriter");
				member.roles.add(role);
			}
		}
	},
};