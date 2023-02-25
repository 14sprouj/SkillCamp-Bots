require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const mysql = require('mysql2');

const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/%DATE% full.log',
	datePattern: 'YYYY-MM-DD HH',
	zippedArchive: true,
	maxSize: '20m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/%DATE% error.log',
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

const { guildData } = require('../../data/guildData.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addcoins')
		.setDescription('Give coins to a user (Admin Only)')
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to give coins to')
			.setRequired(true),
		)
		.addIntegerOption(option => option
			.setName('amount')
			.setDescription('The amount of coins to give')
			.setRequired(true),
		),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const choices = [''];
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		const userid = interaction.options.getUser('user').id;
		const coins = interaction.options.getInteger('amount');
		const giver = interaction.user.id;
		const camp = interaction.guild.id;
		let embed;
		logger.info('${userid} used /addmoney command');
		await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await interaction.editReply({ content: `Adding ${coins} coins to <@${userid}>'s balance`, ephemeral: true, fetchReply: true });

		// connect to the database
		const connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT,
			database: process.env.DB_NAME,
		});

		connection.connect(function (err) {
			if (err) {
				logger.error(err);
				interaction.editReply({ content: 'Error: Unable to connect to the database', ephemeral: true });
				console.error('error connecting: ' + err.stack);
				return;
			}
			// query database
			connection.query("INSERT INTO `coinlog` (`userID`, `coins`, `camp`, `senderID`, `reason`) VALUES ('" + userid + "', '" + coins + "', '" + interaction.guild.id + "', '" + giver + "', 1)", function (err, result) {
				if (err) {
					logger.error(err);
					interaction.editReply({ content: 'Error: Unable to add coins', ephemeral: true });
					console.error('error connecting: ' + err.stack);
					return;
				}
				console.log("1 record inserted");
				interaction.editReply({ content: `Gave <@${userid}> ${coins} coins`, ephemeral: true, fetchReply: true });
			});
		});
	},
};