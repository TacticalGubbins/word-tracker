//hmmmmm

//Discord.js Library initialization
const {MessageAttachment, MessageEmbed, MessageCollector} = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"]});

//extra libraries
const fs = require('fs');
const colors = require('colors');
const math = require('math');
const mysql = require('mysql');
const {REST} = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

//config.json has the bot's key and the key for DBLapi
const config = require("../config.json");
//changelog.json stores the changes made in a json format for easy of use with the n!changelog command
const changelog = require("./changelog.json");
//achievements.json stores the achievements and their properties as json objects
const achievements = require('./achievements.json');

//DBLapi initialization
const DBL = require("dblapi.js");
const dbl = new DBL(config.topToken, client);

//invite code for inviting the bot to your discord server. Stored in a variable for more readable code
const invLink = 'https://discordapp.com/oauth2/authorize?client_id=730199839199199315&scope=bot&permissions=392257';
//server invite code for joining the bot's support server. Stored in a varible for the same reason as the last one.
const discordLink = 'https://discord.gg/Z6rYnpy';
//A link to the Discord Bot List website so people can vote for the bot if they like it. Stored in a varible for the same reason as the last one.
const voteLink = 'https://top.gg/bot/730199839199199315/vote';

//Stores the version number for the changelog function and info function
const version = '3.10.0';

//version number: 1st = very large changes; 2nd = new features; 3rd = bug fixes and other small changes;
const botID = '687077283965567006';
//default strings that a new server automatically gets when the bot joins a new server
const defaultStrings = ["bruh", "nice", "bots", "cow"];
//stores the date at start up for the uptime measurements later
const uptime = Date.now();

//data.json stores the "ogs" and the current pp length and the total words sent ever
var data = require("./data.json");
//Old data from a previous major version of the bot
var oldData = require("./oldData.json");
//the total amount of words sent across all servers ever
var totalN = data.totalSent;

//helpEmbed stores the Embed message that helps the user to know the commands so I don't ahve to copy this everywhere T_+
const helpEmbed = new MessageEmbed()
.setTitle('Bot Help')
.setColor(0xBF66E3)
.setDescription('')
.setFooter('For private server:\n\ngetverify: retrieves current verify code')
.addField('Donations','If you like the bot and would like to donate you can here: https://www.patreon.com/Cyakat')
.addField('/' + 'help', 'Gives you this message', true)
.addField('Support Server', 'You can join the support server [here](' + discordLink + ')', true)
.addField('Commands', '----')
.addField('/' + 'check', 'Checks the # of words sent by a user', true)
.addField('/' + 'total', 'Retrieves the total amount of words recorded', true)
.addField('/' + 'top', 'Gives info about top-sending user', true)
.addField('/' + 'leaderboard', '(lead) Retrieves the top 10 users in a server', true)
.addField('/' + 'global', '(global) Retrieves the top 10 sending users world-wide', true)
.addField('/' + 'delete-info', '**Permanently** deletes all data regarding words counted in a server', true)
.addField('/' + 'info', 'Gives info about the bot', true)
.addField('/' + 'invite', 'Gives you [this link](' + invLink + ')', true)
//.addField('n!' + 'transferData', '(transfer) Transfer your data from the original N-Word (Only works in __one__ server, this is non-reversible)', true)
.addField('/' + 'changelog', 'Shows the changelog for the specified version and if no version is specified the lastest changelog will be shown', true)
//.addField('/' + 'achievements', '(ach) Shows which achievements you or the specified person have earned. The bot will DM you if you check yourself', true)
.addField("Server Setup", "----")
.addField('/' + "settings", "View all current server settings", true)
.addField('/' + 'triggers', 'Starts setup in order to change countable words', true)
.addField('/' + 'cooldown', 'Change the server cooldown for counted words', true)
;

//Command handler. This goes through the command folder and stores the commands in json objects which can be called later
/*client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}*/

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));



// Place your client and guild ids here
const clientId = '664652964962631680';
const guildId = '708421545005023232';

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

client.on('guildCreate', guild => {

	(async () => {
		try {
			console.log('Started refreshing application (/) commands.');

			await rest.put(
				Routes.applicationGuildCommands(clientId, guild.id),
				{ body: commands },
			);

			console.log('Successfully reloaded application (/) commands.');
		} catch (error) {
			console.error(error);
		}
	})();
});

/*NOTES********************************************************
NEW CONSOLE.LOG MESSAGES:
  Errors: console.log("ERROR".bgRed.black + " " + "(insert custom error message here)"); console.log(err);
  Warnings: console.log("WARN".bgYellow.black + " " + "(insert custom warning message here)");
  Information: console.log("INFO".bgGreen.black + " " + "(insert the info message here)");
*/

//variables relating to users-------------------------------------

//initializing the variable that flags if the user sent and trackable words
var checkIfShouldWrite = false;

//for changing status
var stat = 0;

//cooldown vars-----------------------------------------------

//number of words the user has sent
var numWords = 0;
//creates a set that will store the cooldown of the server later
let cooldown = new Set();
//creates a variable that will be used to determine the length of the cooldown later
let cdseconds = 0;

//stores the date in a variable
var d = new Date();

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

//this will give a user the support achievement for joinin the server
/*client.on('guildMemberAdd', (member) => {
  if(client.guilds.cache.get('708421545005023232').member(member) != undefined) {
    giveAchievements(member, data, 'joinServer', 0, false);
  }
})*/

//runs with the bot starts up
client.on('ready', () => {
  console.log("BOT ONLINE");

	//states version upon startup in the bot's status
  client.user.setActivity(`v${version}`, {type : 'STREAMING'});
  console.log(`Activity set to v${version}`);

	//will try to upload the bot's server count to Discord Bot List every 1800 seconds
  setInterval(() => {
        try {
          dbl.postStats(client.guilds.size);
        }
        catch(err) {
          logging.warn("Something's wrong with dblapi? \n");
          console.log(err);
          console.log("\n");
        }
    }, 1800000);

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

});


//if the bot successfully uploads the server count it will log it in the console. and display an error if it failed
dbl.on('posted', () => {
  logging.info('Server count posted!')
});

dbl.on('error', e => {
  logging.warn(`Lets go dbl api is sucking again`);
});


/*client.on("guildCreate", (guild) => {
  storeServerName(guild, data);
});*/

client.commands = new Discord.Collection();

const commandFilesHandler = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFilesHandler) {
	const commandHandler = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(commandHandler.data.name, commandHandler);
}

//runs everytime a message is sent
client.on("interactionCreate", async interaction => {

	client.users.cache.set(interaction.guild.members.fetch());

	const { commandName } = interaction;

		if (!client.commands.has(commandName)) return;

		try {
			let arguments = {version, voteLink, achievements, data, changelog, discordLink, invLink, helpEmbed};
			await client.commands.get(commandName).execute(interaction, Discord, client, con, arguments);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}

});

client.on('messageCreate', async message => {

		//this whole chunk counts the words sent in the message and ups the counter of the user in the database
  let words = message.content.split(/[s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
    words = words.filter(item => !!item);
    /*for(var j = 0; j < wordArgs.length; j++) {

      curr = wordArgs[j];

      let trackedWords = getTrackWords(message, data);*/

		//this set of queries gets all of the appropriate user and server information necessary for tracking the words of the user
    con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild.id, (err, server) => {
      con.query('SELECT cooldown, words FROM users WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id, (err2, user) => {
				con.query('SELECT words FROM users WHERE id = ' + message.author.id + ' GROUP BY id', (err3	, totalWords) => {
					//redefines the number of words variable
	        let numWords = 0;
					//a flag for seeing if the users if the user exists in the database
	        let doesNotExist = false;
					//creates a set for storing the tracked words of the server. the set makes it faster to find if a word is tracked or not
	        let trackedWords = new Set();
					//creates word args which is a string that eventually gets put into trackedWords
	        let wordArgs

					//tries to put the tracked words of a server into the wordArgs variable and will provide the default words if it fails.
	        try {
	          wordArgs = server[0].strings.split(/[s ,]/);
	        }
	        catch(err) {
	          wordArgs = ['bruh','nice','bots','cow'];
	          try {
							con.query("INSERT IGNORE INTO servers (id, prefix, cooldown, strings) VALUE (" + message.guild.id + ", 'n!', 5, 'bruh, nice, bots, cow')");
						}
						catch(err){};
	        }
					//filters out empty strings in the array
	        wordArgs = wordArgs.filter(item => !!item);

					//puts the strings in the wordArgs variable into the trackedWords set for speed
	        for(let i of wordArgs) {
	          trackedWords.add(i);
	        }
					//if the users cooldown epoch time is less than than the current time then the bot will count the users words and update the cooldown in the database
					try {
						if(user[0].cooldown < Date.now()) {
							con.query('UPDATE users SET cooldown = 0 WHERE id = ' + message.author.id + ' AND  server_id = ' + message.guild.id);
						}
					}
					catch (err){}
					if (user[0] === undefined) {
						con.query('INSERT INTO users (id, server_id, cooldown, words) VALUE (' + message.author.id + ', ' + message.guild.id + ', 0, ' + numWords + ')' );
					}
					//this for loop goes through all of the words and counts how many times a tracked word has been said
	        for(let j in words) {
	          curr = words[j];

						try {

		          if(trackedWords.has(curr.toLowerCase())) {

								checkIfShouldWrite = true;

		              if (user[0].cooldown > 0) {
		                break;
		              }


								numWords++;
		          }
						}
						catch(err) {
						}
	        }
					//this if statement checks to see if a tracked word has been sent at all. If it has it will run this code
	        if(checkIfShouldWrite) {
	          let cooldownTime
						//if the server does not have a cooldown time i.e. the server is not in the database it will try to create an entry
	          try {
	            cooldownTime = server[0].cooldown;
	          }
	          catch(err)
	          {
	            cooldownTime = 5;
	            try {
								con.query('INSERT IGNORE INTO servers (id, prefix, cooldown, strings) VALUE (' + message.guild.id + ', "n!", 5, "bruh, nice, bots, cow")');
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
						//if the user has sent more than five words, multiply the number of tracked words they have sent by the cooldown time and then add that to the epoch time and store it in the users entry in the database for that server
	          if(numWords >= 5) {
	            con.query('UPDATE users SET cooldown = ' + (Date.now() + ((server[0].cooldown) * 1000)) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
	            setTimeout(() => {
	              con.query('UPDATE users SET cooldown = 0 WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
	            }, (cooldownTime) * 1000);
	          }
	        }
				});
      });
    });
  });

//writes the data in memory to data.json so it can be saved across restarts
function write (data) {

  //Save file
  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
  });
}


//generate a new password for louie personal server
function newPASSWORD() {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   var length = 23;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }

   result = result.toString();

   fs.writeFile('PASSWORD.txt' , result , (err) => {
     if (err) throw err;
   });

   //console.log(`New PASSWORD Generated: ` + result + `nn`);
   return result;
}

//gets the "ogs" from data.json
function getOGS(data) {
  let ogs = new Set();
  for(var i = 0; i < data.ogs.length; i++) {
    ogs.add(data.ogs[i]);
  }
  return ogs;
}

//timer for debugging
function startTimer() {
  let timer = Date.now();
  return timer;
}

//same for this one
function stopTimer(timer) {
  let timer2 = Date.now();
  logging.debug((timer2 - timer)/1000);
}


client.login(config.token);
