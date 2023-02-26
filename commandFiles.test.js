/* eslint-disable no-undef */
const fs = require('node:fs');
const path = require('node:path');
let commandsPath, commandFiles;

let i = 0;
commandsPath = path.join(__dirname, 'commands/CampMaster');
// get all files in the commands folder that end with .js and do not start with an underscore
commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('._'));

for (const file of commandFiles) {
	console.log(file);
	i++;
}

test('number of CampMaster commands should be 1', () => {
	expect(i).toBe(1);
});

let j = 0;

commandsPath = path.join(__dirname, 'commands/SkillCamp');
// get all files in the commands folder that end with .js and do not start with an underscore
commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('._'));

for (const file of commandFiles) {
	console.log(file);
	j++;
}

test('number of SkillCamp commands should be 9', () => {
	expect(j).toBe(9);
});

let k = 0;

commandsPath = path.join(__dirname, 'commands/SkillCoin');
// get all files in the commands folder that end with .js and do not start with an underscore
commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('._'));

for (const file of commandFiles) {
	console.log(file);
	k++;
}

test('number of SkillCoin commands should be 7', () => {
	expect(k).toBe(7);
});