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

const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('Send embed')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.setDMPermission(false)
		.addStringOption(option => option
			.setName('title')
			.setDescription('The title of the embed')
			.setRequired(true),
		)
		.addStringOption(option => option
			.setName('description')
			.setDescription('The description of the embed')
			.setRequired(true),
		)
		.addStringOption(option => option
			.setName('color')
			.setDescription('The color of the embed')
			.setRequired(true),
		)
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('The channel to send the embed to')
			.setRequired(true),
		)
		.addStringOption(option => option
			.setName('footericon')
			.setDescription('The footer icon of the embed'),
		)
		.addStringOption(option => option
			.setName('footer')
			.setDescription('The footer of the embed'),
		)
		.addStringOption(option => option
			.setName('thumbnail')
			.setDescription('The thumbnail of the embed'),
		)
		.addStringOption(option => option
			.setName('image')
			.setDescription('The image URL for the embed'),
		)
		.addStringOption(option => option
			.setName('author')
			.setDescription('The author of the embed'),
		)
		.addStringOption(option => option
			.setName('authoricon')
			.setDescription('The author icon of the embed'),
		)
		.addStringOption(option => option
			.setName('authorurl')
			.setDescription('The author url of the embed'),
		)
		.addStringOption(option => option
			.setName('url')
			.setDescription('The url of the embed'),
		)
		.addBooleanOption(option => option
			.setName('timestamp')
			.setDescription('Add timestamp to embed'),
		),
	async execute(interaction) {
		const title = interaction.options.getString('title');
		const descriptionRaw = interaction.options.getString('description');
		// line breaks
		const description = descriptionRaw.replace(/\\n/g, `
		
		`);
		const color = interaction.options.getString('color');
		const channel = interaction.options.getChannel('channel');
		const footer = interaction.options.getString('footer');
		const footerIcon = interaction.options.getString('footericon');
		const thumbnail = interaction.options.getString('thumbnail');
		const image = interaction.options.getString('image');
		const author = interaction.options.getString('author');
		const authorIcon = interaction.options.getString('authoricon');
		const authorUrl = interaction.options.getString('authorurl');
		const url = interaction.options.getString('url');
		const timestamp = interaction.options.getBoolean('timestamp');
		let attachment;
		const authorCont = {};
		const footerCont = {};

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(color);

		if (image) {
			if (!image.startsWith('http')) {
				return interaction.reply({ content: 'Image must be a link', ephemeral: true });
			} else if (!image.endsWith('.png') && !image.endsWith('.jpg') && !image.endsWith('.jpeg') && !image.endsWith('.gif')) {
				return interaction.reply({ content: 'Image must be a png, jpg, jpeg or gif', ephemeral: true });
			} else if (image.length > 2048) {
				return interaction.reply({ content: 'Image must be less than 2048 characters', ephemeral: true });
			} else if (image.length < 1) {
				return interaction.reply({ content: 'Image must be more than 1 character', ephemeral: true });
			} else if (image.includes(' ')) {
				return interaction.reply({ content: 'Image must not contain spaces', ephemeral: true });
			} else {
				embed.setImage(image);
			}
		}

		if (timestamp == 'true') {
			embed.setTimestamp();
		}

		if (thumbnail) {
			if (!thumbnail.startsWith('http')) {
				return interaction.reply({ content: 'Thumbnail must be a link', ephemeral: true });
			} else if (!thumbnail.endsWith('.png') && !thumbnail.endsWith('.jpg') && !thumbnail.endsWith('.jpeg') && !thumbnail.endsWith('.gif')) {
				return interaction.reply({ content: 'Thumbnail must be a png, jpg, jpeg or gif', ephemeral: true });
			} else if (thumbnail.length > 2048) {
				return interaction.reply({ content: 'Thumbnail must be less than 2048 characters', ephemeral: true });
			} else if (thumbnail.length < 1) {
				return interaction.reply({ content: 'Thumbnail must be more than 1 character', ephemeral: true });
			} else if (thumbnail.includes(' ')) {
				return interaction.reply({ content: 'Thumbnail must not contain spaces', ephemeral: true });
			} else {
				embed.setThumbnail(thumbnail);
			}
		}

		if (footer || footerIcon) {
			if (footer) {
				footerCont.text = footer;
			}
			if (footerIcon) {
				footerCont.iconURL = footerIcon;
			}
			embed.setFooter(footerCont);
		}

		if (author || authorIcon || authorUrl) {
			if (author) {
				authorCont.name = author;
			}
			if (authorIcon) {
				authorCont.iconURL = authorIcon;
			}
			if (authorUrl) {
				authorCont.url = authorUrl;
			}
			embed.setAuthor(authorCont);
		}

		if (url) {
			embed.setURL(url);
		}


		await interaction.reply({ content: `Embed sent to channel <#${channel.id}> by user <@${interaction.user.tag}>` });

		await channel.send({ embeds: [embed] });
		logger.info(`Embed sent to channel #${channel.id} from #${interaction.channel.id} on guild ${interaction.guild.id} "${interaction.guild.name}" by user @${interaction.user.id}`);
	},
};