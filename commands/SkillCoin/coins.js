require('dotenv').config();
const env = process.env.environment;
const io = require('@pm2/io');

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

const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('coins')
		.setDescription('Get information about SkillCoins'),
	async execute(interaction) {
		// get guild id
		const guildid = interaction.guild.id;
		const guildname = interaction.guild.name;

		// get user id
		const userid = interaction.user.id;

		let coinAquisition;

		if (guildname == "ScriptCamp") {
			coinAquisition = "**Written Feeback/Script Swaps**\nHop in the <#1066478869030391868> channel and read other people's loglines or scripts, then post helpful feedback.\n- Logline Feedback <:SkillCoin:1080469270951116884>1\n- Shorts/Scene Feedback <:SkillCoin:1080469270951116884>2\n- Feature/Pilot Feedback <:SkillCoin:1080469270951116884>3\n- If moderator notices amazing written feedback for a script <:SkillCoin:1080469270951116884>5\n**Contests / Activities**\nWin daily picture prompt / char prompt / title prompt <:SkillCoin:1080469270951116884>2\nWin 3 page challenge <:SkillCoin:1080469270951116884>10\n**5 Page Table Reads**\n- Reading part <:SkillCoin:1080469270951116884>1\n- Verbal feedback <:SkillCoin:1080469270951116884>2\n- If moderator notices amazing feedback<:SkillCoin:1080469270951116884>3\n**Feature / Pilot Table Reads**\n- Reading parts <:SkillCoin:1080469270951116884>2 - <:SkillCoin:1080469270951116884>4\n- Verbal feedback <:SkillCoin:1080469270951116884>4\n- If moderator notices amazing feedback <:SkillCoin:1080469270951116884>7\n**Classes and Groups**\n- Complete Class / Group Exercises <:SkillCoin:1080469270951116884>1\n- Complete a feature or pilot in a bootcamp <:SkillCoin:1080469270951116884>5";
		} else if (guildname == "CodeCamp") {
			coinAquisition = "**Written Feeback/Script Swaps**\nHop in the <#1066478869030391868> channel and read other people's loglines or scripts, then post helpful feedback.\n- Logline Feedback <:SkillCoin:1080469270951116884>1";
		}

		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('What are SkillCoins?')
			.setDescription(`SkillCoins are a currency used to reward users for their participation in SkillCamp servers.\nTo check your balance, use the \`/balance\` command.\nTo give coins to another user, use the \`/pay\` command.\nTo see what you can spend your coins on, use the \`/store\` command.\n**Ways to earn more coins**\n${coinAquisition}\n**Membership**\nUnlimited Members get <:SkillCoin:1080469270951116884>100 to start then <:SkillCoin:1080469270951116884>50 per month\nScript Coaching Members get <:SkillCoin:1080469270951116884>100 every month.`);
		await interaction.reply({ embeds: [embed] });
	},
};