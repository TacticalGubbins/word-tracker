//hmmmmm

//Discord.js Library initialization
const {MessageAttachment, MessageEmbed, MessageCollector} = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client();

//extra libraries
const fs = require('fs');
const colors = require('colors');
const math = require('math');
const mysql = require('mysql');

//command line interface
const { exec } = require("child_process");

//Command handler. This goes through the command folder and stores the commands in json objects which can be called later
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

//config.json has the bot's key and the key for DBLapi
const config = require("../config.json");
//changelog.json stores the changes made in a json format for easy of use with the n!changelog command
const changelog = require("./changelog.json");
//achievements.json stores the achievements and their properties as json objects
// const achievements = require('./achievements.json');
const allEmbeds = require("./embeds.js");

const joinEmbed = allEmbeds.joinEmbed;

//invite code for inviting the bot to your discord server. Stored in a variable for more readable code
const invLink = 'https://discordapp.com/oauth2/authorize?client_id=730199839199199315&scope=bot&permissions=392257';
//server invite code for joining the bot's support server. Stored in a varible for the same reason as the last one.
const discordLink = 'https://discord.gg/Z6rYnpy';
//A link to the Discord Bot List website so people can vote for the bot if they like it. Stored in a varible for the same reason as the last one.
const voteLink = 'https://top.gg/bot/730199839199199315/vote';

//Stores the version number for the changelog function and info function
const version = '3.9.5';

//version number: 1st = very large changes; 2nd = new features; 3rd = bug fixes and other small changes;
const botID = '687077283965567006';
//default settings variables for when a server is created in the database
const defaultStrings = ["bruh", "nice", "bots", "cow"];
const defaultCooldownTime = 30;
const defaultPrefix = 'n!';

//data.json stores the "ogs" and the current pp length
var data = require("./data.json");

//variables relating to users-------------------------------------

//initializing the variable that flags if the user sent and trackable words
var checkIfShouldWrite = false;

//for changing status
var stat = 0;

//number of words the user has sent
var numWords = 0;

//stores the date in a variable
var d = new Date();
//stores the shard id as a global variable
var shardId;

//stores the databases connection information
const con = mysql.createConnection({
  host: '127.0.0.1',
  user: config.databaseUser,
  password: config.databasePass,
  database: 'data',
  supportBigNumbers: true
});

//bot will attempt to connect to the database with the provided information
con.connect(function (err) {
  if(err) {
    return console.log('error: ' + err.message);
  }
    console.log('Connected to the database');
});

//OBJECTS************************
const logging = {
  info: function(text) {
    console.log('INFO'.bgGreen.black + ' ' + text);
  },
  warn: function(text) {
    console.log('WARN'.bgYellow.black + ' ' + text);
  },
  error: function(text) {
    console.log('ERROR'.bgRed.black + ' ' + text);
  },
  debug: function(text) {
    console.log('DEBUG'.bgBlue + ' ' + text);
  }
}
//***************************

//runs with the bot starts up
client.on('ready', () => {
  console.log("BOT ONLINE");

	//states version upon startup in the bot's status
  client.user.setActivity(`v${version}`, {type : 'STREAMING'})
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`));

	//alternates displaying n!help for help and the total amount of words tracked ever in the bot's status
	//it will also sometimes display the "ppLength" variable. I know this is immature but its funny. gotta have some fun with the code you know?
  setInterval(() => {
    if(stat === 0) {
      client.user.setActivity(`n!help for help`, {type : 'PLAYING'});
      stat = 1;
    }
    else if(stat === 1) {
      con.query("SELECT SUM(words) AS words FROM users", (err, total) => {
        client.user.setActivity(`${total[0].words} words`, {type : 'WATCHING'});
      });
      stat = Math.floor(Math.random() * Math.floor(20));
      if(stat === 1 || stat > 2) {
        stat = 0;
      }
    }
    else if(stat === 2) {
        client.user.setActivity(`with my ${data.ppLength} pp`, {type : 'PLAYING'});
        stat = 0;
    }
    write(data);

  }, 10000);

		setInterval(async () => {
			//gets the user cache from the other shards
			let results = await client.shard.fetchClientValues('users.cache');

			results.forEach((users) => {
				users.forEach((user) => {
					// combines the existing cache with the new caches from the shards
					client.users.cache.set(user.id, new Discord.User(client, user));
				});
			});
		}, 60000);
});

client.on("guildCreate", async (guild) => {
  await guild.systemChannel.send(joinEmbed);
	//add something to update all of the shards' caches
});

process.on("message", message => {
    if (!message.type) return false;

    if (message.type == "shardId") {
        console.log(`The shard id is: ${message.data.shardId}`);
				shardId = message.data.shardId;
    };
});

let recentMessage = new Set();

//runs everytime a message is sent
client.on("message", async (message) => {

  //ignore messages sent by bots
  if(message.author.bot ) return;

	//anti-spamming for consective messages
	if(recentMessage.has(message.author.id)) return;

	recentMessage.add(message.author.id);

	setTimeout(() => {
		recentMessage.delete(message.author.id);
	}, 1000);

	//splits the sentence into an array, splitting at spaces
	let args = message.content.split(" ");
	args = args.filter(item => !!item);
  //ignore messages sent in dms
  if(message.channel.type === 'dm' && (message.content.toLowerCase().startsWith("n!help") || message.content.toLowerCase().startsWith("help")) && args[1] === undefined) {
		const helpEmbed = new MessageEmbed()
	  .setTitle('Bot Help')
	  .setColor(0xBF66E3)
	  .setDescription('')
	  .setFooter('For private server:\n\ngetverify: retrieves current verify code')
	  .addField('Donations','If you like the bot and would like to donate you can here: https://www.patreon.com/Cyakat')
	  .addField('n!' + 'help', 'Gives you this message', true)
	  .addField('Support Server', 'You can join the support server [here](' + discordLink + ')', true)
	  .addField('Commands', '----')
	  .addField('n!' + 'check', 'Checks the # of words sent by a user', true)
	  // .addField('n!' + 'count', 'Same as **n!check**', true)
	  .addField('n!' + 'total', 'Retrieves the total amount of words recorded', true)
	  .addField('n!' + 'top', 'Gives info about top-sending user', true)
	  .addField('n!' + 'leaderboard', 'Retrieves the top 10 users in a server', true)
	  .addField('n!' + 'global', 'Retrieves the top 10 sending users world-wide', true)
	  .addField('n!' + 'delete', '**Permanently** deletes all data regarding words counted in a server', true)
	  .addField('n!' + 'info', 'Gives info about the bot', true)
	  .addField('n!' + 'invite', 'Gives you [this link](' + invLink + ')', true)
	  //.addField('n!' + 'transferData', '(transfer) Transfer your data from the original N-Word (Only works in __one__ server, this is non-reversible)', true)
	  .addField('n!' + 'changelog', 'Shows the changelog for the specified version and if no version is specified the lastest changelog will be shown', true)
	  // .addField('n!' + 'achievements', '(ach) Shows which achievements you or the specified person have earned. The bot will DM you if you check yourself', true)
	  .addField("Server Setup", "----")
	  .addField('n!' + "settings", "View all current server settings", true)
	  .addField('n!' + 'triggers', 'Starts setup in order to change countable words', true)
	  .addField('n!' + 'cooldown', 'Change the server cooldown for counted words', true)
	  .addField('n!' + 'prefix', '(prefix) Changes the prefix for the server', true)
	  ;

		await message.channel.send(helpEmbed);

    return;
  }
	else if(message.channel.type === 'dm') {
		return;
	}

  //query retrieves the prefix from the server that the message was sent in
  con.query('SELECT id, prefix FROM servers WHERE id = ' + message.guild.id, async (err, prefixResponse) => {
		try {
			prefix = prefixResponse[0].prefix;
		}
		catch(err) {
			prefix = defaultPrefix;

			if(prefixResponse[0] === undefined) {
				con.query("INSERT IGNORE INTO servers (id, prefix, cooldown, strings) VALUE (" + message.guild.id + ", '"+ defaultPrefix +"', "+ defaultCooldownTime +", '"+ defaultStrings +"')");
				logging.info("Created new server!");
			}
		}

		try{
			var commandName = args[0].replace(prefix,'');
		}
		catch (err) {}

		if(message.content.startsWith(prefix))
		{
			try {
				let arguments = {version, voteLink, data, changelog, discordLink, invLink, args, prefix, shardId};
				await client.commands.get(commandName).execute(message, Discord, client, con, arguments);
			} catch (error) {}
			return;
		}

		//this whole chunk counts the words sent in the message and ups the counter of the user in the database
    let words = message.content.split(/[s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
    words = words.filter(item => !!item);


		//this set of queries gets all of the appropriate user and server information necessary for tracking the words of the user
    con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild.id, (err, server) => {
      con.query('SELECT cooldown, words FROM users WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id, (err2, user) => {

				if (user[0].cooldown > Date.now()) {
					return;
				}
				//tries to put the tracked words of a server into the wordArgs variable and will provide the default words if it fails.
        try {
          wordArgs = server[0].strings.split(/[s ,]/);
        }
        catch(err) {
          wordArgs = defaultStrings;
          try {
						con.query("INSERT IGNORE INTO servers (id, prefix, cooldown, strings) VALUE (" + message.guild.id + ", "+ defaultPrefix +", "+ defaultCooldownTime +", "+ defaultStrings +")");
					}
					catch(err){};
        }

				let numWords

				//this is a child process that runs a python script and gets the output to store in the database
				//the python script does the message processing and word counting that the bot prefiously did on its own.
				//hopefully this python script will execute on a different thread and allow the bot to still respond even after recieving a barage of messages
				exec("bash ./exec.sh wordCount.py " + "\"" + words + "\" " + "\"" + server[0].strings + "\"" , (error, stdout, stderr) => {
		      if (error) {
		          console.log(`error: ${error.message}`);
		          return;
		      }
		      if (stderr) {
		          console.log(`stderr: ${stderr}`);
		          return;
		      }
					//takes the output from the commandline and stores it in an appropriate variable
					numWords = parseInt(stdout);

					//this query will add a user to the database if they do not exist already
					if (user[0] === undefined){
						con.query('INSERT IGNORE INTO users (id, server_id, cooldown, words) value (' + message.author.id +', ' + message.guild.id + ', 0, 0)');
						logging.info("Created new user!");
					}
					//this if statement checks to see if a tracked word has been sent at all. If it has it obtain the cooldown time set in the server
	        if(numWords > 0) {
	          let cooldownTime
						//if the server does not have a cooldown time i.e. the server is not in the database it will try to create an entry
	          try {
	            cooldownTime = server[0].cooldown;
	          }
	          catch(err)
	          {
	            cooldownTime = defaultCooldownTime;
	            try {
								con.query('INSERT IGNORE INTO servers (id, prefix, cooldown, strings) VALUE (' + message.guild.id + ', '+ defaultPrefix +", "+ defaultCooldownTime +", "+ defaultStrings +")");
							}
							catch(err){};
	          }
	          checkIfShouldWrite = false;

						//if this is the first time a user has a sent a tracked word in that server it will create a new entry in the users database.
						//if the users exists in the database it will add the number of words sent in the message to the users current amount
						if(user[0] === undefined) {
							con.query('UPDATE users SET words = ' + (0 + numWords) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
						}
						else {
	          	con.query('UPDATE users SET words = ' + (parseInt(user[0].words) + numWords) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
						}
						//if the user has sent more than five words, add the cooldown time in seconds to the current epoch time and store it in the database
	          if(numWords >= 5) {
	            con.query('UPDATE users SET cooldown = ' + (Date.now() + ((server[0].cooldown) * 1000)) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
	          }
	        }
				});
      });
    });
  });
});

//writes the data in memory to data.json so it can be saved across restarts
async function write(data) {

  //Save file
  await fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
  });
}

client.login(config.token);
