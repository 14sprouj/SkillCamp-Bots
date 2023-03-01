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

const transport3 = new winston.transports.Console({
	level: 'warn'
});

const transport4 = new winston.transports.DailyRotateFile({
	level: 'info',
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
		transport3,
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
		transport4,
	],
});


const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

const { guildData } = require('../../data/guildData.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addcoins')
		.setDescription('Give coins to a user (Admin Only)')
		.addSubcommand(subcommand => subcommand
			.setName('user')
			.setDescription('Give coins to a user')
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
		)
		.addSubcommand(subcommand => subcommand
			.setName('vc')
			.setDescription('BETA: Give coins to everyone in a VC')
			.addChannelOption(option => option
				.setName('channel')
				.setDescription('The VC to give coins to')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildVoice)
				.addChannelTypes(ChannelType.GuildStageVoice),
			)
			.addIntegerOption(option => option
				.setName('amount')
				.setDescription('The amount of coins to give')
				.setRequired(true),
			),
		).addSubcommand(subcommand => subcommand
			.setName('role')
			.setDescription('BETA: Give coins to a role')
			.addRoleOption(option => option
				.setName('role')
				.setDescription('The role to give coins to')
				.setRequired(true),
			)
			.addIntegerOption(option => option
				.setName('amount')
				.setDescription('The amount of coins to give')
				.setRequired(true),
			),
		),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		console.log(focusedValue);
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
			let sql;
			if (focusedValue == "add") sql = 'SELECT CoinLogReasonID, Reason FROM `coinLogReasons` WHERE ShowAdd = 1';
			// query database
			connection.query(sql, function (err, result) {
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
		connection.end();
	},
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const coins = interaction.options.getInteger('amount');
		const giver = interaction.user.id;
		const camp = interaction.guild.id;

		// TODO Add embeds for each subcommand
		let embed;

		// connect to the database
		const connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT,
			database: process.env.DB_NAME,
		});

		if (subcommand === 'user') {
			const userid = interaction.options.getUser('user').id;
			logger.info('${userid} used /addmoney command');
			await interaction.deferReply({ ephemeral: true, fetchReply: true });
			await interaction.editReply({ content: `Adding ${coins} coins to <@${userid}>'s balance`, ephemeral: true, fetchReply: true });

			connection.connect(function (err) {
				if (err) {
					logger.error(err);
					interaction.editReply({ content: 'Error: Unable to connect to the database', ephemeral: true });
					console.error('Error connecting: ' + err.stack);
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
				connection.query("INSERT INTO `coinLog` (`UserID`, `Coins`, `Camp`, `SenderID`, `Type`, `Reason`) VALUES ('" + userid + "', '" + coins + "', '" + interaction.guild.id + "', '" + giver + "', 1, 1)", function (err, result) {
					if (err) {
						logger.error(err);
						interaction.editReply({ content: 'Error: Unable to add coins', ephemeral: true });
						console.error('error connecting: ' + err.stack);
						return;
					}

					if (coins > 0) {
						interaction.editReply({ content: `Gave <@${userid}> <:SkillCoin:1064637226018947182>${coins}`, ephemeral: false, fetchReply: true });
						coinLogger.info(`${giver} gave ${userid} ${coins} coins in ${camp} using /add user command`);
					} else if (coins < 0) {
						interaction.editReply({ content: `Took <:SkillCoin:1064637226018947182>${coins} from <@${userid}>`, ephemeral: false, fetchReply: true });
						coinLogger.info(`${giver} took ${coins} coins from ${userid} in ${camp} using /add user command`);
					} else {
						interaction.editReply({ content: `No <:SkillCoin:1064637226018947182> were added or removed from <@${userid}>`, ephemeral: false, fetchReply: true });
					}
				});
			});
		} else if (subcommand === 'role') {
			const role = interaction.options.getRole('role');
			const roleid = role.id;

			const roleHolders = interaction.guild.members.cache.filter(member => member.roles.cache.has(roleid));
			roleHolders.forEach(async (member) => {
				const userid = member.id;
				connection.connect(function (err) {
					if (err) {
						logger.error(err);
						interaction.editReply({ content: 'Error: Unable to connect to the database', ephemeral: true });
						console.error('Error connecting: ' + err.stack);
						return;
					}
					connection.query(`SELECT * FROM users WHERE discordUserID = '${userid}'`, (error, results, fields) => {
						if (error) {
							console.error(error);
							logger.error(error);
							return;
						}
						if (results.length == 0) {
							connection.query(`INSERT INTO users (discordUserID, discordUsername, discordDiscriminator) VALUES ('${userid}', '${member.user.username}', '${member.user.discriminator}')`, (error, results, fields) => {
								if (error) {
									console.error(error);
									logger.error(error);
									return;
								}
							});
						}

						if (results.length > 1) {
							console.error(`Multiple users with same ID: ${member.user.id}`);
							logger.error(`Multiple users with same ID: ${member.user.id}`);
						}
					});
					// query database
					connection.query("INSERT INTO `coinLog` (`UserID`, `Coins`, `Camp`, `SenderID`, `Type`, `Reason`) VALUES ('" + userid + "', '" + coins + "', '" + interaction.guild.id + "', '" + giver + "', 1, 1)", function (err, result) {
						if (err) {
							logger.error(err);
							interaction.editReply({ content: 'Error: Unable to add coins', ephemeral: true });
							console.error('error connecting: ' + err.stack);
							return;
						}

						if (coins > 0) {
							interaction.editReply({ content: `Gave <@${userid}> ${coins} coins`, ephemeral: false, fetchReply: true });
							coinLogger.info(`${giver} gave ${userid} ${coins} coins in ${camp} using /add user command`);
						} else if (coins < 0) {
							interaction.editReply({ content: `Took ${coins} coins from <@${userid}>`, ephemeral: false, fetchReply: true });
							coinLogger.info(`${giver} took ${coins} coins from ${userid} in ${camp} using /add user command`);
						} else {
							interaction.editReply({ content: `No coins were added or removed from <@${userid}>`, ephemeral: false, fetchReply: true });
						}
					});
				});
			});
		} else if (subcommand === 'vc') {
			// PROD Remove this
			interaction.reply({ content: 'This command is currently being built and is non-functional', ephemeral: true });
			return;

			// TODO Add vc support
			// for bootcampers
		}
	},
};