require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const mysql = require('mysql2');
const fs = require('fs');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/%DATE% full.log',
	datePattern: 'YYYY-MM-DD HH',
	//zippedArchive: true,
	maxSize: '20m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/' + (parseInt(new Date().getMonth()) + 1) + '/' + new Date().getDate() + '/%DATE% error.log',
	datePattern: 'YYYY-MM-DD HH',
	//zippedArchive: true,
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
	zippedArchive: true,
});

const { EmbedBuilder } = require('discord.js');
const { guildData } = require('../../data/guildData.json');
const SkillCampGuildIds = guildData.guildIDs;

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		let embed;
		setInterval(() => {
			// connect to the database
			const connection = mysql.createConnection({
				host: process.env.DB_HOST,
				user: process.env.DB_USER,
				password: process.env.DB_PASSWORD,
				port: process.env.DB_PORT,
				database: process.env.DB_NAME,
			});

			const d = new Date();
			const date = d.getDate();
			const day = d.getDay();
			const hour = d.getHours();
			const minute = d.getMinutes();

			if (minute == 55) {
				const channel = client.guilds.cache.get(guildData.CodeCamp.guildId).channels.cache.get(guildData.CodeCamp.channels.rubberDucksVC.channelID);
				const role = client.guilds.cache.get(guildData.CodeCamp.guildId).roles.cache.find(role => role.name === 'Rubber Ducks Attendees');
				const membersWithRole = role.members.size;
				if (membersWithRole > 1) {
					try {
						// pick a random number between 1 and 3
						const random = Math.floor(Math.random() * 3) + 1;
						if (random == 1) {
							channel.send(`How are you getting on with your projects? Any thing you need help with? Unmute yourself and ask a question!\n:duck::duck::duck::duck::duck::duck:`);
						} else if (random == 2) {
							channel.send(`Rubber Ducks is a great place to get help with your projects. Unmute yourself and ask a question!\n:duck::duck::duck::duck::duck::duck:`);
						} else if (random == 3) {
							channel.send(`If you need some help just unmute yourself and ask a question! OR maybe you just want to talk. Join us in the main <#${guildData.CodeCamp.channels.rubberDucksVC.channelID}> room.\n:duck::duck::duck::duck::duck::duck:`);
						}
					} catch (error) {
						console.error(error);
						logger.error(error);
					}
				}
			} else if (minute == 10) {
				const channel = client.guilds.cache.get(guildData.CodeCamp.guildId).channels.cache.get(guildData.CodeCamp.channels.rubberDucksVC.channelID);
				const role = client.guilds.cache.get(guildData.CodeCamp.guildId).roles.cache.find(role => role.name === 'Rubber Ducks Attendees');
				const membersWithRole = role.members.size;
				if (membersWithRole > 1) {
					try {
						// pick a random number between 1 and 3
						const random = Math.floor(Math.random() * 3) + 1;
						if (random == 1) {
							channel.send(`OK, let's get back to work! :muscle:\n:duck::duck::duck::duck::duck::duck:`);
						} else if (random == 2) {
							channel.send(`Time's up! Let continue making good software!\n:duck::duck::duck::duck::duck::duck:`);
						} else if (random == 3) {
							channel.send(`Here we go! Keep coding. If you need help, let us be your Rubber Ducks.\n:duck::duck::duck::duck::duck::duck:`);
						}
					} catch (error) {
						console.error(error);
						logger.error(error);
					}
				}
			} else if (minute == 0 && hour == 16) {
				if (date == 7 || date == 17 || date == 27) {
					try {
						// TODO Finish list of IDEs
						embed = new EmbedBuilder()
							.setColor('#01ee10')
							.setTitle('Software & IDEs')
							.setDescription(`Looking for an IDE? Here are some that we recommend.\n\n- **(Visual Studio Code)[https://code.visualstudio.com/]**\nThis is the most used code editor in the industry with thousands of extensions to make it suit your needs.\n- **(IntelliJ)[https://www.jetbrains.com/idea/]**\n- **(PyCharm)[https://www.jetbrains.com/pycharm/]**\n- **(WebStorm)[https://www.jetbrains.com/webstorm/]**\n- **(Android Studio)[https://developer.android.com/studio]**\nA must have for developing Android Apps. Comes with Android Emulator to allow you to run your apps as if running on an Android device. You'll be able to test the app runs as expected when dealing with sensors and other inputs.\n- (Eclipse)[https://www.eclipse.org/]\n`);
						//client.guilds.cache.get(guildData.CodeCamp.guildId).channels.cache.get(guildData.CodeCamp.channels.generalchat.channelID).send({ embeds: [embed] });
						client.guilds.cache.get(guildData.CodeCamp.guildId).channels.cache.find(channel => channel.name === 'todo-list').send({ content: `<@708297454596128852> Finish this list!`, embeds: [embed] });
					} catch (error) {
						console.error(error);
						logger.error(error);
					}
				}
			}

			// get date
			const d2 = new Date();
			const fullDate = d2.toISOString().slice(0, 19).replace('T', ' ');
			connection.connect(function (err) {
				if (err) {
					logger.error(err);
					console.error('Error connecting: ' + err.stack);
					return;
				}
				function confirm(MessageID) {
					// update database
					connection.query(`UPDATE msgQueue SET Sent = 1 WHERE MessageID = ${MessageID}`, (error2) => {
						if (error2) {
							console.error(error2);
							logger.error(error2);
						}
					});
				}
				connection.query(`SELECT * FROM queuedMsgs WHERE \`Datetime\` <= '${fullDate}' and Sent = 0`, (error, results, fields) => {
					if (error) {
						console.error(error);
						logger.error(error);
						return;
					}
					console.log(results);

					results.forEach(result => {
						console.log(result);
						// get guild by name
						const guild = client.guilds.cache.get(result.guildID);
						if (!guild) {
							console.error(`Guild not found: ${result.guildID}`);
							logger.error(`Guild not found: ${result.guildID}`);
							return;
						}

						// get channel by id
						const channel = guild.channels.cache.get(result.ChannelID);
						if (!channel) {
							console.error(`Channel not found: ${result.ChannelID}`);
							logger.error(`Channel not found: ${result.ChannelID}`);
							return;
						}

						// TODO Check if channel is a forum channel
						if (channel.type == 15) {
							if (result.Embed == 1) {
								// send embed
								embed = new EmbedBuilder();
								if (result.EmbedColor) {
									embed.setColor(result.EmbedColor);
								}
								embed.setTitle(result.EmbedTitle);
								embed.setDescription(result.EmbedDescription);
								if (result.EmbedImage) {
									embed.setImage(result.EmbedImage);
								}
								if (result.EmbedThumbnail) {
									embed.setThumbnail(result.EmbedThumbnail);
								}
								if (result.EmbedFooter) {
									let footer = {};
									footer = {
										text: '',
									};
									if (result.EmbedFooterIcon) {
										footer.icon_url = result.EmbedFooterIcon;
									}
									footer.text = result.EmbedFooter;
									console.log(footer);
									embed.setFooter(footer);
								}
								if (result.EmbedAuthor) {
									let author = {};
									author = {
										name: '',
									};
									if (result.EmbedAuthorIcon) {
										author.iconURL = result.EmbedAuthorIcon;
									}
									if (result.EmbedAuthorURL) {
										author.url = result.EmbedAuthorIcon;
									}
									author.name = result.EmbedAuthor;
									console.log(author);
									embed.setAuthor(author);
								}
								if (result.EmbedURL) {
									embed.setURL(result.EmbedURL);
								}
								if (result.EmbedTimestamp) {
									embed.setTimestamp();
								}
								// create forum post
								channel.threads.create({
									name: result.PostTitle,
									autoArchiveDuration: 1440,
									type: 'GUILD_PUBLIC_THREAD',
									reason: 'Scheduled post',
									message: {
										content: result.Message,
										embeds: [embed],
									},
								});
							}
							confirm(result.MessageID);
						} else if (channel.type == 2 || channel.type == 0 || channel.type == 5 || channel.type == 13 || channel.type == 5 || channel.type == 11 || channel.type == 12) {
							if (result.Embed == 1) {
								// send embed
								embed = new EmbedBuilder();
								if (result.EmbedColor) {
									embed.setColor(result.EmbedColor);
								}
								embed.setTitle(result.EmbedTitle);
								embed.setDescription(result.EmbedDescription);
								if (result.EmbedImage) {
									embed.setImage(result.EmbedImage);
								}
								if (result.EmbedThumbnail) {
									embed.setThumbnail(result.EmbedThumbnail);
								}
								if (result.EmbedFooter) {
									let footer = {};
									footer = {
										text: '',
									};
									if (result.EmbedFooterIcon) {
										footer.icon_url = result.EmbedFooterIcon;
									}
									footer.text = result.EmbedFooter;
									console.log(footer);
									embed.setFooter(footer);
								}
								if (result.EmbedAuthor) {
									let author = {};
									author = {
										name: '',
									};
									if (result.EmbedAuthorIcon) {
										author.iconURL = result.EmbedAuthorIcon;
									}
									if (result.EmbedAuthorURL) {
										author.url = result.EmbedAuthorIcon;
									}
									author.name = result.EmbedAuthorName;
									console.log(author);
									embed.setAuthor(author);
								}
								if (result.URL) {
									embed.setURL(result.URL);
								}
								if (result.EmbedTimestamp) {
									embed.setTimestamp();
								}
								channel.send({ content: result.Message, embeds: [embed] });
								confirm(result.MessageID);
							} else {
								// send message
								channel.send(result.Message);
								confirm(result.MessageID);
							}
						} else {
							console.error(`Channel type not supported: ${channel.type}`);
							logger.error(`Channel type not supported: ${channel.type}`);
						}
					});
				});

				connection.query(`SELECT * FROM timedMsgs WHERE Hour = '${hour}' and Minute = '${minute}' and Active = 1`, (error, results, fields) => {
					if (error) {
						console.error(error);
						logger.error(error);
						return;
					}
					console.log(results);

					results.forEach((result) => {
						if (result.Day != day && result.Day != 7) {
							return;
						}
						// get guild by name
						const guild = client.guilds.cache.get(results[0].guildID);

						// get channel by id
						const channel = guild.channels.cache.get(results[0].channelID);

						// send message
						channel.send(results[0].Message);
					});
				});
				//connection.end();
			}, 1000 * 30);

			setInterval(() => {
				// for each guild
				client.guilds.cache.forEach((guild) => {
					console.log(`Guild: ${guild.name} (${guild.id})`);
					// get all members
					guild.members.cache.forEach((member) => {
						// for each member
						console.log(`Member: ${member.user.username} (${member.id})`);
						connection.query(`SELECT * FROM users WHERE discordUserID = '${member.id}'`, (error, results, fields) => {
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
					});
				});
			});
		}, 1000 * 60 * 60 * 5);
	},
};