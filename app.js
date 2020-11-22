require('dotenv').config();
const { prefix } = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();
// MONGDB stuff
const mongoose = require('mongoose');
const mongoDB = process.env.MONGO_SECRET;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
const User = require('./user');

function degen(score) {
	let rank = '';
	switch(true) {
	case score < 5:
		rank = 'Weeny Boi';
		break;
	case score < 15:
		rank = 'Beany Boi';
		break;
	case score < 25:
		rank = 'Hakeem Hero';
		break;
	case score < 50:
		rank = 'Dillonstigator Expert';
		break;
	case score < 100:
		rank = 'GOT DAMN BOI';
		break;
	case score < 150:
		rank = 'Glhehzeey Gobbler';
		break;
	case score < 200:
		rank = 'God of Degenerates';
		break;
	default:
		rank = 'UwU';
	}
	return rank;
}

client.on('message', message => {
	if(message.author.bot) return;
	if(message.content === `${prefix}help`) {
		message.channel.send(`Here is a list of commands to play with:\n\`${prefix}hiscore\` - Pulls up a list of the top degenerates in this server\n\`${prefix}myscore\` - Pulls up your personal score\n\`${prefix}userscore\` - @someone to get their score`);
	}
});

// searches the message for indication of heh
client.on('message', message => {
	if(message.author.bot) return;
	// any variation of 'heh', including spaced ie 'h e h'
	if(message.content.toLowerCase().includes('heh') || message.content.toLowerCase().includes('h e h')) {
		message.channel.send('nice.');
		// search if user is in database, if not make one, if true update
		try{
			User.findOneAndUpdate({ userId: message.author.id },
				{ $inc: { score: 1 } },
				function(err, exists) {
					if(err) {console.error(err);}
					if(!exists) {
						const user = new User({
							userId: message.author.id,
							score: 1,
						});
						user.save();
					}
				});
		}catch(err) {
			console.error(err);
		}
	}
});

// command to get hi-scores list of top 5
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	if(message.content === `${prefix}hiscore`) {
		try {
			const result = db.collection('users').find().sort({ score: -1 }).limit(5);
			result.toArray(async function(err, user) {
				const userList = await Promise.all(user.map(async function(x) {
					const listOfUsers = await client.users.fetch(x.userId);
					return[listOfUsers ? listOfUsers.username : x.userId, x.score];
				}));
				let leaderboard = '**Leaderboard** \n';
				for(let i = 0; i < userList.length; i++) {
					if(i == 0) {
						leaderboard += `${i + 1} - ${userList[i][0]} [${ userList[i][1]}] points \n`;
					}else {
						leaderboard += `${i + 1} - ${userList[i][0]} [${ userList[i][1]}] points \n`;
					}
				}
				message.channel.send(`${leaderboard}`);
			});
		}catch(err) {
			console.error(err);
		}
	}
});

// command to get self called individual user info
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	if(message.content === `${prefix}myscore`) {
		try{
			User.findOne({
				userId: message.author.id,
			}, function(err, user) {
				if(!user) {
					message.channel.send('Nothing personal kid, but you don\'t have a score to share!');
				}else {
					message.channel.send(`${message.author.username}\nTotal: ${user.score}\nDegen Level: ${degen(user.score)}`);
				}
			});
		}catch(err) {
			console.error(err);
		}
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
		try {
			const taggedUser = message.mentions.users.first();
			User.findOne({
				userId: taggedUser.id,
			}, function(err, user) {
				if(err) { console.error(err);}
				if(!user) {
					message.channel.send('That user has no score!');
				}else {
					message.channel.send(`${taggedUser.username}\nTotal: ${user.score}\nDegen Level: ${degen(user.score)}`);
				}
			});
		}catch(err) {
			console.error(err);
		}
	}
});

// Easter Egg stuff
client.on('message', message => {
	if(message.author.bot) return;
	const easterEgg = Math.random();
	if(message.content) {
		if(easterEgg <= 0.01) {
			message.channel.send('"Heh isn\'t something you throw out lightly. It is a cold dark phrase that destroys the humanity of a child\'s wonder. No one knows why heh was necessary, but we do know that your opinions do not matter. They will not matter and in the game of life, you have lost."');
		}else if(easterEgg <= 0.05) {
			message.channel.send('heh');
		}
	}
});

client.login(process.env.BOT_TOKEN);