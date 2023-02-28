require('dotenv').config();
const io = require('@pm2/io');
const env = process.env.environment;
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/commands/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/commands/%DATE% error.log',
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

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('message')
		.setDescription('Send a editable message to a channel with the guild, channel, and message IDs')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('The channel to send the message to')
			.setRequired(true),
		),
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel');
		const message = await channel.send({ content: 'test', fetchReply: true });
		await message.edit({ content: `Guild ID: ${message.guild.id}\nChannel ID: ${message.channel.id}\nMessage ID: ${message.id}\n This message will be edited.` });
	},
};