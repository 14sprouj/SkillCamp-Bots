module.exports = {
	apps: [
		{
			name: "CampMaster",
			script: "./campmaster.js",
			"watch": ["./commands/CampMaster", "./events/CampMaster", "campmaster.js"],
			"restart_delay": 1000,
			"time": true,
			"increment_var": "build",
		},
		{
			name: "SkillCamp",
			script: "./skillcamp.js",
			"watch": ["./commands/SkillCamp", "./events/SkillCamp", "skillcamp.js"],
			"restart_delay": 1000,
			"time": true,
			"increment_var": "build",
		},
		{
			name: "SkillCoin",
			script: "./skillcoin.js",
			"watch": ["./commands/SkillCoin", "./events/SkillCoin", "skillcoin.js"],
			"restart_delay": 1000,
			"time": true,
			"increment_var": "build",
		}
	],
};
