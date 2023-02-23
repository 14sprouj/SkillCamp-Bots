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

const { guildData } = require('../../data/guildData.json');
const SkillCampGuildIds = guildData.guildIDs;

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

//const getEditableSkillCampMsg = require('../../classes/getEditableSkillCampMsg');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bootcamppoll')
		.setDescription('Create the bootcamp poll')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption(option => option
			.setName('text')
			.setDescription('The text to be displayed in the poll')
			.setRequired(true),
		)
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('The channel to send the poll in'),
		),
	async execute(interaction) {
		if (env == "dev") {
			interaction.reply({ content: 'This command is disabled in dev mode', ephemeral: true });
			return;
		}

		let channel, message;
		const guildId = interaction.guild.id;
		console.log(guildId);
		console.log(SkillCampGuildIds);
		if (!SkillCampGuildIds.includes(guildId)) {
			interaction.reply({ content: 'This command can only be used in the SkillCamp servers', ephemeral: true });
			return;
		}

		const text = interaction.options.getString('text');
		let qchannel;
		if (interaction.options.getChannel('channel') == null) {
			qchannel = interaction.options.getChannel('channel');
		} else {
			qchannel = interaction.channel;
		}

		const embed = new EmbedBuilder()
			.setTitle(text)
			.setDescription('Click the button below to vote');

		if (interaction.guild.name == 'SkillCamp') {
			embed.setColor('#ffffff');
		} else if (interaction.guild.name == 'ScriptCamp') {
			embed.setColor('#EAB93E');
		} else if (interaction.guild.name == 'WordCamp') {
			embed.setColor('#42E8B0');
		} else if (interaction.guild.name == 'FilmCamp') {
			embed.setColor('#FF923A');
		} else if (interaction.guild.name == 'CreatorCamp') {
			embed.setColor('#FDA4A5');
		} else if (interaction.guild.name == 'LingoCamp') {
			embed.setColor('#77FA55');
		} else if (interaction.guild.name == 'DesignCamp') {
			embed.setColor('#4FE747');
		} else if (interaction.guild.name == 'ToonCamp') {
			embed.setColor('#C644E1');
		} else if (interaction.guild.name == 'CodeCamp') {
			embed.setColor('#0A0A0A');
			channel = interaction.guild.channels.cache.get('1073622067196481667');
			message = channel.messages.fetch('1074132703017975868');
		} else if (interaction.guild.name == 'CampMaster') {
			embed.setColor('#de7b0A');
			channel = interaction.guild.channels.cache.get('1075113750924898324');
			message = channel.messages.fetch('1075114480742178877');
		}

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('BCpollYes')
					.setLabel('Yes')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('BCpollNo')
					.setLabel('No')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('BCpollMaybe')
					.setLabel('Not sure')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('BCpollQuestions')
					.setLabel('I have questions')
					.setStyle(ButtonStyle.Primary),
			);

		console.log(embed);
		console.log(row);

		// send message to channel
		qchannel.send({ embeds: [embed], components: [row] });

		// open json file
		const fs = require('fs');
		const path = require('path');
		let { BootcampPollData } = require('../data/bootcampPoll.json');

		message.then(message => {
			interaction.deferReply();

			// edit message
			message.edit({ content: `BootCamp Poll\nYes: 0\nNo: 0\nNot sure: 0\nI have questions: 0` });
		});

		BootcampPollData = {
			'name': text,
			'yes': [],
			'no': [],
			'maybe': [],
			'questions': [],
		};

		// write to json file
		fs.writeFile(path.join(__dirname, '../data/bootcampPoll.json'), JSON.stringify('{"BootcampPollData": {' + BootcampPollData + '}}', 4, 2), (err) => {
			if (err) throw err;
			console.log('Bootcamp poll data written to file');
		});

		interaction.reply({ content: 'Poll created', ephemeral: true });
	},
};