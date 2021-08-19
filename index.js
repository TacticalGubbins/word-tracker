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
const version = '3.9.1';

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
var nword = 0;
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
client.on('guildMemberAdd', (member) => {
  if(client.guilds.cache.get('708421545005023232').member(member) != undefined) {
    giveAchievements(member, data, 'joinServer', 0, false);
  }
})

//runs with the bot starts up
client.on('ready', () => {
  console.log("BOT ONLINE");

	//states version upon startup in the bot's status
  client.user.setActivity(`v${version}`, {type : 'STREAMING'})
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`));

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


//runs everytime a message is sent
client.on("message", async (message) => {


  //ignore messages sent by bots
  if(message.author.bot ) return;


  //provides a random chance to get the template achievement
  let template1 = (math.random() * (31622 - 1) + 1).toFixed(0);
  let template2 = (math.random() * (31622 - 1) + 1).toFixed(0);
  if(template1 === template2) {
    giveAchievements(message.author, data, "template", template1, false);
  }

	//splits the sentence into an array, splitting at spaces
	let args = message.content.split(" ");
	args = args.filter(item => !!item);
  //ignore messages sent in dms
  if(message.channel.type === 'dm' && (message.content.toLowerCase().startsWith("n!help") || message.content.toLowerCase().startsWith("help")) && args[1] === undefined) {
    let embed = new MessageEmbed()
    .setTitle('Bot Help')
    .setColor(0xBF66E3)
    .setDescription('')
    .setFooter('For private server:\n\ngetverify: retrieves current verify code')
		.addField('Donations','If you like the bot and would like to donate you can here: https://www.patreon.com/Cyakat')
    .addField('n!' + 'help', 'Gives you this message', true)
    .addField('Support Server', 'You can join the support server [here](' + discordLink + ')', true)
    .addField('Commands', '----')
    .addField('n!' + 'check', 'Checks the # of words sent by a user', true)
    .addField('n!' + 'count', 'Same as **n!check**', true)
    .addField('n!' + 'total', 'Retrieves the total amount of words recorded', true)
    .addField('n!' + 'top', 'Gives info about top-sending user', true)
    .addField('n!' + 'leaderboard', '(lead) Retrieves the top 10 users in a server', true)
    .addField('n!' + 'globalLeaderboard', '(global) Retrieves the top 10 sending users world-wide', true)
    .addField('n!' + 'delete', '**Permanently** deletes all data regarding words counted in a server', true)
    .addField('n!' + 'info', 'Gives info about the bot', true)
    .addField('n!' + 'invite', 'Gives you [this link](' + invLink + ')', true)
    //.addField('n!' + 'transferData', '(transfer) Transfer your data from the original N-Word (Only works in __one__ server, this is non-reversible)', true)
    .addField('n!' + 'changelog', 'Shows the changelog for the specified version and if no version is specified the lastest changelog will be shown', true)
    .addField('n!' + 'achievements', '(ach) Shows which achievements you or the specified person have earned. The bot will DM you if you check yourself', true)
    .addField("Server Setup", "----")
    .addField('n!' + "settings", "View all current server settings", true)
    .addField('n!' + 'triggers', 'Starts setup in order to change countable words', true)
    .addField('n!' + 'cooldown', 'Change the server cooldown for counted words', true)
    .addField('n!' + 'setPrefix', '(prefix) Changes the prefix for the server', true)
    ;

    message.channel.send(embed)

    return;
  }
	//If a user tries to dm the bot it will turn them away and send what ever the user sent to louie aka TacticalGubbins
	//will also return an error if it failed
  else if(message.channel.type === 'dm' && (args[1] == undefined)){
    message.channel.send("Shut up retard go talk in a server");
    try {
      client.guilds.cache.get('687077613457375438').member('250408653830619137').send("**Message from " + message.author.username + ":** " + message.content + "");
    }
    catch(err) {
     logging.warn('\nCould not send dm to louie. This should only happen if the testing bot is running \n');
     console.log(err)
    }
    return;
  }
	//if the sends n!help followed by a command it will reply with additional help. this isn't working properly right now.
	else if (message.channel.type === 'dm' && args[1] != undefined){
		let infoEmbed = new Discord.MessageEmbed()
		.setTitle('More Info')
		.setColor(0xBF66E3)
		.setDescription('')
		switch (args[1]) {
			case 'triggers':
					infoEmbed.addField('n!triggers', 'You can change the tracked words by running this command. The default tracked words are \'bruh, nice, bots, cow\'. This command can only be run by those with the ManageChannels or ManageServer perms.');
				break;
			case ('check' || 'count'):
				infoEmbed.addField('n!check/count', 'This command allows you to see how many words you or someone else has sent. You can see how many words someone else has sent by sending n!check @Cyakat');
				break;
			case 'total':
				infoEmbed.addField('n!total', 'This command will show the total amount of words sent by everyone. This can also be seen in the bot\'s status sometimes and also with n!check @Word Tracker');
				break;
			case 'top':
				infoEmbed.addField('n!top', 'This command will show the top user aka the user who has sent the most tracked words');
				break;
			case ('leaderboard' || 'lead'):
				infoEmbed.addField('n!leaderboard/lead', 'This command will display a leaderboard ranking each user based on how many words were sent in the server. This leaderboard is local and will only show a list containing people in the server the command was used in');
				break;
			case ('globalLeaderboard' || 'global'):
				infoEmbed.addField('n!globalLeaderboard/global', 'This command will display a leaderboard ranking everyone based on how many words they have sent overall');
				break;
			case 'delete':
				infoEmbed.addField('n!delete', 'This command will delete all of your data from every server the bot permanently.');
				break;
			case 'info':
				infoEmbed.addField('n!info', 'This command will show some information about the bot');
				break;
			case 'invite':
				infoEmbed.addField('n!info', 'This command will give an invite code to the support server and also a link to invite the bot to your own server.');
				break;
			case 'changelog':
				infoEmbed.addField('n!changelog', 'This command will show the most recent changes made to the bot or you can specify a version. n!changelog 3.9.0');
				break;
			case ('ach' || 'achievements'):
				infoEmbed.addField('n!ach/achievements', 'This command will dm you your own achievements. If you specify a user, the bot will show their achievements. n!ach @Cyakat');
				break;
			case 'settings':
				infoEmbed.addField('n!settings', 'This command will show the current server\'s settings including the current triggers, cooldown, and prefix. This command can be run by anyone.');
				break;
			case 'cooldown':
				infoEmbed.addField('n!cooldown', 'This command allows you to change the cooldown for the server. The cooldown will activate after 5 or more tracked words were sent. While cooldown is applied, any tracked words sent by a user will not be tracked. This settings can only be changed by those with the ManageServer or ManageChannels perms. n!cooldown 5');
				break;
			case ('setPrefix' || 'prefix'):
				infoEmbed.addField('n!setPrefix/prefix', 'This command allows you to change the prefix for the server. This setting can only be changed by those with ManageServer or ManageChannels perms.');
				break;
			case 'help':
				infoEmbed.addField('n!help', 'This command will dm you the help file giving you all of the commands.');
				break;
			default:
				infoEmbed.setColor(0xFF0000)
				.setDescription('Command not found');
		}
		message.channel.send(infoEmbed);
		return;
	}

  //query retrieves the prefix from the server that the message was sent in
  con.query('SELECT prefix FROM servers WHERE id = ' + message.guild.id, (err, prefixResponse) => {
    try {
      prefix = prefixResponse[0].prefix;
    }
    catch(err) {
      prefix = 'n!';
			con.query('SELECT id FROM servers WHERE id = ' + message.guild.id, (err, idResponse) => {
				if(idResponse[0] === undefined) {
					con.query("INSERT IGNORE INTO servers (id, prefix, cooldown, strings) VALUE (" + message.guild.id + ", 'n!', 5, 'bruh, nice, bots, cow')");
				}
			});

    }
    //this switch statement handels all of the commands and if no commands are said, the bot will count the amount of tracked words in the message. this is handled by the default
    switch(true) {
      case (message.content === "🥚"):
        giveAchievements(message.author, data, "egg");
        break;
      case (message.content.toLowerCase().startsWith(prefix + "bottom")):
        //bottom(message);
				client.commands.get('bottom').execute(message, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "global") || message.content.toLowerCase().startsWith(prefix + "globalleaderboard") || message.content.toLowerCase().startsWith(prefix + "globallead")):
        //global(message);
				client.commands.get('global').execute(message, args, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "settings")):
        //settings(message);
				client.commands.get('settings').execute(message, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "info") || message.content.toLowerCase().startsWith(prefix + "stats")):
        //info(message);
				client.commands.get('info').execute(message, version, voteLink, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "cooldown")):
        //cooldownFunction(message, args);
				client.commands.get('cooldown').execute(message, args, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "triggers")):
        //triggers(message);
				client.commands.get('triggers').execute(message, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith("invitenow")):
        //invitenow(message);
				client.commands.get('invitenow').execute(message, Discord, client, con);
				giveAchievements(message.author, data, "inviteNow");
        break;
      case (message.content.toLowerCase().startsWith(prefix + "check") || message.content.toLowerCase().startsWith(prefix + "count")):
        //check(message, args);
				client.commands.get('check').execute(message, args, Discord, client, con, data);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "total")):
        //total(message);
				client.commands.get('total').execute(message, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "invite")):
        //invite(message);
				client.commands.get('invite').execute(message, discordLink, invLink, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "archive")):
        //archive(message);
				client.commands.get('archive').execute(message, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "top")):
        //top(message);
				client.commands.get('top').execute(message, Discord, client, con, data);
        break;
      case (message.content.toLowerCase().startsWith(prefix + 'leaderboard') || message.content.toLowerCase().startsWith(prefix + 'lead')):
        //leaderboard(message);
				client.commands.get('leaderboard').execute(message, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + 'deleteinfo') || message.content.toLowerCase().startsWith(prefix + 'delete')):
        //deleteInfo(message);
				client.commands.get('deleteInfo').execute(message, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + 'userinfo')):
        //userinfo(message);
				client.commands.get('userinfo').execute(message, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "help")):
        //help(message, prefix);
				client.commands.get('help').execute(message, prefix, discordLink, invLink, args, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "changelog")):
        //changelogFunction(message, args);
				let achievement = false;
				achievement = client.commands.get('changelog').execute(message, args, version, changelog, Discord, client, con);
				if(achievement) {
					giveAchievements(message.author, data, "changelog");
				}
        break;
      case (message.content.toLowerCase().startsWith(prefix + "setprefix") || message.content.toLowerCase().startsWith(prefix + "prefix")):
        //prefixFunction(message, prefix, args);
				client.commands.get('prefix').execute(message, prefix, args, Discord, client, con);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "setpplength") || message.content.toLowerCase().startsWith(prefix + "setpp") || message.content.toLowerCase().startsWith(prefix + "pp")):
        //pp(message, data, args);
				client.commands.get('pp').execute(message, data, args, Discord, client, con);
				giveAchievements(message.author, data, "pp");

        break;
      case (message.content.toLowerCase().startsWith(prefix + "achievements") || message.content.toLowerCase().startsWith(prefix + "achievement") || message.content.toLowerCase().startsWith(prefix + "ach")):
        //achievementsCheck(message, data, args);
				client.commands.get('achievementsCheck').execute(message, data, args, achievements, Discord, client, con);
        return;
        break;
      case (message.guild.id == 694263395884728412 && message.channel.id == 694265200454402108 && message.content == fs.readFileSync('PASSWORD.txt')):
        //checkVerify(message);
				client.commands.get('checkVerify').execute(message, Discord, client, con);
        break;
      case (message.guild.id == 694263395884728412 && message.channel.id != 694265200454402108 && message.content.toLowerCase().startsWith("getverify")):
        message.channel.send("Current verify message: **" + fs.readFileSync('PASSWORD.txt').toString() + "**");
        return;
        break;
			case (message.content.toLowerCase().startsWith(prefix + "vote")):
				client.commands.get('vote').execute(message, voteLink, Discord, client, con);
				return;
				break;
			case (message.content.toLowerCase().startsWith(prefix + "rank")):
				client.commands.get('rank').execute(message, data, args, Discord, client, con);
				break;
			case (message.content.toLowerCase().startsWith(prefix + "ping")):
				client.commands.get('ping').execute(message, client);
      default:

        break;
    }
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
					try {
						totalWords = totalWords[0].words;
						//will give users achievements depending on how many words they have sent
						switch(true) {
							case (totalWords >= 10000):
								giveAchievements(message.author, data, "10000");
							case (totalWords >= 1000):
								giveAchievements(message.author, data, "1000");
							case (totalWords >= 100):
								giveAchievements(message.author, data, "100");
								break;
							default:
							break;
						}
					}
					catch(err){}

					//redefines the number of words variable
	        let nword = 0;
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
						con.query('INSERT INTO users (id, server_id, cooldown, words) VALUE (' + message.author.id + ', ' + message.guild.id + ', 0, ' + nword + ')' );
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


								nword++;
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
							con.query('UPDATE users SET words = ' + (0 + nword) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
						}
						else {
	          	con.query('UPDATE users SET words = ' + (parseInt(user[0].words) + nword) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
						}
						//if the user has sent more than five words, multiply the number of tracked words they have sent by the cooldown time and then add that to the epoch time and store it in the users entry in the database for that server
	          if(nword >= 5) {
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
