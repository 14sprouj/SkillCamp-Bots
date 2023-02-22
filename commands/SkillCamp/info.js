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

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Display info')
		.setDMPermission(false)
		.addSubcommand(subcommand => subcommand
			.setName('user')
			.setDescription('Display info about a user')
			.addUserOption(option => option
				.setName('target')
				.setDescription('The user\'s info you want to see'),
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('channel')
			.setDescription('Replies with Channel Info')
			.addChannelOption(option => option
				.setName('target')
				.setDescription('The channel to get info from')
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('channelslist')
			.setDescription('Replies with Channels List')
			.addStringOption(option => option
				.setName('format')
				.setDescription('The format to display the list in')
				.setRequired(true)
				.setChoices(
					{ name: 'Text', value: 'text' },
					{ name: 'JSON', value: 'json' },
				),
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('server')
			.setDescription('Replies with Server info'),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'server') {
			if (interaction.guild === null) return interaction.reply('This command can only be used in a server.');
			await interaction.reply(`Server ID: ${interaction.guild.id}\nServer name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}\nHuman members: ${interaction.guild.members.cache.filter(m => !m.user.bot).size}\nBot members: ${interaction.guild.members.cache.filter(m => m.user.bot).size}\nServer owner: ${interaction.guild.owner}\nServer region: ${interaction.guild.region}\nServer created at: ${interaction.guild.createdAt}\nServer icon: ${interaction.guild.iconURL()}\nServer banner: ${interaction.guild.bannerURL()}\nServer splash: ${interaction.guild.splashURL()}\nChannel count: ${interaction.guild.channels.cache.size}\nRole count: ${interaction.guild.roles.cache.size}\nEmote count: ${interaction.guild.emojis.cache.size}\nBoost count: ${interaction.guild.premiumSubscriptionCount}\nBoost tier: ${interaction.guild.premiumTier}`);
			logger.info(`${interaction.user.id} in #${interaction.channel.name} used the "/info server" command.`);
		} else if (subcommand === 'channel') {
			let channel = interaction.channel;
			if (interaction.options.getChannel('target')) {
				channel = interaction.options.getChannel('target');
			}

			if (channel.type === 'DM') return interaction.reply('This command can\'t be used in DMs.');
			await interaction.reply(`Channel ID: ${channel.id}\nChannel name: ${channel.name}\nChannel type: ${channel.type}\nChannel created at: ${channel.createdAt}\nChannel topic: ${channel.topic}\nChannel position: ${channel.position}\nChannel parent: ${channel.parent}\nChannel permission overwrites: ${channel.permissionOverwrites}\nChannel nsfw: ${channel.nsfw}\nChannel rate limit: ${channel.rateLimitPerUser}\nChannel last message ID: ${channel.lastMessageID}\nChannel last pinned timestamp: ${channel.lastPinTimestamp}\nChannel messages cache size: ${channel.messages.cache.size}\nChannel type: ${channel.type}`);
			logger.info(`${interaction.user.id} in #${interaction.channel.name} used the "/info channel" command.`);
		} else if (subcommand === 'channelslist') {
			if (interaction.guild === null) return interaction.reply('This command can only be used in a server.');
			const formatList = interaction.options.getString('format');
			const list = [];
			if (formatList === 'text') {
				interaction.guild.channels.cache.forEach(channel => {
					if (channel.type != '4' && channel.type != '11') {
						list.push(`<#${channel.id}> ${channel.name} - ${channel.id}`);
					} else {
						list.push(`Category: ${channel.name} - ${channel.id}`);
					}
				});

				const strings = [];
				for (i = 0; i < list.length; i++) {
					if (strings[strings.length - 1] && strings[strings.length - 1].length + list[i].length < 2000) {
						strings[strings.length - 1] += '\n' + list[i];
					} else {
						strings.push(list[i]);
					}
				}
				let i;
				for (i = 0; i < strings.length; i++) {
					// await interaction.reply(strings[i]);
					await interaction.channel.send(strings[i]);
				}
			} else if (formatList === 'json') {
				await interaction.reply({ content: `Channel list sent`, ephemeral: true });
				interaction.guild.channels.cache.forEach(channel => {
					if (channel.type != '4' && channel.type != '11') {
						list.push(`{"channelName": "${channel.name}", "channelID": "${channel.id}", "type": "${channel.type}"},`);
					}
				});
				let i;
				const strings = [];
				for (i = 0; i < list.length; i++) {
					if (strings[strings.length - 1] && strings[strings.length - 1].length + list[i].length < 1980) {
						strings[strings.length - 1] += '\n' + list[i];
					} else {
						strings.push(list[i]);
					}
				}

				for (i = 0; i < strings.length; i++) {
					// await interaction.reply(strings[i]);
					await interaction.followUp({ content: '```json\n' + strings[i] + '```', ephemeral: true });
				}
			}
			logger.info(`${interaction.user.id} in #${interaction.channel.name} used the "/info channelslist" command.`);
		} else if (subcommand === 'user') {
			let user = interaction.user;
			if (interaction.options.getUser('target')) {
				user = interaction.options.getUser('target');
			}
			await interaction.reply({ content: `Username: ${user.username}\nID: ${user.id}\nUser since: ${user.createdAt}`, ephemeral: true });
			logger.info(`${interaction.user.id} in #${interaction.channel.name} used the "/info user" command.`);
		}
	},
};