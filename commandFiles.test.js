const fs = require('node:fs');
const path = require('node:path');


const commandsPath = path.join(__dirname, 'commands/CampMaster');
// get all files in the commands folder that end with .js and do not start with an underscore
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('._'));

let i = 0;
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	console.log(`Loaded command: ${command.data.name}`.yellow);
	i++;
}

test('number of CampMaster commands should be 1', () => {
	expect(i).toBe(1);
});