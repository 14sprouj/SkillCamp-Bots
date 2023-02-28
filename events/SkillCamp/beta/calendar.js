require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/%DATE% error.log',
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

const fs = require('fs').promises;
const path = require('path');
const process2 = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const { EmbedBuilder, GuildScheduledEvent, GuildScheduledEventManager } = require('discord.js');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process2.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process2.cwd(), 'credentials.json');
const { guildData } = require('../../data/guildData.json');
const SkillCampGuildIds = guildData.guildIDs;

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {

		function cals(auth, guildID, calID) {
			const calendar = google.calendar({ version: 'v3', auth });
			const res = calendar.events.list({
				calendarId: calID,
				timeMin: new Date().toISOString(),
				maxResults: 75,
				singleEvents: true,
				orderBy: 'startTime',
			});
			const events = res.data.items;
			if (!events || events.length === 0) {
				console.log('No upcoming events found.');
				return;
			}
			console.log('Upcoming 75 events:');
			events.map((event, i) => {
				console.log(event);
				const guild = client.guilds.cache.get(guildID);
				console.log("guild: " + guild);
				// get discord event by name
				const scheduledEvents = guild.scheduledEvents;
				console.log(scheduledEvents);
				const discordEvent = guild.scheduledEvents.cache.find(e => e.name === event.summary);
				console.log(discordEvent);

				//if exists, update it
				if (discordEvent) {
					console.log('updating event');
					if (discordEvent.name !== event.summary) {
						discordEvent.setName(event.summary);
					}
					if (discordEvent.description !== event.description) {
						discordEvent.setDescription(event.description);
					}
					if (discordEvent.channelId !== event.location) {
						discordEvent.setChannel(event.location);
					}
					if (discordEvent.scheduledStartTime !== event.start.dateTime) {
						discordEvent.setScheduledStartTime(event.start.dateTime);
					}
					if (discordEvent.scheduledEndTime !== event.end.dateTime) {
						discordEvent.setScheduledEndTime(event.end.dateTime);
					}
				} else {
					console.log('creating event');
					// if not, create it
					const eventStart = new Date(event.start.dateTime) || new Date(event.start.date);
					const eventEnd = new Date(event.end.dateTime) || new Date(event.end.date);
					const eventChannel = client.channels.cache.get(event.location);
					//console.log(eventChannel);
					const embed = new EmbedBuilder()
						.setTitle(event.summary)
						.setDescription(event.description)
						.setTimestamp(new Date())
						.setColor('#0099ff')
						.setFooter({ text: 'SkillCamps' });
					guild.scheduledEvents.create({
						name: event.summary,
						description: event.description,
						scheduledStartTime: eventStart,
						scheduledEndTime: eventEnd,
						channel: eventChannel,
						privacyLevel: 2,
						entityType: 2,
					});
				}

			});
		}
		/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
		async function loadSavedCredentialsIfExist() {
			try {
				const content = await fs.readFile(TOKEN_PATH);
				const credentials = JSON.parse(content);
				return google.auth.fromJSON(credentials);
			} catch (err) {
				return null;
			}
		}

		/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
		async function saveCredentials(client) {
			const content = await fs.readFile(CREDENTIALS_PATH);
			const keys = JSON.parse(content);
			const key = keys.installed || keys.web;
			const payload = JSON.stringify({
				type: 'authorized_user',
				client_id: key.client_id,
				client_secret: key.client_secret,
				refresh_token: client.credentials.refresh_token,
			});
			await fs.writeFile(TOKEN_PATH, payload);
		}

		/**
 * Load or request or authorization to call APIs.
 *
 */
		async function authorize() {
			let client = await loadSavedCredentialsIfExist();
			if (client) {
				return client;
			}
			client = await authenticate({
				scopes: SCOPES,
				keyfilePath: CREDENTIALS_PATH,
			});
			if (client.credentials) {
				await saveCredentials(client);
			}
			return client;
		}

		/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
		async function listEvents(auth) {
			// CampMaster
			cals(auth, "1039918797127176192", "7bb1e0731630a9e71368591205faab34e9f23a94a3a135c33ce7f676e4fda5ea@group.calendar.google.com");
		}

		authorize().then(listEvents).catch(console.error);
	},
};