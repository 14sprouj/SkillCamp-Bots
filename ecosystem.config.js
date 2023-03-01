module.exports = {
	apps: [
		{
			name: "CampMaster",
			script: "./campmaster.js",
			"watch": ["./commands/CampMaster/*.js", "./events/CampMaster/*.js", "campmaster.js"],
			"restart_delay": 1000,
			"time": true,
			"increment_var": "build",
		},
		{
			name: "SkillCamp",
			script: "./skillcamp.js",
			"watch": ["./commands/SkillCamp/*.js", "./events/SkillCamp/*.js", "skillcamp.js"],
			"restart_delay": 1000,
			"time": true,
			"increment_var": "build",
		},
		{
			name: "SkillCoin",
			script: "./skillcoin.js",
			"watch": ["./commands/SkillCoin/*.js", "./events/SkillCoin/*.js", "skillcoin.js"],
			"restart_delay": 1000,
			"time": true,
			"increment_var": "build",
		}
	],
};
