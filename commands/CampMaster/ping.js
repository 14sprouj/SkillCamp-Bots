require('dotenv').config();
const io = require('@pm2/io');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/commands/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/CampMaster/' + new Date().getFullYear() + '/commands/%DATE% error.log',
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

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with the ping')
		.setDMPermission(true)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
	async execute(interaction) {
		const sent = await interaction.reply({ content: `Testing Latency`, fetchReply: true });
		interaction.editReply(`Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
		// if message is sent in a guild, log it
		if (interaction.guild) {
			logger.info(`${interaction.user.id} in #${interaction.channel.name} in Guild ${interaction.guild.name} used the "/ping" command.`);
		} else {
			logger.info(`${interaction.user.id} used the "/ping" command in a DM.`);
		}
	},
};