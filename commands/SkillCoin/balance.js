require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const mysql = require('mysql2');

const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/commands/%DATE% full.log',
	datePattern: 'YYYY-MM-DD HH',
	zippedArchive: true,
	maxSize: '20m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCoin/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/commands/%DATE% error.log',
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
		await interaction.reply({ content: 'Checking your SkillCoin balance', ephemeral: true, fetchReply: true });
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
			connection.query(`SELECT * FROM users WHERE UserID = '${member.id}'`, (error, results, fields) => {
				if (error) {
					console.error(error);
					logger.error(error);
					return;
				}
				if (results.length == 0) {
					connection.query(`INSERT INTO users (discordUserID, discordUsername, discordDiscriminator) VALUES ('${member.id}', '${member.user.username}', '${member.user.discriminator}')`, (error, results, fields) => {
						if (error) {
							console.error(error);
							logger.error(error);
							return;
						}
					});
				}

				if (results.length > 1) {
					console.error(`Multiple users with same ID: ${member.id}`);
					logger.error(`Multiple users with same ID: ${member.id}`);
				}
			});
			// query database
			connection.query("SELECT camp, Balance FROM `balance` WHERE `userID` = '" + interaction.user.id + "'", function (err, result) {
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
					if (row.camp == guildData.ScriptCamp.guildId) {
						array[0] = row.Balance;
					} else if (row.camp == guildData.WordCamp.guildId) {
						array[1] = row.Balance;
					} else if (row.camp == guildData.FilmCamp.guildId) {
						array[2] = row.Balance;
					} else if (row.camp == guildData.CreatorCamp.guildId) {
						array[3] = row.Balance;
					} else if (row.camp == guildData.ToonCamp.guildId) {
						array[4] = row.Balance;
					} else if (row.camp == guildData.LingoCamp.guildId) {
						array[6] = row.Balance;
					} else if (row.camp == guildData.CodeCamp.guildId) {
						array[5] = row.Balance;
					} else if (row.camp == guildData.CampMaster.guildId) {
						array[500] = row.Balance;
					}
				});
				console.log(array);

				console.log(coins);
				const embed = new EmbedBuilder()
					.setTitle('SkillCoin Balance')
					.setColor('#998900')
					.setDescription(`You have ${coins} SkillCoins`)
					.addFields(
						{ name: '<:ScriptCamp:1041136882165219339> ScriptCamp', value: `${array[0]}`, inline: true },
						{ name: "<:WordCamp:1039274617153527839> WordCamp", value: `${array[1]}`, inline: true },
						{ name: "<:FilmCamp:1039275043416453132> FilmCamp", value: `${array[2]}`, inline: true },
						{ name: "<:CreatorCamp:1039274674716160110> CreatorCamp", value: `${array[3]}`, inline: true },
						{ name: "<:ToonCamp:1039274638666117230> ToonCamp", value: `${array[4]}`, inline: true },
						{ name: "<:CodeCamp:1035994387580211290> CodeCamp", value: `${array[5]}`, inline: true },
						{ name: "<:LingoCamp:1039275181824282716> LingoCamp", value: `${array[6]}`, inline: true },
					);
				console.log(embed);
				console.log(embed.fields);
				interaction.editReply({ embeds: [embed] });
			});
		});
	},
};