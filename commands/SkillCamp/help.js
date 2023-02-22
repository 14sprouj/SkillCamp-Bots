require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');

const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/commands/%DATE% full.log',
	datePattern: 'YYYY-MM-DD HH',
	zippedArchive: true,
	maxSize: '20m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/commands/%DATE% error.log',
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

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { version } = require('../../package.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List all commands or info about a specific command'),
	async execute(interaction) {
		let embed;
		embed = new EmbedBuilder()
			.setTitle('Help')
			.setDescription('Information about the bot')
			.setColor('#0099FF')
			.addFields(
				{ name: 'Version', value: `${version}` },
				{ name: 'Support Server', value: 'https://discord.gg/THvJvJgRBc' },
			);

		await interaction.reply({ embeds: [embed] });
		if (interaction.guild) {
			logger.info(`${interaction.user.id} in #${interaction.channel.name} in Guild ${interaction.guild.name} used the "/help" command.`);
		} else {
			logger.info(`${interaction.user.id} used the "/help" command in a DM.`);
		}
	},
};