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

// searches the message for indication of heh
client.on('message', message => {
	if(message.author.bot) return;
	// any variation of 'heh', including spaced ie 'h e h'
	if(message.content.toLowerCase().includes('heh') || message.content.toLowerCase().includes('h e h')) {
		message.channel.send('nice.');
		// search if user is in database, if not make one, if true update
		try{
			if(User.find({
				userId: message.author.id,
			}).count() > 0) {
				return User.findByIdAndUpdate({
					score: { $inc: { seq: 1 } },
				}, function(err) {
					if(err) {
						message.channel.send('There was an error, reach out to Lyndexer');
					}
					else {
						return;
					}
				});
			}
			else {
				const user = new User({
					userId: message.author.id,
					score: 1,
				});
				user.save();
			}
		}
		catch(err) {
			console.error(err);
		}
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
		try{
			User.findOne({
				userId: message.author.id,
			}, function(err, user) {
				if(err) {
					message.channel.send('Nothing personal kid, but you don\'t have a score to share!');
				}
				else {
					message.channel.send(`${message.author.username}\nTotal: ${user.score}\nDegen Level: ${'insert level system here'}`);
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
			const taggedId = client.users.cache.find(taggedUser).id;
			console.log(taggedUser);
			console.log(taggedId);
			User.findOne({
				userId: taggedId,
			}, function(err, user) {
				if(err) {
					message.channel.send('That user has no score!');
				}
				else {
					message.channel.send(`${taggedUser.username}\nTotal: ${user.score}\nDegen Level: ${'insert level system here'}`);
				}
			});
		}
		catch(err) {
			console.error(err);
		}
	}
});

client.login(process.env.BOT_TOKEN);