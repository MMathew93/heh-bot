require('dotenv').config();
const { prefix } = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();

// console.log signifies when bot is running
client.once('ready', () => {
	console.log('Ready!');
});

// searches the message for indication of heh
client.on('message', message => {
	if(message.author.bot) return;
	// any variation of 'heh', including spaced ie 'h e h'
	if(message.content.toLowerCase().includes('heh') || message.content.toLowerCase().includes('h e h')) {
		message.channel.send('nice.');
	}
});

// command to get hi-scores list of top 5
client.on('message', message => {
	if(message.author.bot) return;
	if(message.content === `${prefix}hiscore`) {
		const list = client.guilds.cache.get(message.guild.id);
		list.members.cache.forEach(member => console.log(member.user.username));
	}
});

// command to get self called individual user info
client.on('message', message => {
	if(message.content === `${prefix}myscore`) {
		message.channel.send(`${message.author.username}\nTotal: ${'insert saved data here'}\nDegen Level: ${'insert level system here'}`);
	}
});

// command to get another users info score
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
	if(command === 'userscore') {
		if(!message.mentions.users.size) {
			return message.channel.send(`You didn't specify a user in this discord, ${message.author}!`);
		}
		const taggedUser = message.mentions.users.first();
		message.channel.send(`${taggedUser.username}\nTotal: ${'insert saved data here'}\nDegen Level: ${'insert level system here'}`);
	}
});

client.login(process.env.BOT_TOKEN);