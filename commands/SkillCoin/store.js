require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const mysql = require('mysql2');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/commands/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/commands/%DATE% error.log',
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

module.exports = {
	data: new SlashCommandBuilder()
		.setName('store')
		.setDescription('See store'),
	async execute(interaction) {
		let embed;
		logger.info('Store command used by ' + interaction.user.username + ' (' + interaction.user.id + ')');
		// get user id
		await interaction.reply({ content: 'Browsing Store Catalogue', fetchReply: true });
		let storeDesc = ``;

		// connect to database
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
			}
			// get store items
			connection.query('SELECT * FROM `storeItems`', async function (error, result) {
				if (error) {
					logger.error(error);
					await interaction.editReply({ content: 'Error: Unable to retrieve from the store database', ephemeral: true });
					console.error(error);
					return;
				}
				for (let i = 0; i < result.length; i++) {
					storeDesc = storeDesc + `\n\n${result[i].Emoji} **${result[i].ItemName}** - <:SkillCoin:1064637226018947182>${result[i].ItemPriceCoin}\n${result[i].ItemDescription}`;
				}
				embed = new EmbedBuilder()
					.setTitle('SkillCamp Store')
					.setDescription(storeDesc)
					.setColor('#0099ff');
				await interaction.editReply({ embeds: [embed], fetchReply: true });
			});
		});
		//connection.end();
	},
};