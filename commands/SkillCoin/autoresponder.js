require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');

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

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('autoresponder')
		.setDescription('Sends helpful text such as answers to FAQs, links to resources, etc.')
		.addStringOption(option => option
			.setName('message')
			.setDescription('The message to respond with.')
			.setRequired(true)
			.addChoices(
				{ name: 'Software', value: 'software' },
				{ name: 'Rubber Ducks', value: 'rubberducks' },
			),
		),
	async execute(interaction) {
		const message = interaction.options.getString('message');
		console.log(message);
		let embed;
		if (message == 'software') {
			embed = new EmbedBuilder()
				.setTitle('Software')
				.setDescription('**Visual Studio Code**\nWorks with many different languages and is available on Windows, Mac and Linux. It has thousands of extensions that add functionality and it connects to GitHub for easy git control.\n[Download](https://code.visualstudio.com/)')
				.setColor('#0f0f2b')
				.setFooter({ text: 'List by Joel Sprouse. Have you used software you would recommend? DM @sproj003#0003 to add it to the list.' });
		} else if (message == 'rubberducks') {
			embed = new EmbedBuilder()
				.setTitle('Rubber Ducks')
				.setDescription("Rubber Ducks is a place where computer programmers gather from all over the world to work independently. We join here regularly to help each other as we run into issues and need help. Use the chat channel if you want help or want to give help.If you'd prefer to work in silence, either use Discord's deafen function or move to the quiet space VC. The Rubber Ducks is open 24 / 7 even if the event isn't running. The event running means that at least one person is guaranteed to be in there at the time.")
				.setColor('#feff10')
				.setImage('https://static.boredpanda.com/blog/wp-content/uploads/2018/11/programmers-rubber-duck-debugging-1-5be16bd8a544c__700.jpg');
		} else {
			logger.error('Invalid message');
		}
		try {
			await interaction.reply({ embeds: [embed] });
			if (interaction.guild) {
				logger.info(`${interaction.user.id} in #${interaction.channel.name} in Guild ${interaction.guild.name} used the "/autoresponder ${message}" command.`);
			} else {
				logger.info(`${interaction.user.id} used the "/autoresponder" command in a DM.`);
			}
		} catch (error) {
			logger.error(error);
		}
	},
};