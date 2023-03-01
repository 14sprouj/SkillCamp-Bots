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
	name: 'voiceStateUpdate',
	execute(oldState, newState) {
		if (env == "development") return;
		let embed;

		let logChannel = newState.guild.channels.cache.find(ch => ch.name === 'system-logs');
		if (!logChannel) {
			logChannel = newState.guild.channels.cache.find(ch => ch.name === 'system-log');
		}
		if (!logChannel) {
			logChannel = newState.guild.channels.cache.find(ch => ch.name === 'log');
		}
		if (!logChannel) {
			logChannel = newState.guild.channels.cache.find(ch => ch.name === 'logs');
		}
		if (oldState.channelId == newState.channelId) return;

		// if not in voice channel
		if (oldState.channelId == null && newState.channelId != null) {
			embed = new EmbedBuilder()
				.setTitle(`Joined Voice Channel`)
				.setDescription(`<@${newState.member.user.id}> has joined voice channel <#${newState.channelId}>.`)
				.setFooter({ text: `User ID: ${newState.member.user.id} • **Channel ID:** ${newState.channelId}` })
				.setColor('#43B582');
			logChannel.send({ embeds: [embed] });
		} else if (oldState.channelId != null && newState.channelId == null) {
			embed = new EmbedBuilder()
				.setTitle(`Left Voice Channel`)
				.setDescription(`<@${newState.member.user.id}> has left voice channel <#${oldState.channel.id}>.\n**Channel ID:** ${oldState.channel.id} • **User ID:** ${oldState.member.user.id}`)
				.setFooter({ text: `User ID: ${oldState.member.user.id} • **Channel ID:** ${oldState.channel.id}` })
				.setColor('#FF470F');
			logChannel.send({ embeds: [embed] });
		} else if (oldState.channelId != null && newState.channelId != null) {
			embed = new EmbedBuilder()
				.setTitle(`Switched Voice Channel`)
				.setDescription(`<@${newState.member.user.id}> has switched voice channels from <#${oldState.channelId}> -> <#${newState.channelId}>.`)
				.setFooter({ text: `Old Channel ID: ${oldState.channelId} • New Channel ID: ${newState.channelId} • User ID: ${newState.member.user.id}` })
				.setColor('#deed1F');
			logChannel.send({ embeds: [embed] });
		}

		if (newState.guild.id == guildData.CodeCamp.guildId) {
			if (newState.channelId == guildData.CodeCamp.channels.rubberDucksVC.channelID || newState.channelId == guildData.CodeCamp.channels.rubberDucksQuietVC.channelID) {
				// get role
				const role = newState.guild.roles.cache.find(role => role.name === 'Rubber Ducks Attendees');
				// add role
				try {
					newState.member.roles.add(role);
				} catch (error) {
					logger.error(error);
					console.error(error);
				}
			} else {
				// get role
				const role = newState.guild.roles.cache.find(role => role.name === 'Rubber Ducks Attendees');
				// remove role
				try {
					newState.member.roles.remove(role);
				} catch (error) {
					logger.error(error);
					console.error(error);
				}
			}
		} else if (newState.guild.id == guildData.ScriptCamp.guildId) {
			if (newState.channelId == guildData.ScriptCamp.channels.writersRoomVC || newState.channelId == guildData.ScriptCamp.channels.writersRoomQuietVC || newState.channelId == guildData.ScriptCamp.channels.artistsRoomVC) {
				if (oldState.channelId == guildData.ScriptCamp.channels.writersRoomVC || oldState.channelId == guildData.ScriptCamp.channels.writersRoomQuietVC || oldState.channelId == guildData.ScriptCamp.channels.artistsRoomVC) {
					return;
				} else {
					// get channel
					const tChannel = newState.guild.channels.cache.get(guildData.ScriptCamp.channels.writersArtistsRoom.channelID);
					tChannel.send(`${newState.member.user.tag} has joined the Writers Room!`);
				}
			} else if (oldState.channelId == guildData.ScriptCamp.channels.writersRoomVC || oldState.channelId == guildData.ScriptCamp.channels.writersRoomQuietVC || oldState.channelId == guildData.ScriptCamp.channels.artistsRoomVC) {
				const tChannel = newState.guild.channels.cache.get(guildData.ScriptCamp.channels.writersArtistsRoom.channelID);
				tChannel.send(`${newState.member.user.tag} has left the Writers Room!`);
			}
		} else if (newState.guild.id == guildData.ToonCamp.guildId) {
			if (newState.channelId == guildData.ToonCamp.channels.writersRoomVC || newState.channelId == guildData.ToonCamp.channels.writersRoomQuietVC) {
				if (oldState.channelId == guildData.ToonCamp.channels.writersRoomVC || oldState.channelId == guildData.ToonCamp.channels.writersRoomQuietVC) {
					return;
				} else {
					// get channel
					const tChannel = newState.guild.channels.cache.get(guildData.ToonCamp.channels.writersArtistsRoom.channelID);
					tChannel.send(`${newState.member.user.tag} has joined the Artists Room!`);
				}
			} else if (oldState.channelId == guildData.ToonCamp.channels.writersRoomVC || oldState.channelId == guildData.ToonCamp.channels.writersRoomQuietVC) {
				const tChannel = newState.guild.channels.cache.get(guildData.ToonCamp.channels.writersArtistsRoom.channelID);
				tChannel.send(`${newState.member.user.tag} has left the Artists Room!`);
			}
		}
	},
};