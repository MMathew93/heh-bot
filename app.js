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

// console.log signifies when bot is running
client.once('ready', () => {
	console.log('Ready!');
});

function degen(score) {
	return score < 5 ? 'Weeny Boi'
		: score < 15 ? 'Beany Boi'
			: score < 25 ? 'Hakeem Hero'
				: score < 50 ? 'Dillonstigator Expert'
					: score < 100 ? 'GOT DAMN BOI'
						: score < 150 ? 'God of Degenerates' : 'UwU';
}

async function getList() {
	const result = await db.collection('users').find().sort({ score: -1 }).limit(5);
	return result.toArray(async function(err, user) {
		return console.log(user);
	});
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
			User.updateOne({ userId: message.author.id },
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
		}
		catch(err) {
			console.error(err);
		}
	}
});

// command to get hi-scores list of top 5
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	if(message.content === `${prefix}hiscore`) {
		try {
			getList();
			const leaderboard = '**Leaderboard** \n';
			message.channel.send(`${leaderboard}`);
		}
		catch(err) {
			console.error(err);
		}
		/* const username = client.users.cache.get(user.userId);
		if(username) {
			message.channel.send(username.tag);
		}
		console.log(username);*/
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
				if(err) {
					message.channel.send('Nothing personal kid, but you don\'t have a score to share!');
				}
				else {
					message.channel.send(`${message.author.username}\nTotal: ${user.score}\nDegen Level: ${degen(user.score)}`);
				}
			});
		}
		catch(err) {
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
				}
				else {
					message.channel.send(`${taggedUser.username}\nTotal: ${user.score}\nDegen Level: ${degen(user.score)}`);
				}
			});
		}
		catch(err) {
			console.error(err);
		}
	}
});

client.login(process.env.BOT_TOKEN);