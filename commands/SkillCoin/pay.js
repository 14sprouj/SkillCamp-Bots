require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const mysql = require('mysql2');

const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/%DATE% error.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport3 = new winston.transports.DailyRotateFile({
	level: '',
	filename: 'logs/SkillCoin/Transactions/%DATE%.log',
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

const coinLogger = winston.createLogger({
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
		transport3,
	],
});

const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const formatJsonFiles = require('format-json-files');
const { guildData } = require('../../data/guildData.json');
const { listeners } = require('node:process');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
let i;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pay')
		.setDescription('Give coins to a user')
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to give coins to')
			.setRequired(true),
		)
		.addIntegerOption(option => option
			.setName('amount')
			.setDescription('The amount of coins to give')
			.setMinValue(1)
			.setRequired(true),
		)
		.addStringOption(option => option
			.setName('reason')
			.setDescription('The reason for giving coins')
			.setRequired(true)
			.setAutocomplete(true),
		),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		let choices;
		choices = [];

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
				console.error('Error connecting: ' + err.stack);
				return;
			}
			// query database
			connection.query("SELECT CoinLogReasonID, Reason FROM `coinLogReasons` WHERE ShowPay = 1", function (err, result) {
				if (err) throw err;

				// for each row in the result
				result.forEach(row => {
					choices.push({ name: row.Reason, value: row.CoinLogReasonID });
				});

				console.log(choices);
				const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));
				interaction.respond(
					filtered.map(choice => ({
						name: choice.name,
						value: choice.value,
					})),
				);
			});
		});
	},
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const userid = interaction.options.getUser('user').id;
		const coins = interaction.options.getInteger('amount');
		const reason = interaction.options.getString('reason');
		const giver = interaction.user.id;
		const camp = interaction.guild.id;
		let embed;
		logger.info('${userid} used /pay command');
		await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await interaction.editReply({ content: `Giving <@${userid}> ${coins} coins for ${reason}`, ephemeral: false, fetchReply: true });

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
				}

				if (results.length > 1) {
					console.error(`Multiple users with same ID: ${interaction.user.id}`);
					logger.error(`Multiple users with same ID: ${interaction.user.id}`);
				}
			});
			connection.query(`SELECT * FROM users WHERE discordUserID = '${userid}'`, (error, results, fields) => {
				if (error) {
					console.error(error);
					logger.error(error);
					return;
				}
				if (results.length == 0) {
					connection.query(`INSERT INTO users (discordUserID, discordUsername, discordDiscriminator) VALUES ('${user.id}', '${user.username}', '${user.discriminator}')`, (error, results, fields) => {
						if (error) {
							console.error(error);
							logger.error(error);
							return;
						}
					});
				}

				if (results.length > 1) {
					console.error(`Multiple users with same ID: ${userid}`);
					logger.error(`Multiple users with same ID: ${userid}`);
				}
			});
			// query database
			connection.query("SELECT SUM(Coins) AS Balance FROM `coinlog` WHERE `UserID` = '" + interaction.user.id + "'", function (err, result) {
				if (err) throw err;

				if (result[0].Balance < coins) {
					interaction.editReply({ content: `You don't have enough coins to give!`, ephemeral: true, fetchReply: true });
					return;
				}
			});

			connection.query("INSERT INTO `coinLog` (`UserID`, `Coins`, `Camp`, `SenderID`, `Reason`, `Type`) VALUES ('" + userid + "', '" + coins + "', '" + camp + "', '" + giver + "', '" + reason + "', 3), ('" + userid + "', '-" + coins + "', '" + camp + "', '" + giver + "', 2, 3);", function (err, result) {
				if (err) {
					logger.error(err);
					interaction.editReply({ content: 'Error: Unable to complete transaction', ephemeral: true });
					console.error('Error connecting: ' + err.stack);
					return;
				}

				interaction.editReply({ content: `Gave <@${userid}> ${coins} coins for ${reason}`, ephemeral: false, fetchReply: true });
				coinLogger.info(`${giver} gave ${userid} ${coins} coins for ${reason} in ${camp} using /pay command`);
			});
		});
	},
};