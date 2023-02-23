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

const { SlashCommandBuilder, EmbedBuilder, AutocompleteInteraction } = require('discord.js');

//const getEditableSkillCampMsg = require('../../classes/getEditableSkillCampMsg');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('macro')
		.setDescription('Send a set message')
		.addStringOption(option => option
			.setName('text')
			.setDescription('The text to be displayed in the poll')
			.setRequired(true)
			.setAutocomplete(true),
		),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const choices = [
			{
				name: 'SkillCamp',
				value: 'skillcamp',
			},
			{
				name: 'Coins',
				value: 'coins',
			},
		];
		let campChoices = [];

		if (interaction.guild.name === 'ScriptCamp') {
			campChoices = [
				{
					name: 'Writers Room',
					value: 'writersroom',
				},
				{
					name: 'The Black List',
					value: 'blacklist',
				},
				{
					name: 'Feedback',
					value: 'feedback',
				},
				{
					name: 'Writers Group',
					value: 'writersgroup',
				},
				{
					name: 'Script Swaps',
					value: 'scriptswaps',
				},
				{
					name: 'Action Scripts',
					value: 'action',
				},
				{
					name: 'Table Reads',
					value: 'tablereads',
				},
				{
					name: 'Writers Groups',
					value: 'groups',
				},
			];
		} else if (interaction.guild.name === 'CodeCamp') {
			campChoices = [
				{
					name: 'Rubber Ducks',
					value: 'rubberducks',
				},
				{
					name: 'Code Leaderboard',
					value: 'leaderboard',
				},
			];
		}

		campChoices.forEach(campChoice => {
			choices.push(campChoice);
		});
		const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({
				name: choice.name,
				value: choice.value,
			})),
		);
	},
	async execute(interaction) {
		let text = interaction.options.getString('text');
		const guildName = interaction.guild.name;
		let msg, embed, embed2;
		if (!text) {
			return interaction.reply({ content: 'Please provide the text to be displayed in the poll', ephemeral: true });
		}

		text = text.toLowerCase();

		if (text === 'coins') {
			embed = new EmbedBuilder()
				.setTitle(`Coins`)
				.setDescription(`ScriptCoins are rewards you earn by participating in classes and activities, or by giving helpful feedback on loglines and scripts posted in the feedback channels.\n\nTo check your balance type \`/balance\`\n\nTo see what you can buy with your coins type \`/store\``)
				.setColor('#00ff00');
		}

		if (guildName === 'ScriptCamp') {
			if (text === 'coins') {
				embed2 = new EmbedBuilder()
					.setTitle(`Ways to earn Coins`)
					.setDescription(`To earn more coins try scrolling up in the following channels and give some feedback:\n<#849044938524327987>\n<#874044524417155113> \n<#849045483926061087> \n<#929062395165417532>  \n\n**Written Feedback / Script Swaps**\nLogline Feedback (1)\nShorts/Scenes Feedback (2)\nFeature/Pilot Feedback (3)\nIf moderator notices amazing written feedback for a script (5)\n\n**Contests/Activities**\nWin daily picture prompt / char prompt (2)\nWin monthly 3 page challenge (10)\n\n**5 Page Table Reads**\nReading part (1)\nVerbal feedback  (2)\nIf moderator notices amazing feedback (3)\n\n**Feature/Pilot Table Reads**\nReading parts (2-4)\nVerbal feedback (4)\nIf moderator notices amazing feedback (7)\n\n**Classes**\nComplete Free Class Exercises (1)\nComplete a feature, pilot or full length play in a bootcamp (5)`)
					.setColor('#00ff00');
			} else if (text === 'writersroom') {
				embed = new EmbedBuilder()
					.setTitle(`Writer's Room`)
					.setDescription(`During each Writers Room session, we simply gather here to connect remotely and write together at the same time.This supports us in building a regular writing discipline.You are welcome to join us and see if this helps your writing process.\n\nThe Writers Room is open 24 / 7 and you can drop by at any time.\n\nPlease note that no one will read or critique your writing in this session.Writers Room sessions are a safe space for screenwriters to work on their craft.We gather here solely in order to chat or write during the scheduled time.\n\nGreat time to get started on a writing project, or refine your ideas for one of the upcoming bootcamps!\n\nSchedule:\n• First 10 minutes: Greetings & introductions / socializing\n• Remainder of the session: we write in quiet, with an hourly 10 minute break at the top of the hour. 50 minutes writing + 10 minutes chatting.\n• You can hop into the chat room or quiet room at any time.\n\nHow to join the Writers Room?\n• The Writers Room is free to join, everyone is welcome!\n• Just hit the RSVP button\n• Then hop in the voice channel here: https://discord.gg/KGyUqXu2dZ\n• Or join the quiet room here: https://discord.gg/snqjpdfXPv`);
			} else if (text === 'blacklist') {
				embed = new EmbedBuilder()
					.setTitle(`Blacklist`)
					.setDescription(`**The Black List** is an annual list of unproduced spec screenplays voted as "most liked" by creative execs, literary agents, producers, managers and assistants. To become a skilled screenwriter, Conor recommends to read as many of these as you can, ideally three each week.\n\nHere's a link to access over 1,000 black list scripts from the past several years on the Script Camp shared drive: https://drive.google.com/drive/folders/1eWCI5fvvIk67usd5nRlTzY6Vpdf-juIX\n\n440 of these spec scripts have been turned into produced films!`)
					.setImage('https://tisch.nyu.edu/content/dam/tisch/film-tvs/News/blacklist.jpg')
					.setColor('#FFE600');
			} else if (text === 'action') {
				embed = new EmbedBuilder()
					.setTitle(`ACTION SCREENPLAYS`)
					.setDescription(`Here's a link to access some recent pro scripts with lots of action scenes: https://drive.google.com/drive/folders/1aRi-wButkUobKNasb_lEHbvrmL4KXdYQ?usp=sharing`)
					.setImage('https://images-ext-1.discordapp.net/external/TWoA2vlH-r-qYiYKnMhWni0-57F7TGyxmYMBPAHk7V0/https/thecinemaholic.com/wp-content/uploads/2017/12/John-Wick-Chapter-2-poster1.jpg')
					.setColor('#FFCC00');
			} else if (text === 'tablereads') {
				embed = new EmbedBuilder()
					.setTitle(`ScriptCamp Table Reads`)
					.setDescription(`Sundays at 2pm (Pacific) 5pm (Eastern) 10pm (GMT), Table Readers around the world gather together to read and critique each other's work.\n\nHosting a table read lets you experience your script from an outside perspective and get real-world feedback from an actual audience. It can be hard to identify your script’s problems until you hear it read out loud.\n\n**__Submission Forms:__**\n⦁ 5 Pages: https://forms.gle/eWTvToafZduiT8aa7\n⦁ Complete Feature/Pilot (100 :coin: ScriptCoins to submit, type /coins for more info): https://forms.gle/h6PL66RBB8zS9Nie9`)
					.setImage('https://cdn.discordapp.com/attachments/850826831216246844/1001942476279513148/tablereads-wide.png')
					.setThumbnail('https://cdn.discordapp.com/attachments/850826831216246844/1002333853010116719/gold_black_large-circle.png')
					.setColor('#FFCC00');
			} else if (text === 'feedback') {
				embed = new EmbedBuilder()
					.setTitle(`Need feedback on your script?`)
					.setDescription(`Here are some excellent ways to get critiques:\n\n • Post your script in <#1022206350282989628>! You can post your complete features, pilots, script pages, outlines or loglines. Then read other people's scripts in the same channel and post your feedback. Most will reciprocate, plus you earn **ScriptCoins** for giving feedback. \n\n • Submit 5 pages to the **Table Reads:** <https://forms.gle/eWTvToafZduiT8aa7>\n\n • Submit a complete feature or pilot to the **Table Reads**: <https://forms.gle/h6PL66RBB8zS9Nie9>\n\n • Submit your script to the **Tuesday Script Swap,**: <https://forms.gle/FLfvu1KwMmaKB1ev7> \n\n • Submit your script to the **Wednesday Script Swap**: <https://forms.gle/8msGXdbCwWi4xdw39> \n\n • Join a **writers group** (type !group for more info)\n\n • Bring it to the **Writers Lab** (free with **Unlimited Script Camp** <https://scriptcamp.net/membership> or book individual sessions at <https://scriptcamp.net/classes> ).\n\n • Bring it to the **Advanced Lab** (free with **Unlimited Script Camp**) __Apply here to join:__ https://forms.gle/w9LJcwqD3MsbYBny5 \n\n • Book a **Script Consultation** from pro screenwriter Conor Kyle <https://scriptcamp.net/coverage> This a detailed analysis of your screenplay, where he marks up your entire script or outline and shows you how to fix the problems, with a 30 minute coaching session. (**$49 per script** for Unlimited members).\n\n • Bring your rewrite project to the **Feature Bootcamp** or **TV Pilot Bootcamp**!  Conor guides you through the process of writing or rewriting a complete feature or TV pilot screenplay in 6 to 8 weeks (Free with **Unlimited Script Camp**: <https://scriptcamp.net/membership>)`)
					.setImage('https://larryferlazzo.edublogs.org/files/2020/03/feedback_1583238216.png');
			} else if (text === 'group' || text === 'groups') {
				embed = new EmbedBuilder()
					.setTitle(`Who's looking for a writers group?`)
					.setDescription(`__**Sketch Comedy Group**__ meets Sundays 9am and 6pm (PDT). We trade feedback on our sketch projects and write a new sketch together each week! Join here: <#988184716089905262>\n\n__**Animation Writers Group**__ meets Mondays 5pm. We share our scripts for feedback, discuss animation writing techniques, animation project development and keep each other accountable on our goals. Join here: <#991377161728561252>\n\n__**Comedy Pilot Writers Group**__ meets Mon 12pm & Wed 7am. Let's support each other to achieve our writing goals as we develop comedy TV pilot projects. To join you should have already completed at least one pilot. __Apply here:__ https://forms.gle/bAbnM58cToqUhnKt7 \n\n__**Horror Writers Club**__ meets Tuesdays 6pm.  We trade feedback, support each other in developing our horror screenplays and discuss horror writing techniques. Join here: <#989919898979426307>\n\n__**Advanced Lab**__ meets Saturdays 10am & Sundays 7am. This is a place for advanced students and emerging writers to continue your journey, developing new projects on a regular basis and revising completed scripts. To join you should have a firm handle on screenwriting fundamentals, with multiple features or pilots completed. __Apply here:__ https://forms.gle/w9LJcwqD3MsbYBny5 \n\nOr you can fill out this form to request a new group: https://forms.gle/14LE2inpTnbtuJeMA`)
					.setImage('https://cdn.discordapp.com/attachments/850826831216246844/997539658911191091/unknown.png')
					.setColor('#007CFF');
			}
		}

		if (guildName === 'CodeCamp') {
			if (text === "rubberducks") {
				embed = new EmbedBuilder()
					.setTitle(`Rubber Ducks`)
					.setDescription(`Rubber Ducks is a place where computer programmers gather from all over the world to work independently. We join here regularly to help each other as we run into issues and need help.\n\nThe Rubber Ducks is open 24/7 even if the event isn't running. When an event is showing in Discord, it means that at least one person is guarenteed to be in the voice channel.\n\nUse the <#1035021974482735124> channel if you want help or want to give help. If you'd prefer to work in silence, either use Discord's deafen function or move to <#1035636906442100756>.\n\n*Why is this channel called Rubber Ducks?*\nThe Rubber Ducks is named after a programming technique called Rubber Duck Debugging. The idea is that you explain your problem to a rubber duck, and in the process you find the solution.`)
					.setColor('#00ff00')
					.setImage('https://cdn.discordapp.com/attachments/1031273913516306542/1044304711005778041/rdcc-wide.png')
					.setThumbnail('https://cdn.discordapp.com/attachments/1031273913516306542/1077196485483040818/codecampround.png');
			} else if (text === "leaderboard" || text === "wakatime") {
				embed = new EmbedBuilder()
					.setTitle(`Code Leaderboard`)
					.setDescription('See how much time your spending working on code with [WakaTime](https://wakatime.com/leaders/sec/bc3674e0-ec0b-4b1d-b698-f318c30d0a7f/join/vkgvtpiula). Add the integration to your code editors and see how much time you spend working on projects.')
					.setColor('#29333A')
					.setImage('https://wakatime.com/static/img/wakatime.svg');
			}
		}
		await interaction.reply({ embeds: [embed] });
		if (embed2 != "" && embed2 != undefined) {
			await interaction.followUp({ embeds: [embed2] });
		}
	},
};