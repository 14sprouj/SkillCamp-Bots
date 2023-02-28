require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');

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

const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('qotd')
		.setDescription('Set up the QOTD Queue')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator || PermissionFlagsBits.ManageEvents || PermissionFlagsBits.ManageGuild || PermissionFlagsBits.ManageMessages || PermissionFlagsBits.ManageRoles || PermissionFlagsBits.ManageThreads || PermissionFlagsBits.ManageWebhooks)
		.addSubcommand(subcommand => subcommand
			.setName('add')
			.setDescription('Add a question to the QOTD Queue')
			.addStringOption(option => option
				.setName('question')
				.setDescription('The question you want to add to the QOTD Queue')
				.setRequired(true),
			)
			.addStringOption(option => option
				.setName('image')
				.setDescription('The image you want to add to the QOTD Queue'),
			),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

	},
};