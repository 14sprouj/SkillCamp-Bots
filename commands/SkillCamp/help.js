require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const mysql = require('mysql2');

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
				{ name: 'Version', value: `${version}`, inline: true },
				{ name: 'Environment', value: `${env}`, inline: true },
				{ name: 'Support Server', value: 'https://discord.gg/THvJvJgRBc' },
			);

		await interaction.reply({ embeds: [embed] });
		if (interaction.guild) {
			logger.info(`${interaction.user.id} in #${interaction.channel.name} in Guild ${interaction.guild.name} used the "/help" command.`);
		} else {
			logger.info(`${interaction.user.id} used the "/help" command in a DM.`);
		}
		// connect to the database
		const connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: process.env.DB_PORT,
		});
		connection.connect(function (err) {
			if (err) {
				logger.error(err);
				interaction.editReply({ content: 'Error: Unable to connect to the database', ephemeral: true });
				console.error('error connecting: ' + err.stack);
				return;
			}
			connection.query(`SELECT * FROM users WHERE discordUserID = '${interaction.user.id}'`, (error, results, fields) => {
				if (error) {
					console.error(error);
					logger.error(error);
					return;
				}
				if (results.length == 0) {
					connection.query(`INSERT INTO users (discordUserID, discordUsername, discordDiscriminator) VALUES ('${interaction.user.id}', '${interaction.user.username}', '${interaction.user.discriminator}')`, (error, results, fields) => {
						if (error) {
							console.error(error);
							logger.error(error);
							return;
						}
					});
				} else if (results.length > 1) {
					console.error(`Multiple users with same ID: ${member.id}`);
					logger.error(`Multiple users with same ID: ${member.id}`);
				}
			});
		});
	},
};