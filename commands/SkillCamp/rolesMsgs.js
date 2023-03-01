require('dotenv').config();
const io = require('@pm2/io');
const mysql = require('mysql2');
const env = process.env.environment;
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const transport1 = new winston.transports.DailyRotateFile({
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/commands/%DATE% full.log',
	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '10m',
});

const transport2 = new winston.transports.DailyRotateFile({
	level: 'error',
	filename: 'logs/SkillCamp/' + new Date().getFullYear() + '/commands/%DATE% error.log',
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

const { guildData } = require('../../data/guildData.json');
const SkillCampGuildIds = guildData.guildIDs;

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rolesmsgs')
		.setDescription('Send the #tag-yourself messages')
		// block the command to only be used by the bot owner
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels | PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		// get the guild id
		const guild = interaction.guild;
		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;

		let embed, row, row2, row3, row4, row5, row6, row7, row8, channel, messages;

		await interaction.reply({ content: 'The roles messages have been sent to the channel!', ephemeral: true });

		channel = guild.channels.cache.find(ch => ch.name === 'rules');
		messages = await channel.messages.fetch();
		await messages.forEach(message => message.delete());

		if (guildName === 'CodeCamp') {
			embed = new EmbedBuilder()
				.setTitle('Server Rules')
				.setDescription(`This is a community server. All members must abide by the Discord terms https://discord.com/terms & community guidelines https://discord.com/guidelines. In addition:\n\n1️⃣ Be nice. We don't tolerate hate speech, abusive language, bashing or personal attacks, whether aimed at server members or non-members. Consider that anyone who worked on a film or show may be a member of our server. Help us maintain a respectful and welcoming atmosphere for everyone.\n\n2️⃣ Don’t spam, post NSFW content, advertise, or be a troll.\n\n3️⃣ Swearing is okay within reason, but see rule #1\n\n4️⃣ Offer only constructive criticism to your peers. Approach giving and receiving feedback as part of your professional development.\n\n5️⃣ Don’t share links to pirated or otherwise illegal content. Sharing scripts is fine, as long as the writer is okay with them circulating.\n\n6️⃣ Don’t talk politics in public channels.\n\n7️⃣ We reserve the right to remove someone from the server or cancel their subscription at our sole discretion.`)
				.setColor('#0a0a0a');
			await channel.send({ embeds: [embed] });
		} else if (guildName === 'ScriptCamp') {
			embed = new EmbedBuilder()
				.setTitle('Server Rules')
				.setDescription(`This is a community server. All members must abide by the Discord terms https://discord.com/terms & community guidelines https://discord.com/guidelines. In addition:\n\n1️⃣ Be nice. We don't tolerate hate speech, abusive language, bashing or personal attacks, whether aimed at server members or non-members. Consider that anyone who worked on a film or show may be a member of our server. Help us maintain a respectful and welcoming atmosphere for everyone.\n\n2️⃣ Don’t spam, post NSFW content, advertise, or be a troll.\n\n3️⃣ Swearing is okay within reason, but see rule #1\n\n4️⃣ Offer only constructive criticism to your peers. Approach giving and receiving feedback as part of your professional development.\n\n5️⃣ Don’t share links to pirated or otherwise illegal content. Sharing scripts is fine, as long as the writer is okay with them circulating.\n\n6️⃣ Don’t talk politics in public channels. It’s okay if it comes up now and again (it's a whole genre of movies after all) but heated debates regarding controversial or inappropriate topics should be moved to private conversations.\n\n7️⃣ We reserve the right to remove someone from the server or cancel their subscription at our sole discretion.`)
				.setColor('#EAB93E');
			await channel.send({ embeds: [embed] });
		} else if (guildName === 'WordCamp') {
			embed = new EmbedBuilder()
				.setTitle('Server Rules')
				.setDescription(`This is a community server. All members must abide by the Discord terms https://discord.com/terms & community guidelines https://discord.com/guidelines. In addition:\n\n1️⃣ Be nice. We don't tolerate hate speech, abusive language, bashing or personal attacks, whether aimed at server members or non-members. Consider that anyone who worked on a film or show may be a member of our server. Help us maintain a respectful and welcoming atmosphere for everyone.\n\n2️⃣ Don’t spam, post NSFW content, advertise, or be a troll.\n\n3️⃣ Swearing is okay within reason, but see rule #1\n\n4️⃣ Offer only constructive criticism to your peers. Approach giving and receiving feedback as part of your professional development.\n\n5️⃣ Don’t share links to pirated or otherwise illegal content. Sharing scripts is fine, as long as the writer is okay with them circulating.\n\n6️⃣ Don’t talk politics in public channels.\n\n7️⃣ We reserve the right to remove someone from the server or cancel their subscription at our sole discretion.`)
				.setColor('#42E8B0');
			await channel.send({ embeds: [embed] });
		}

		// get channel
		channel = guild.channels.cache.find(ch => ch.name === 'tag-yourself-test');
		// get all messages in channel
		messages = await channel.messages.fetch();
		// for each message delete it
		await messages.forEach(message => message.delete());

		embed = new EmbedBuilder()
			.setTitle('Roles')
			.setDescription('Click the buttons below to get your roles! Take as many or as few as you want!')
			.setColor('#00ff00');
		await channel.send({ embeds: [embed] });

		embed = new EmbedBuilder()
			.setTitle('Pronouns')
			.setDescription('Choose your pronouns!')
			.setImage('https://cdn.discordapp.com/attachments/1014951642833104995/1015333160801800312/unknown.png')
			.setColor('#00FF9D');
		row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('he')
					.setLabel('He/Him')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('she')
					.setLabel('She/Her')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('they')
					.setLabel('They/Them')
					.setStyle(ButtonStyle.Primary),
			);
		await channel.send({ embeds: [embed], components: [row] });

		embed = new EmbedBuilder()
			.setTitle('Countries/Regions')
			.setDescription('Where do you live?')
			.setImage('https://www.marshallsindia.com/images/bs-collection/volume1/maps/mapx-slider-2.jpg')
			.setColor('#FD6265');

		row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('la')
					.setLabel('Los Angeles')
					.setEmoji('🎬')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('eastcoast')
					.setLabel('US-Eastern')
					.setEmoji('🌇')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('central')
					.setLabel('US-Central')
					.setEmoji('🇺🇸')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('mountain')
					.setLabel('US-Mountain')
					.setEmoji('⛰️')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('pacific')
					.setLabel('US-Pacific')
					.setEmoji('🏖️')
					.setStyle(ButtonStyle.Secondary),
			);
		row2 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('states')
					.setLabel('US-Alaska/Hawaii')
					.setEmoji('⛄')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('ny')
					.setLabel('New York')
					.setEmoji('🗽')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('bay')
					.setLabel('San Francisco Bay Area')
					.setEmoji('🌉')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('canada')
					.setLabel('Canada')
					.setEmoji('🇨🇦')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('mexico')
					.setLabel('Mexico')
					.setEmoji('🇲🇽')
					.setStyle(ButtonStyle.Secondary),

			);
		row3 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('uk')
					.setLabel('UK')
					.setEmoji('🇬🇧')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('ireland')
					.setLabel('Ireland')
					.setEmoji('🇮🇪')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('germany')
					.setLabel('Germany')
					.setEmoji('🇩🇪')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('france')
					.setLabel('France')
					.setEmoji('🇫🇷')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('spain')
					.setLabel('Spain')
					.setEmoji('🇪🇸')
					.setStyle(ButtonStyle.Secondary),
			);
		row4 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('italy')
					.setLabel('Italy')
					.setEmoji('🇮🇹')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('portugal')
					.setLabel('Portugal')
					.setEmoji('🇵🇹')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('eu')
					.setLabel('Europe')
					.setEmoji('🇪🇺')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('brazil')
					.setLabel('Brazil')
					.setEmoji('🇧🇷')
					.setStyle(ButtonStyle.Secondary),
			);
		row5 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('latinam')
					.setLabel('Latin America')
					.setEmoji('🇨🇱')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('asia')
					.setLabel('Asia')
					.setEmoji('🌏')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('africa')
					.setLabel('Africa')
					.setEmoji('🌍')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('australia')
					.setLabel('Australia')
					.setEmoji('🇦🇺')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('nz')
					.setLabel('New Zealand')
					.setEmoji('🇳🇿')
					.setStyle(ButtonStyle.Secondary),
			);
		row6 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('india')
					.setLabel('India')
					.setEmoji('🇮🇳')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('argentina')
					.setLabel('Argentina')
					.setEmoji('🇦🇷')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('scandinavia')
					.setLabel('Scandinavia')
					.setEmoji('🇸🇪')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('netherlands')
					.setLabel('Netherlands')
					.setEmoji('🇳🇱')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('middleeast')
					.setLabel('Middle East')
					.setStyle(ButtonStyle.Secondary),
			);
		await channel.send({ embeds: [embed], components: [row, row2, row3, row4, row5] });
		await channel.send({ components: [row6] });

		if (guildName == 'ScriptCamp') {
			embed = new EmbedBuilder()
				.setTitle('Formats')
				.setDescription('What formats do you write?')
				.setColor('#9661FF')
				.setImage('https://cdn.discordapp.com/attachments/850826831216246844/1015339103421747200/unknown.png');
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('feature')
						.setLabel('Feature Films')
						.setEmoji('🎥')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('pilot')
						.setLabel('TV Pilots/Episodic')
						.setEmoji('📺')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('short')
						.setLabel('Short Films')
						.setEmoji('🎬')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('plays')
						.setLabel('Plays')
						.setEmoji('🎭')
						.setStyle(ButtonStyle.Primary),
				);
			row2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('novels')
						.setLabel('Novels')
						.setEmoji('📚')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('poetry')
						.setLabel('Poetry')
						.setEmoji('📝')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('nonfiction')
						.setLabel('Non-Fiction')
						.setEmoji('📰')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('shortstories')
						.setLabel('Short Stories')
						.setEmoji('📃')
						.setStyle(ButtonStyle.Primary),
				);

			await channel.send({ embeds: [embed], components: [row, row2] });

			embed = new EmbedBuilder()
				.setTitle('Genres')
				.setDescription('What genres do you write?')
				.setColor('#FFBF00')
				.setImage('https://images-ext-2.discordapp.net/external/TqhHQu1BhnM1iYA7HAQm_zkQT3QRUXLi42aEpvMpJDg/%3Fitok%3DTeQKvRWw/https/nofilmschool.com/sites/default/files/styles/facebook/public/tv-and-film-genres_1.jpg?width=1193&height=671');
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('action')
						.setLabel('Action')
						.setEmoji('⚔️')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('animation')
						.setLabel('Animation')
						.setEmoji('🐭')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('comedy')
						.setLabel('Comedy')
						.setEmoji('😂')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('crime')
						.setLabel('Crime')
						.setEmoji('🚓')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('darkcomedy')
						.setLabel('Dark Comedy')
						.setEmoji('🃏')
						.setStyle(ButtonStyle.Primary),
				);
			row2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('drama')
						.setLabel('Drama')
						.setEmoji('<:oscar:851176323720020019>')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('dramedy')
						.setLabel('Dramedy')
						.setEmoji('👀')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('fantasy')
						.setLabel('Fantasy')
						.setEmoji('🏰')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('historical')
						.setLabel('Historical')
						.setEmoji('⏳')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('horror')
						.setLabel('Horror')
						.setEmoji('😱')
						.setStyle(ButtonStyle.Primary),
				);
			row3 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('musical')
						.setLabel('Musical')
						.setEmoji('🎵')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('mystery')
						.setLabel('Mystery')
						.setEmoji('🔍')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('playwriting')
						.setLabel('Playwriting')
						.setEmoji('🎭')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('psychological')
						.setLabel('Psychological Thriller')
						.setEmoji('⁉️')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('romance')
						.setLabel('Romance')
						.setEmoji('😘')
						.setStyle(ButtonStyle.Primary),
				);
			row4 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('scifi')
						.setLabel('Sci-Fi')
						.setEmoji('🛸')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('thriller')
						.setLabel('Thriller')
						.setEmoji('🕵️')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('western')
						.setLabel('Western')
						.setEmoji('🐎')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('family')
						.setLabel('Family/YA')
						.setEmoji('👪')
						.setStyle(ButtonStyle.Primary),
				);
			await channel.send({ embeds: [embed], components: [row, row2, row3, row4] });

			embed = new EmbedBuilder()
				.setTitle('Activities')
				.setDescription('Click to be notified when an activity is starting')
				.setImage('https://cdn.discordapp.com/attachments/850826831216246844/1015366330179932210/unknown.png')
				.setColor('#04FF00');
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('3pg')
						.setLabel('3 Page Challenge')
						.setEmoji('3️⃣')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('character')
						.setLabel('Character Prompt')
						.setEmoji('👤')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('picture')
						.setLabel('Picture Prompt')
						.setEmoji('🖼️')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('title')
						.setLabel('Title Prompt')
						.setEmoji('🍿')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('swap')
						.setLabel('Script Swap')
						.setEmoji('🔄')
						.setStyle(ButtonStyle.Secondary),
				);
			row2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('tablereads')
						.setLabel('Table Reads')
						.setEmoji(':tableread:961985603287801887')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('writersroom')
						.setLabel('Writers Room')
						.setEmoji('✍️')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('sprints')
						.setLabel('Writing Sprints')
						.setEmoji('🏃')
						.setStyle(ButtonStyle.Secondary),
				);
			await channel.send({ embeds: [embed], components: [row, row2] });

			embed = new EmbedBuilder()
				.setTitle('Groups')
				.setDescription('Click to join a writing group!')
				.setColor('#04FA00')
				.setImage('https://cdn.discordapp.com/attachments/850826831216246844/1015372546872451112/unknown.png');
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('groupAni')
						.setLabel('Animation Writers Group')
						.setEmoji('<:animation:991393657854898216>')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('groupFant')
						.setLabel('Fantasy Workshop')
						.setEmoji('🏰')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('groupHor')
						.setLabel('Horror Workshop')
						.setEmoji('👻')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('groupPilot')
						.setLabel('One Hour TV Pilots')
						.setEmoji('📺')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('groupSketch')
						.setLabel('Sketch Comedy Workshop')
						.setEmoji('😂')
						.setStyle(ButtonStyle.Secondary),
				);
			await channel.send({ embeds: [embed], components: [row] });

			embed = new EmbedBuilder()
				.setTitle('Groups')
				.setDescription('You can also apply to join the following groups!\n**Comedy Pilots Group:** https://forms.gle/bAbnM58cToqUhnKt7 \n**Advanced Lab:** https://forms.gle/w9LJcwqD3MsbYBny5')
				.setColor('#04FA00');
			await channel.send({ embeds: [embed] });
		} else if (guildName == 'CampMaster' || guildName == 'CampCamp' || guildName == "CodeCamp") {
			embed = new EmbedBuilder()
				.setTitle('Activities')
				.setDescription('Click to be notified when an activity is starting')
				.setColor('#043efe');
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('rubberducks')
						.setLabel('Rubber Ducks')
						.setEmoji('<:RubberDuck:1039249943501742090>')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('qotw')
						.setLabel('Question of the Week')
						.setEmoji('🤔')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('advent')
						.setLabel('Advent of Code')
						.setEmoji('🎄')
						.setStyle(ButtonStyle.Secondary),
				);
			await channel.send({ embeds: [embed], components: [row] });

			embed = new EmbedBuilder()
				.setTitle('Classes')
				.setDescription('Get notified when a class is starting')
				.setColor('#04ef3e');
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('cbfb')
						.setLabel('Coding Bootcamp for Beginners')
						.setEmoji('👶')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('webbootcamp')
						.setLabel('Website Bootcamp')
						.setEmoji('🌐')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('dbbootcamp')
						.setLabel('Database Bootcamp')
						.setEmoji('<:database:1034984756355530763>')
						.setStyle(ButtonStyle.Secondary),
				);
			await channel.send({ embeds: [embed], components: [row] });

			embed = new EmbedBuilder()
				.setTitle('Languages')
				.setDescription('What languages do you know and what would you like to learn?')
				.setColor('#04ef3e');
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('web')
						.setLabel('Web')
						.setEmoji('🌐')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('php')
						.setLabel('PHP')
						.setEmoji('<:PHP:1034984202241843290>')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('sql')
						.setLabel('SQL')
						.setEmoji('<:MySQL:1077625314139705416>')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('python')
						.setLabel('Python')
						.setEmoji('<:Python:1035238978833633290>')
						.setStyle(ButtonStyle.Secondary),
				);
			row2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('android')
						.setLabel('Android')
						.setEmoji('<:AndroidStudio:1035238869131591681>')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('xcode')
						.setLabel('xcode')
						.setEmoji('<:xcode:1035238787200069643>')
						.setStyle(ButtonStyle.Secondary),
				);
			row3 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('c')
						.setLabel('C')
						.setEmoji('<:C_:933752068940914728>')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('cpp')
						.setLabel('C++')
						.setEmoji('<:cpp:1038146753330937876>')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('csharp')
						.setLabel('C#')
						.setEmoji('<:cs:1038148103200571452>')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('java')
						.setLabel('Java')
						.setEmoji('<:Java:933752328211824690>')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('vb')
						.setLabel('Visual Basic')
						.setEmoji('<:VisualBasic:1038146171241234523>')
						.setStyle(ButtonStyle.Secondary),
				);
			await channel.send({ embeds: [embed], components: [row, row2, row3] });
		} else if (guildName == "ToonCamp") {
			embed = new EmbedBuilder()
				.setTitle('Specialities')
				.setDescription('What are your specialities?')
				.setColor('#04ef3e');
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('illustration')
						.setLabel('Illustration')
						.setEmoji('🎨')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('comics')
						.setLabel('Comics / Manga')
						.setEmoji('💬')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('storyboard')
						.setLabel('Storyboarding')
						.setEmoji('🎞️')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('animation')
						.setLabel('Animation')
						.setEmoji('📽️')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('sounddesign')
						.setLabel('Sound Design / Foley')
						.setEmoji('🔉')
						.setStyle(ButtonStyle.Secondary),
				);
			row2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('music')
						.setLabel('Music')
						.setEmoji('🎵')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('voiceacting')
						.setLabel('Voice Acting')
						.setEmoji('🎙️')
						.setStyle(ButtonStyle.Secondary),
				);
			await channel.send({ embeds: [embed], components: [row, row2] });
		}

		const topURL = 'https://discord.com/channels/' + guildId + '/' + channel.id + '/0';

		embed = new EmbedBuilder()
			.setTitle('Scroll to the top')
			.setDescription('Click the link above to scroll to the top of the channel!')
			.setColor('#ff0000')
			.setURL(topURL);
		await channel.send({ embeds: [embed] });
		logger.info(`Sent the roles message to #${channel.name} in ${guildName}. Initiated by ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`);
	},
};