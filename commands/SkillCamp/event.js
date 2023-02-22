require('dotenv').config();
const io = require('@pm2/io');
const env = process.env.environment;
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

const fs = require('fs').promises;
const path = require('path');
const process2 = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process2.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process2.cwd(), 'credentials.json');

const { guildData } = require('../../data/guildData.json');
const SkillCampGuildIds = guildData.SkillCamps.guildIDs;

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildScheduledEvent, GuildScheduledEventManager } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Add an event to the calendars')
		// block the command to only be used by the bot owner
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents | PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageRoles)
		.addStringOption(option => option
			.setName('name')
			.setDescription('The event name')
			.setRequired(true),
		)
		.addStringOption(option => option
			.setName('description')
			.setDescription('The event description')
			.setRequired(true),
		)
	//	.addChannelOption(option => option
	//		.setName('channel')
	//		.setDescription('The channel where the event will take place')
	//		.setRequired(true)
	//		.setChannelTypes(['GUILD_VOICE', 'GUILD_STAGE_VOICE']),
	//)
	.addChannelOption(option => option
		.setName('channel')
		.setDescription('The channel where the event will take place')
		.setRequired(true),
	)
		.addStringOption(option => option
			.setName('timezone')
			.setDescription('The timezone of the event')
			.setRequired(true)
			.addChoices(
				{ name: 'PST', value: '-8' },
				{ name: 'UTC', value: '0' },
				{ name: 'EST', value: '-5' },
				{ name: 'CST', value: '-6' },
				{ name: 'MST', value: '-7' },
			),
		)
		.addStringOption(option => option
			.setName('start')
			.setDescription('The start time of the event YYYY-MM-DD HH:MM')
			.setRequired(true),
		)
		.addStringOption(option => option
			.setName('end')
			.setDescription('The end time of the event YYYY-MM-DD HH:MM')
			.setRequired(true),
		)
		.addAttachmentOption(option => option
			.setName('image')
			.setDescription('The image to be used for the event')
			.setRequired(false),
		)
		.addRoleOption(option => option
			.setName('role')
			.setDescription('The roles to be pinged for the event')
			.setRequired(false),
		)
		.addStringOption(option => option
			.setName('color')
			.setDescription('The color of the event [#RRGGBB]')
			.setRequired(false),
		),
	async execute(interaction) {
		const guildId = interaction.guildId;
		const guild = interaction.guild;

		const eventName = interaction.options.getString('name');
		const eventDescription = interaction.options.getString('description');
		const eventChannel = interaction.options.getChannel('channel');
		const eventTimezone = interaction.options.getString('timezone');
		const eventStart = interaction.options.getString('start');
		const eventEnd = interaction.options.getString('end');
		const eventImageRaw = interaction.options.getAttachment('image');
		const eventImage = "data:image/gif;base64," + fs.readFileSync(eventImageRaw, 'base64');
		const eventRole = interaction.options.getRole('role');
		const eventColor = interaction.options.getString('color');

		// TODO Create Discord Event
		guild.GuildScheduledEventManager.create({
			name: eventName,
			description: eventDescription,
			channelId: eventChannel.id,
			startTime: eventStart,
			endTime: eventEnd,
			timezone: eventTimezone,
			privacyLevel: 'GUILD_ONLY',
			image: eventImage,
		});

		// TODO Create Google Calendar Event
		// Connect to Google Calendar
		// Load client secrets from a local file.
		fs.readFile(CREDENTIALS_PATH, (err, content) => {
			if (err) return console.log('Error loading client secret file:', err);
			// Authorize a client with credentials, then call the Google Calendar API.
			authorize(JSON.parse(content), addEvent);
		});

		// TODO Create Meetup Event
	},
};