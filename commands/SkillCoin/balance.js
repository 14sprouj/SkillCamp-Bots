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

const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, EmbedBuilder, resolveColor } = require('discord.js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();
const { guildData } = require('../../data/guildData.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check your SkillCoin balance'),
	async execute(interaction) {
		logger.info('used /balance command');
		await interaction.reply({ content: 'Checking your SkillCoin balance', fetchReply: true });
		const userid = interaction.user.id;

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
			// query database
			connection.query("SELECT Camp, Balance FROM `Balance` WHERE `UserID` = '" + interaction.user.id + "'", function (err, result) {
				if (err) {
					logger.error(err);
					interaction.editReply({ content: 'Error: Unable to query the database', ephemeral: true });
					console.error('error connecting: ' + err.stack);
					return;
				}
				console.log(result);
				const rows = JSON.parse(JSON.stringify(result));
				console.log(rows);

				let coins = 0;
				let array = [];

				result.forEach(function (row) {
					coins += parseInt(row.Balance);
					if (row.Camp == guildData.ScriptCamp.guildId) {
						array[0] = row.Balance;
					} else if (row.Camp == guildData.WordCamp.guildId) {
						array[1] = row.Balance;
					} else if (row.Camp == guildData.FilmCamp.guildId) {
						array[2] = row.Balance;
					} else if (row.Camp == guildData.CreatorCamp.guildId) {
						array[3] = row.Balance;
					} else if (row.Camp == guildData.ToonCamp.guildId) {
						array[4] = row.Balance;
					} else if (row.Camp == guildData.LingoCamp.guildId) {
						array[6] = row.Balance;
					} else if (row.Camp == guildData.CodeCamp.guildId) {
						array[5] = row.Balance;
					} else if (row.Camp == guildData.CampMaster.guildId) {
						array[500] = row.Balance;
					}
				});

				array.forEach(function (row) {
					if (row == undefined || row == null) {
						array[array.indexOf(row)] = 0;
					}
				});

				console.log(array);

				console.log(coins);
				const embed = new EmbedBuilder()
					.setTitle('SkillCoin Balance')
					.setColor('#998900')
					.setDescription(`You have ${coins} SkillCoins`)
					.addFields(
						{ name: '<:ScriptCamp:1041136882165219339> ScriptCamp', value: `${array[0] | 0}`, inline: true },
						{ name: "<:WordCamp:1039274617153527839> WordCamp", value: `${array[1] | 0}`, inline: true },
						{ name: "<:FilmCamp:1039275043416453132> FilmCamp", value: `${array[2] | 0}`, inline: true },
						{ name: "<:CreatorCamp:1039274674716160110> CreatorCamp", value: `${array[3] | 0}`, inline: true },
						{ name: "<:ToonCamp:1039274638666117230> ToonCamp", value: `${array[4] | 0}`, inline: true },
						{ name: "<:CodeCamp:1035994387580211290> CodeCamp", value: `${array[5] | 0}`, inline: true },
						{ name: "<:LingoCamp:1039275181824282716> LingoCamp", value: `${array[6] | 0}`, inline: true },
					);
				console.log(embed);
				console.log(embed.fields);
				interaction.editReply({ embeds: [embed] });
			});
		});
	},
};