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

const { guildData } = require('../../data/guildData.json');
const SkillCampGuildIds = guildData.guildIDs;

module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		if (!interaction.isButton()) return;
		if (env == "development") {
			interaction.reply({ content: 'This command is disabled in development mode', ephemeral: true });
			return;
		}

		// open json file
		const fs = require('fs');
		const path = require('path');

		function roleRequest(roleName, interaction) {
			let role = interaction.guild.roles.cache.find(role => role.name === roleName);
			if (!role) {
				role = interaction.guild.roles.cache.find(role => role.name === roleName.toLowerCase());
			}
			if (!role) {
				interaction.reply({ content: `Role "${roleName}" not found`, ephemeral: true });
				logger.error(`Role not found: ${roleName} in ${interaction.guild.name}`);
				// create role
				interaction.guild.roles.create({
						name: roleName,
				}).then(role => {
					interaction.member.roles.add(role);
					interaction.editReply({ content: `You have been given the ${role} role`, ephemeral: true });
				}).catch(error => {
					logger.error(error);
					interaction.editReply({ content: 'Something went wrong', ephemeral: true });
				});
				return;
			} else {
				try {
					if (interaction.member.roles.cache.has(role.id)) {
						interaction.member.roles.remove(role);
						interaction.reply({ content: `You have been removed from the ${role} role`, ephemeral: true });
					} else {
						interaction.member.roles.add(role);
						interaction.reply({ content: `You have been given the ${role} role`, ephemeral: true });
					}
				} catch (error) {
					logger.error(error);
					interaction.reply({ content: 'Something went wrong', ephemeral: true });
				}
			}
		}

		if (interaction.customId == 'BCpollYes' || interaction.customId == 'BCpollNo' || interaction.customId == 'BCpollMaybe' || interaction.customId == 'BCpollQuestions') {
			let { BootcampPollData } = require('../../data/bootcampPoll.json');
			BootcampPollData = JSON.parse(BootcampPollData);

			// get guild id
			const guildId = interaction.guild.id;
			if (!SkillCampGuildIds.includes(guildId)) {
				return;
			}
			let channel, message, numbers;
			if (guildId == guildData.CodeCamp.guildId) {
				channel = interaction.guild.channels.cache.get('1073622067196481667');
				message = channel.messages.fetch('1074132703017975868');
			} else if (guildId == guildData.CampMaster.guildId) {
				channel = interaction.guild.channels.cache.get('1075113750924898324');
				message = channel.messages.fetch('1075114480742178877');
			}

			if (BootcampPollData.yes.includes(interaction.user.id)) {
				// remove user from yes
				BootcampPollData.yes.splice(BootcampPollData.yes.indexOf(interaction.user.id), 1);
			}

			if (BootcampPollData.no.includes(interaction.user.id)) {
				// remove user from no
				BootcampPollData.no.splice(BootcampPollData.no.indexOf(interaction.user.id), 1);
			}

			if (BootcampPollData.maybe.includes(interaction.user.id)) {
				// remove user from maybe
				BootcampPollData.maybe.splice(BootcampPollData.maybe.indexOf(interaction.user.id), 1);
			}

			if (BootcampPollData.questions.includes(interaction.user.id)) {
				// remove user from questions
				BootcampPollData.questions.splice(BootcampPollData.questions.indexOf(interaction.user.id), 1);
			}

			// add data to json file
			if (interaction.customId == 'BCpollYes') {
				if (!BootcampPollData.yes.includes(interaction.user.id)) {
					BootcampPollData.yes.push(interaction.user.id);
				}
			} else if (interaction.customId == 'BCpollNo') {
				if (!BootcampPollData.no.includes(interaction.user.id)) {
					BootcampPollData.no.push(interaction.user.id);
				}
			} else if (interaction.customId == 'BCpollMaybe') {
				if (!BootcampPollData.maybe.includes(interaction.user.id)) {
					BootcampPollData.maybe.push(interaction.user.id);
				}
				BootcampPollData.maybe.push(interaction.user.id);
			} else if (interaction.customId == 'BCpollQuestions') {
				if (!BootcampPollData.questions.includes(interaction.user.id)) {
					BootcampPollData.questions.push(interaction.user.id);
				}
			}

			interaction.reply({ content: 'Your response has been recorded', ephemeral: true });

			let content = "Bootcamp Poll Responses\n\n";
			content += "**Yes:** *" + BootcampPollData.yes.length + "*\n";
			BootcampPollData.yes.forEach((user) => {
				content += "<@" + user + ">\n";
			});
			content += "\n**No:** *" + BootcampPollData.no.length + "*\n";
			BootcampPollData.no.forEach((user) => {
				content += "<@" + user + ">\n";
			});
			content += "\n**Maybe:** *" + BootcampPollData.maybe.length + "*\n";
			BootcampPollData.maybe.forEach((user) => {
				content += "<@" + user + ">\n";
			});
			content += "\n**Questions:** *" + BootcampPollData.questions.length + "*\n";
			BootcampPollData.questions.forEach((user) => {
				content += "<@" + user + ">\n";
			});
			content += "\n**Total:** *" + (BootcampPollData.yes.length + BootcampPollData.no.length + BootcampPollData.maybe.length + BootcampPollData.questions.length) + "*";

			// update message
			message.then((msg) => {
				msg.edit(content);
			});

			// save data to json file
			fs.writeFile(path.join(__dirname, '../../data/bootcampPoll.json'), JSON.stringify("\"BootcampPollData\": {" + BootcampPollData + "}", 4, 2), (err) => {
				if (err) {
					logger.error(err);
				}
			});
		} else {
			const guildName = interaction.guild.name;
			const user = interaction.user;
			const buttonID = interaction.customId;

			if (buttonID == "he") {
				roleRequest("He/Him", interaction);
			} else if (buttonID == "she") {
				roleRequest("She/Her", interaction);
			} else if (buttonID == "they") {
				roleRequest("They/Them", interaction);
			} else if (buttonID == "UK") {
				roleRequest("UK", interaction);
			} else if (buttonID == "la") {
				roleRequest("Los Angeles", interaction);
			} else if (buttonID == "ny") {
				roleRequest("New York", interaction);
			} else if (buttonID == "bay") {
				roleRequest("Bay Area", interaction);
			} else if (buttonID == "eastcoast") {
				roleRequest("US-Eastern", interaction);
			} else if (buttonID == "central") {
				roleRequest("US-Central", interaction);
			} else if (buttonID == "mountain") {
				roleRequest("US-Mountain", interaction);
			} else if (buttonID == "pacific") {
				roleRequest("US-Pacific", interaction);
			} else if (buttonID == "states") {
				roleRequest("US-Alaska/Hawaii", interaction);
			} else if (buttonID == "eu") {
				roleRequest("Europe", interaction);
			} else if (buttonID == "uk") {
				roleRequest("UK", interaction);
			} else if (buttonID == "ireland") {
				roleRequest("Ireland", interaction);
			} else if (buttonID == "italy") {
				roleRequest("Italy", interaction);
			} else if (buttonID == "france") {
				roleRequest("France", interaction);
			} else if (buttonID == "germany") {
				roleRequest("Germany", interaction);
			} else if (buttonID == "spain") {
				roleRequest("Spain", interaction);
			} else if (buttonID == "portugal") {
				roleRequest("Portugal", interaction);
			} else if (buttonID == "canada") {
				roleRequest("Canada", interaction);
			} else if (buttonID == "mexico") {
				roleRequest("Mexico", interaction);
			} else if (buttonID == "latinam") {
				roleRequest("Latin America", interaction);
			} else if (buttonID == "brazil") {
				roleRequest("Brazil", interaction);
			} else if (buttonID == "asia") {
				roleRequest("Asia", interaction);
			} else if (buttonID == "africa") {
				roleRequest("Africa", interaction);
			} else if (buttonID == "australia") {
				roleRequest("Australia", interaction);
			} else if (buttonID == "nz") {
				roleRequest("New Zealand", interaction);
			} else if (buttonID == "india") {
				roleRequest("India", interaction);
			} else if (buttonID == "japan") {
				roleRequest("Japan", interaction);
			} else if (buttonID == "china") {
				roleRequest("China", interaction);
			} else if (buttonID == "korea") {
				roleRequest("Korea", interaction);
			} else if (buttonID == "russia") {
				roleRequest("Russia", interaction);
			} else if (buttonID == "ukraine") {
				roleRequest("Ukraine", interaction);
			} else if (buttonID == "middleeast") {
				roleRequest("Middle East", interaction);
			} else if (buttonID == "argentina") {
				roleRequest("Argentina", interaction);
			} else if (buttonID == "chile") {
				roleRequest("Chile", interaction);
			} else if (buttonID == "colombia") {
				roleRequest("Colombia", interaction);
			} else if (buttonID == "scandinavia") {
				roleRequest("Scandinavia", interaction);
			} else if (buttonID == "netherlands") {
				roleRequest("Netherlands", interaction);
			} else if (buttonID == "sweden") {
				roleRequest("Sweden", interaction);
			} else if (buttonID == "norway") {
				roleRequest("Norway", interaction);
			} else if (buttonID == "denmark") {
				roleRequest("Denmark", interaction);
			} else if (buttonID == "finland") {
				roleRequest("Finland", interaction);
			} else if (buttonID == "poland") {
				roleRequest("Poland", interaction);
			}

			if (guildName == "ScriptCamp") {
				if (buttonID == "feature") {
					roleRequest("Feature Films", interaction);
				} else if (buttonID == "pilot") {
					roleRequest("TV", interaction);
				} else if (buttonID == "short") {
					roleRequest("Shorts", interaction);
				} else if (buttonID == "plays") {
					roleRequest("Playwriting", interaction);
				} else if (buttonID == "novels") {
					roleRequest("Novels", interaction);
				} else if (buttonID == "poetry") {
					roleRequest("Poetry", interaction);
				} else if (buttonID == "nonfiction") {
					roleRequest("Non-Fiction", interaction);
				} else if (buttonID == "shortstories") {
					roleRequest("Short Stories", interaction);
				} else if (buttonID == "action") {
					roleRequest("Action", interaction);
				} else if (buttonID == "animation") {
					roleRequest("Animation", interaction);
				} else if (buttonID == "comedy") {
					roleRequest("Comedy", interaction);
				} else if (buttonID == "crime") {
					roleRequest("Crime", interaction);
				} else if (buttonID == "darkcomedy") {
					roleRequest("Dark Comedy", interaction);
				} else if (buttonID == "drama") {
					roleRequest("Drama", interaction);
				} else if (buttonID == "dramedy") {
					roleRequest("Dramedy", interaction);
				} else if (buttonID == "fantasy") {
					roleRequest("Fantasy", interaction);
				} else if (buttonID == "horror") {
					roleRequest("Horror", interaction);
				} else if (buttonID == "musical") {
					roleRequest("Musical", interaction);
				} else if (buttonID == "mystery") {
					roleRequest("Mystery", interaction);
				} else if (buttonID == "playwriting") {
					roleRequest("Playwriting", interaction);
				} else if (buttonID == "psychological") {
					roleRequest("Psychological Thriller", interaction);
				} else if (buttonID == "romance") {
					roleRequest("Romance", interaction);
				} else if (buttonID == "scifi") {
					roleRequest("SciFi", interaction);
				} else if (buttonID == "thriller") {
					roleRequest("Thriller", interaction);
				} else if (buttonID == "western") {
					roleRequest("Western", interaction);
				} else if (buttonID == "family") {
					roleRequest("Family/YA", interaction);
				} else if (buttonID == "3pg") {
					roleRequest("3 Page Challenge", interaction);
				} else if (buttonID == "character") {
					roleRequest('Character Prompter', interaction);
				} else if (buttonID == "picture") {
					roleRequest('PicturePrompter', interaction);
				} else if (buttonID == "title") {
					roleRequest('TitlePrompter', interaction);
				} else if (buttonID == "swap") {
					roleRequest('ScriptSwapper', interaction);
				} else if (buttonID == "tablereads") {
					roleRequest('Table Reader', interaction);
				} else if (buttonID == "writersroom") {
					roleRequest('WritersRoom', interaction);
				} else if (buttonID == "sprints") {
					roleRequest('Sprinter', interaction);
				} else if (buttonID == "groupAni") {
					roleRequest('AnimationGroup', interaction);
				} else if (buttonID == "groupFant") {
					roleRequest('FantasyWorkshop', interaction);
				} else if (buttonID == "groupHor") {
					roleRequest('HorrorWorkshop', interaction);
				} else if (buttonID == "groupPilot") {
					roleRequest('AnimationGroup', interaction);
				} else if (buttonID == "groupSketch") {
					roleRequest('SketchComedyWorkshop', interaction);
				}
			} else if (guildName == "CodeCamp" || guildName == "CampMaster") {
				if (buttonID == "rubberducks") {
					roleRequest('Rubber Ducks', interaction);
				} else if (buttonID == "qotw") {
					roleRequest('Question of the Week', interaction);
				} else if (buttonID == "advent") {
					roleRequest('Advent of Code', interaction);
				} else if (buttonID == "cbfb") {
					roleRequest('Coding Bootcamp for Beginners', interaction);
				} else if (buttonID == "webbootcamp") {
					roleRequest('Web Bootcamp', interaction);
				} else if (buttonID == "dbbootcamp") {
					roleRequest('Database Bootcamp', interaction);
				} else if (buttonID == "web") {
					roleRequest('Web', interaction);
				} else if (buttonID == "php") {
					roleRequest('PHP', interaction);
				} else if (buttonID == "sql") {
					roleRequest('SQL', interaction);
				} else if (buttonID == "python") {
					roleRequest('Python', interaction);
				} else if (buttonID == "java") {
					roleRequest('Java', interaction);
				} else if (buttonID == "csharp") {
					roleRequest('C#', interaction);
				} else if (buttonID == "cpp") {
					roleRequest('C++', interaction);
				} else if (buttonID == "c") {
					roleRequest('C', interaction);
				} else if (buttonID == "android") {
					roleRequest('Android', interaction);
				} else if (buttonID == "xcode") {
					roleRequest('Xcode', interaction);
				} else if (buttonID == "vb") {
					roleRequest('Visual Basic', interaction);
				}
			} else if (guildName == "ToonCamp") {
				if (buttonID == "illustration") {
					roleRequest('Illustration', interaction);
				} else if (buttonID == "comics") {
					roleRequest('Comics / Manga', interaction);
				} else if (buttonID == "storyboard") {
					roleRequest('Storyboarding', interaction);
				} else if (buttonID == "animation") {
					roleRequest('Animation', interaction);
				} else if (buttonID == "sounddesign") {
					roleRequest('Sound Design / Foley', interaction);
				} else if (buttonID == "voiceacting") {
					roleRequest('Voice Acting', interaction);
				} else if (buttonID == "music") {
					roleRequest('Music', interaction);
				}
			}
		}
	},
};