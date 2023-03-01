require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/events/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/events/%DATE% error.log',
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

module.exports = {
	name: 'guildMemberUpdate',
	execute(oldMember, newMember) {
		let embed;

		console.log("Role Member Event");

		let logChannel = newMember.guild.channels.cache.find(ch => ch.name === 'system-logs');
		if (!logChannel) {
			logChannel = newMember.guild.channels.cache.find(ch => ch.name === 'system-log');
		}
		if (!logChannel) {
			logChannel = newMember.guild.channels.cache.find(ch => ch.name === 'log');
		}
		if (!logChannel) {
			logChannel = newMember.guild.channels.cache.find(ch => ch.name === 'logs');
		}

		// if role is added
		if (oldMember.roles.cache.size < newMember.roles.cache.size) {
			console.log("Role Added");
			const roleAdded = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id)).first();
			embed = new EmbedBuilder()
				.setTitle('Role Added')
				.setDescription(`<@${newMember.user.id}> was given the role <@${roleAdded.id}>`)
				.setColor('#0066FF')
				.setTimestamp(new Date());
		} else if (oldMember.roles.cache.size > newMember.roles.cache.size) {
			console.log("Role Removed");
			const roleRemoved = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id)).first();
			embed = new EmbedBuilder()
				.setTitle('Role Removed')
				.setDescription(`<@${newMember.user.id}> had the role <@${roleRemoved.id}> removed`)
				.setColor('#66FF00')
				.setTimestamp(new Date());
		} else {
			return;
		}
		logChannel.send({ embeds: [embed] });
	},
};