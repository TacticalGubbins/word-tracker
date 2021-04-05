//hmmmmm

const {MessageAttachment, MessageEmbed, MessageCollector} = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client();

const fs = require('fs');
const colors = require('colors');
const math = require('math');
const mysql = require('mysql');

//command handler ecks dee
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const config = require("../config.json");
const changelog = require("./changelog.json");
const achievements = require('./achievements.json');

const DBL = require("dblapi.js");
const dbl = new DBL(config.topToken, client);

const invLink = 'https://discordapp.com/oauth2/authorize?client_id=730199839199199315&scope=bot&permissions=392257';
const discordLink = 'https://discord.gg/Z6rYnpy';
const voteLink = 'https://top.gg/bot/730199839199199315/vote';

const version = '3.9.0';

//version number: 1st = very large changes; 2nd = new features; 3rd = bug fixes and other small changes;
const botID = '687077283965567006';
//const prefix = "n!";
const defaultStrings = ["bruh", "nice", "bots", "cow"];
const uptime = Date.now();

//read in data from data.json
var data = require("./data.json");
var oldData = require("./oldData.json");
var totalN = data.totalSent;

/*NOTES********************************************************
NEW CONSOLE.LOG MESSAGES:
  Errors: console.log("ERROR".bgRed.black + " " + "(insert custom error message here)"); console.log(err);
  Warnings: console.log("WARN".bgYellow.black + " " + "(insert custom warning message here)");
  Information: console.log("INFO".bgGreen.black + " " + "(insert the info message here)");
*/

//variables relating to users
var checkIfShouldWrite = false;

//changing status
var stat = 0;

//cooldown vars
var watching = new Array();

var nword = 0;
let cooldown = new Set();
let cdseconds = 0;

var d = new Date();

const con = mysql.createConnection({
  host: '127.0.0.1',
  user: config.databaseUser,
  password: config.databasePass,
  database: 'data',
  supportBigNumbers: true
});

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

client.on('guildMemberAdd', (member) => {
  if(client.guilds.cache.get('708421545005023232').member(member) != undefined) {
    giveAchievements(member, data, 'joinServer', 0, false);
  }
})

client.on('ready', () => {
  console.log("BOT ONLINE");

  client.user.setActivity(`v${version}`, {type : 'STREAMING'})
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`));

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



dbl.on('posted', () => {
  logging.info('Server count posted!')
});

dbl.on('error', e => {
  logging.warn(`Lets go dbl api is sucking again`);
});


/*client.on("guildCreate", (guild) => {
  storeServerName(guild, data);
});*/



client.on("message", (message) => {

  //ignore messages sent by bots
  if(message.author.bot ) return;


  //provides a random chance to get the template achievement
  let template1 = (math.random() * (31622 - 1) + 1).toFixed(0);
  let template2 = (math.random() * (31622 - 1) + 1).toFixed(0);
  if(template1 === template2) {
    giveAchievements(message.author, data, "template", template1, false);
  }

  //ignore messages sent in dms
  if(message.channel.type === 'dm' && (message.content.toLowerCase().startsWith("n!help") || message.content.toLowerCase().startsWith("help"))) {
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
  else if(message.channel.type === 'dm' && (message.content.toLowerCase() === 'nigga' || message.content.toLowerCase() === 'nigger')) {
    try {
      client.guilds.cache.get('687077613457375438').member('250408653830619137').send("**Message from " + message.author.username + ":** " + message.content + "");
    }
    catch(err) {
      logging.warn('Could not send dm to louie. This should only happen if the testing bot is running n');
    }
    giveAchievements(message.author, data, "roots");
    return;
  }
  else if(message.channel.type === 'dm'){
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

  //query retrieves the prefix from the server that the message was sent in
  con.query('SELECT prefix FROM servers WHERE id = ' + message.guild.id, (err, prefixResponse) => {
    try {
      prefix = prefixResponse[0].prefix;
    }
    catch(err) {
      prefix = 'n!';
			con.query('SELECT id FROM servers WHERE id = ' + message.guild.id, (err, idResponse) => {
				console.log(idResponse[0]);
				if(idResponse[0] === undefined) {
					con.query("INSERT INTO servers (id, prefix, cooldown, strings) VALUE (" + message.guild.id + ", 'n!', 5, 'bruh, nice, bots, cow')");
				}
			});

    }

    //splits the sentence into an array, splitting at spaces
    let args = message.content.split(" ");
    args = args.filter(item => !!item);

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
				client.commands.get('help').execute(message, prefix, discordLink, invLink, Discord, client, con);
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
      default:

        break;
    }
    let words = message.content.split(/[s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
    words = words.filter(item => !!item);
    /*for(var j = 0; j < wordArgs.length; j++) {

      curr = wordArgs[j];

      let trackedWords = getTrackWords(message, data);*/
    con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild.id, (err, server) => {
      con.query('SELECT cooldown, words FROM users WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id, (err2, user) => {
				con.query('SELECT words FROM users WHERE id = ' + message.author.id + ' GROUP BY id', (err3	, totalWords) => {
					try {
						totalWords = totalWords[0].words;
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

	        let nword = 0;
	        let doesNotExist = false;
	        let trackedWords = new Set();
	        let wordArgs
	        try {
	          wordArgs = server[0].strings.split(/[s ,]/);
	        }
	        catch(err) {
	          wordArgs = ['bruh','nice','bots','cow'];
	          try {
							con.query("INSERT INTO servers (id, prefix, cooldown, strings) VALUE (" + message.guild.id + ", 'n!', 5, 'bruh, nice, bots, cow')");
						}
						catch(err){};
	        }
	        wordArgs = wordArgs.filter(item => !!item);
	        for(let i of wordArgs) {
	          trackedWords.add(i);
	        }



	        for(let j in words) {
	          curr = words[j];

						try {

		          if(trackedWords.has(curr.toLowerCase())) {

								checkIfShouldWrite = true;

			            if(user[0].cooldown < Date.now()) {
			              con.query('UPDATE users SET cooldown = 0 WHERE id = ' + message.author.id + ' AND  server_id = ' + message.guild.id);
			            }

		              if (user[0].cooldown > 0) {
		                break;
		              }


								nword++;
		          }
						}
						catch(err) {
							doesNotExist = true;
						}
						if(doesNotExist) {
		          con.query('INSERT INTO users (id, server_id, cooldown, words) VALUE (' + message.author.id + ', ' + message.guild.id + ', 0, ' + nword + ')' );
		          doesNotExist = false;
		        }
	        }
	        if(checkIfShouldWrite) {
	          let cooldownTime
	          try {
	            cooldownTime = server[0].cooldown;
	          }
	          catch(err)
	          {
	            cooldownTime = 5;
	            try {
								con.query('INSERT INTO servers (id, prefix, cooldown, strings) VALUE (' + message.guild.id + ', "n!", 5, "bruh, nice, bots, cow")');
							}
							catch(err){};
	          }
	          checkIfShouldWrite = false;
						if(user[0] === undefined) {
							con.query('UPDATE users SET words = ' + (0 + nword) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
						}
						else {
	          	con.query('UPDATE users SET words = ' + (parseInt(user[0].words) + nword) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
						}
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

//this function checks to see if the message sent in louie's server's verify channel contains the verify code
function checkVerify(message) {
  message.guild.member(message.author).roles.add('694263460355244074');
  message.guild.member(message.author).roles.remove('694264932706943096');
  //console.log(`\n\n` + message.author.username + ` just verified`);

  password = newPASSWORD();

  message.guild.member('250408653830619137').send(message.author.username + " Just verfied\n\n**NEW PASSWORD:**\n`" + password + "`");
  return;
}

//this function is called when n!pp is sent. it will change the pp length in the data file. the pp length will occasionally be shown in the bot's status
function pp(message, data, args) {
  if(args[1] != undefined ) {
    args.shift();
    args = args.toString();
    data.ppLength = args.replace(/,/g, " ");
    let embed = new MessageEmbed()
    .setTitle('UwU')
    .setColor(0xBF66E3)
    .setDescription("pp length set to **" + data.ppLength + "**");
    message.author.send(embed);
  }
  else {
    let embed = new MessageEmbed()
    .setTitle('Really dude')
    .setColor(0xB4DA55)
    .setDescription('Come on man, give me at least a little something to work with');
    message.channel.send(embed);
  }
  giveAchievements(message.author, data, "pp");
  return;
}

//this function is used to change the prefix for the server that the command was issued in
function prefixFunction(message, prefix, args) {
  if(message.member.hasPermission('ADMINISTRATOR')) {
    if(args[1] === undefined) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('Please include a prefix after the command!');
      message.channel.send(embed);
      return;
    }
    if(args[1].length <= 5) {
      //data.servers[server].prefix = args[1].toLowerCase();
      con.query("UPDATE servers SET prefix = '" + args[1].toLowerCase() + "' WHERE id = " + message.guild.id);
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Prefix has been changed to **" + args[1] + "**")
      .setFooter('Requested by ' + message.author.tag);
      message.channel.send(embed);
    } else {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('Please make the prefix less than 5 characters!');
      message.channel.send(embed);
      return;
    }
  } else {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xFF0000)
    .setDescription('You must be an Administrator to use this command!');
    message.channel.send(embed);
    return;
  }
  return;
}

//this function will show the changelog of the version specified
function changelogFunction(message, args) {
  if(args[1] === undefined) {
    args[1] = version;
  }
  let versionNumbers = args[1].split(".");
  //console.log(JSON.stringify(changelog, 2, null));
  try {
    let changes = changelog.versions[versionNumbers[0]][versionNumbers[1]][versionNumbers[2]];
    let embed = new MessageEmbed()
    .setTitle(args[1] + " Changelog")
    .setColor(0xBF66E3)
    .setDescription('You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A)')
    ;

    for(var i = 0; i < changes.length; i++) {
      embed.addField(i+1, changes[i]);
    }
    message.channel.send(embed);
  }
  catch(err) {
    if(args[1] === "stupid" || args[1] === "idiot" || args[1] === "dumb") {
      let embed = new MessageEmbed()
      .setTitle("jesus christ your dumn")
      .setColor(0xFF7777)
      .setDescription("stupid idiot")
      .setFooter("try " + prefix + "changelog 3.6.4");

      message.channel.send(embed);

      giveAchievements(message.author, data, "changelog");
    }
    else {
      let embed = new MessageEmbed()
      .setTitle("Version not found")
      .setColor(0xFF0000)
      .addField('You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A)')
      .setDescription("You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A)\n\n**The version specified could not be found. The oldest changelog is for 3.6.4**")
      .setFooter("try " + prefix + "changelog 3.6.4");

      message.channel.send(embed);
    }
  }
  return;
}

//this function will dm the message author the help embed
function help(message, prefix) {
  let dmEmbed = new MessageEmbed()
  .setTitle('')
  .setColor(0xBF66E3)
  .setDescription("Check your dms :>")
  ;
  message.channel.send(dmEmbed);

  //let help = fs.readFileSync('help.txt')
  let helpEmbed = new MessageEmbed()
  .setTitle('All Commands')
  .setColor(0xBF66E3)
  .setDescription('')
  .setFooter('For private server:\n\ngetverify: retrieves current verify code')
  .addField(prefix + 'help', 'Gives you this message', true)
  .addField('Support Server', 'You can join the support server [here](' + discordLink + ')', true)
  .addField('Commands', '----')
  .addField(prefix + 'check', 'Checks the # of words sent by a user', true)
  .addField(prefix + 'count', 'Same as **ncheck**', true)
  .addField(prefix + 'total', 'Retrieves the total amount of words recorded', true)
  .addField(prefix + 'top', 'Gives info about top-sending user', true)
  .addField(prefix + 'leaderboard', '(lead) Retrieves the top 10 users in a server', true)
  .addField(prefix + 'globalLeaderboard', '(global) Retrieves the top 10 sending users world-wide', true)
  .addField(prefix + 'delete', '**Permanently** deletes all data regarding words counted in a server', true)
  .addField(prefix + 'info', 'Gives info about the bot', true)
  .addField(prefix + 'invite', 'Gives you [this link](' + invLink + ')', true)
  //.addField(prefix + 'transferData', '(transfer) Transfer your data from the original N-Word (Only works in __one__ server, this is non-reversible)', true)
  .addField(prefix + 'changelog', 'Shows the changelog for the specified version and if no version is specified the lastest changelog will be shown', true)
  .addField(prefix + 'achievements', 'Shows which achievements you or the specified person have earned. The bot will DM you if you check yourself')
  .addField("Server Setup", "----")
  .addField(prefix + "settings", "View all current server settings", true)
  .addField(prefix + 'triggers', 'Starts setup in order to change countable words', true)
  .addField(prefix + 'cooldown', 'Change the server cooldown for counted words', true)
  .addField(prefix + 'setPrefix', '(prefix) Changes the prefix for the server', true)
  ;
  //message.author.send(`${help}`);
  message.author.send(helpEmbed);
  return;
}

function userInfo(message) {
  if(args[1] === undefined) {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xFF0000)
    .setDescription('You must include an @!');
    message.channel.send(embed);
    return;
  }
  else if(client.users.cache.get(args[1].toString()) !== undefined) {
    userInf = client.users.cache.get(args[1].toString());
    let embed = new MessageEmbed()
    .setTitle(userInf.tag)
    .setColor(0x00FF00)
    .setDescription('<@!' + userInf.id + '>')
    .setThumbnail(userInf.avatarURL())
    .setTimestamp()
    .addField('Registered', userInf.createdAt)
    ;

    message.channel.send(embed);
  } else {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xFF0000)
    .setDescription("That's not a person!");
    message.channel.send(embed);
  }
  return;
}

function deleteInfo(message) {
  let deleteEmbed = new MessageEmbed()
  .setTitle('Data Deletion')
  .setColor(0xBF66E3)
  .setDescription('Are you sure all of your data on this server? *this is non-recoverable*\n\n Type:')
  .addField('**' + message.author.username + '** (your username)', 'to delete your data')
  .addField("**Cancel**", 'to cancel')
  .setFooter('Requested by ' + message.author.tag)
  ;
  message.channel.send(deleteEmbed);

  //create a message collector that checks for cancel or username
  let collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
  collector.on('collect', message => {

    //delete user info
    if (message.content === message.author.username) {
      //deleteUserInfo(data, message);
      con.query('DELETE FROM users WHERE id = ' + message.author.id, (err) => {});
      con.query('DELETE FROM achievements WHERE id = ' + message.author.id);
      let deleteEmbed2 = new MessageEmbed()
      .setTitle('')
      .setColor()
      .setColor(0xFF0000)
      .setDescription('Your data has been deleted, sorry to see you go :<')
      ;
      message.channel.send(deleteEmbed2);
      collector.stop();

      //cancel the collector, do not delete
    } else if (message.content.toLowerCase() === "cancel") {
      let saveEmbed = new MessageEmbed()
      .setTitle('')
      .setColor()
      .setColor(0x00FF00)
      .setDescription('Glad to see you made the right choice :)')
      ;
      message.channel.send(saveEmbed);
      collector.stop();

      //stop multiple instances from running
    } else if(message.content.toLowerCase().startsWith('ndelete')) {
      collector.stop();

      //check for incorrect responses
    } else {
      let wrongEmbed = new MessageEmbed()
      .setTitle('')
      .setColor()
      .setColor(0xFF0000)
      .setDescription('Not an input')
      ;
      message.channel.send(wrongEmbed);
    }
  });
  return;
}

function leaderboard(message) {
  //quieres stuff
  con.query("SELECT * FROM users WHERE server_id =  '" + message.guild.id + "' ORDER BY words DESC", (err, response) => {
    let embed = new MessageEmbed()
    .setColor(0xBF66E3)
    .setTitle(message.guild.name + ' Leaderboard')
    .setDescription("This is the server's local leaderboard")
    .setFooter('Requested by ' + message.author.tag);

    getTop(message, response, embed);
  });
  return;
}

function top(message) {
  con.query('SELECT id, SUM(words) AS words FROM users GROUP BY id ORDER BY words DESC', (err, rows) => {
    for(let i in rows) {
      try {
        let embed = new MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription('Top User')
        .setFooter('Requested by ' + message.author.tag)
        .setThumbnail('https://cdn.discordapp.com/avatars/' + rows[i].id + '/' + client.users.cache.get(rows[i].id).avatar + '.png')
        .addField(client.users.cache.get(rows[i].id).username, '__**' + rows[i].words + '**__ sent');

        message.channel.send(embed);
        break;
      }
      catch(err) {

      }
    }

  });
  return;
}

function archive(message) {
  let archiveEmbed = new MessageEmbed()
  .setTitle('')
  .setColor(0xFF0000)
  .setDescription('Sorry, this feature is currently disabled :(');
  //message.channel.send("sorry, this feature is disabled for the time being");
  message.channel.send(archiveEmbed);

  //message.react('&#10060;')
  //.catch(console.error);

  //console.log(`n` + message.author.username + `(` + message.author.id + `) requested the archive in ` + message.channel.guild.name);
  return;
}

function invite(message) {
  let inviteEmbed = new MessageEmbed()
  .setTitle('')
  .setColor(0xBF66E3)
  .setDescription("[[Click here to invite me]](" + invLink + ")" + "n[[Click here to join the bot's server]](" + discordLink + ")")
  .setFooter('Requested by ' + message.author.tag)
  ;

  message.channel.send(inviteEmbed);
  return;
}

function total(message) {
  con.query('SELECT SUM(words) AS words FROM users', (err, total) => {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("There have been a total of **__" + total[0].words + "__** countable words sent!")
    .setFooter('Requested by ' + message.author.tag);
    //message.channel.send("There have been a total of **__" + totalN + "__** n-words sent!");
    message.channel.send(embed);
  });
  return;
}

function check(message, args) {
  let user;

  //check to see if the value inputted is a user
  if(args[1] === undefined) {
    /*let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xFF0000)
    .setDescription('You must include an @!');
    //message.channel.send("You must include an @!")
    message.channel.send(embed);

    return;*/
    user = message.author.id;
  } else {
    user = args[1].replace(/D/g,'');
  }

  if(user == client.user.id) {
    con.query('SELECT SUM(words) AS words FROM users', (err, total) => {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Bruhg I've counted **__" + total[0].words + "__** words")
      .setFooter('Requested by ' + message.author.tag);
      //message.channel.send("Bruhg I've sent the n-word **__" + totalN + "__** times");
      message.channel.send(embed);
    });

    return;
  }

  //if(args[1].slice(0,1) == '0' || args[1].slice(0,1) == '1' || args[1].slice(0,1) == '2' || args[1].slice(0,1) == '3' || args[1].slice(0,1) == '4' || args[1].slice(0,1) == '5' || args[1].slice(0,1) == '6' || args[1].slice(0,1) == '7' || args[1].slice(0,1) == '8' || args[1].slice(0,1) == '9') {
  if(client.users.cache.get(user.toString()) !== undefined) {
    con.query('SELECT words FROM users WHERE id = ' + user + ' AND server_id = ' + message.guild.id, (err, rows) => {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setFooter('Requested by ' + message.author.tag);

      //checks to see if the user is in the database
      if(rows[0] === undefined || rows[0].words === 0){
        embed.setDescription("That user hasn't sent any countable words!")
      }
      else {
        embed.setDescription(client.users.cache.get(user).tag + " has sent **__" + rows[0].words + "__** countable words!");
      }

      let ogs = getOGS(data);
      if(ogs.has(client.users.cache.get(user).id)) {
        embed.setColor(0xFFA417);
      }
      //custom colors for pog people
      if(client.users.cache.get(user).id === '445668261338677248') {
        embed.setColor(0xFF1CC5);
      }
      if(client.users.cache.get(user).id === '448269007800238080') {
        embed.setColor(0x17FF1B);
      }
      if(client.users.cache.get(user).id === '656755471847260170') {
        embed.setColor(0x17D1FF);
      }


      message.channel.send(embed);
    });


    //say that the argument is not a user
  } else {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xFF0000)
    .setDescription("That's not a person!");
    //message.channel.send("That's not a person!")
    message.channel.send(embed);

  }
  return;
}

function invitenow(message) {
  message.channel.createInvite({maxAge: 0})
  .then(invite => message.channel.send("*FUCK YOU SEB :)* https://discord.gg/" + invite.code))
  .catch(console.error);

  //console.log(`nCreated an invite in: ` + message.channel.guild.name + `, ` + message.channel.name);
  giveAchievements(message.author, data, "inviteNow");
  return;
}

function triggers(message) {
  if(message.member.hasPermission('ADMINISTRATOR')) {
    let embed = new MessageEmbed()
    .setTitle('Trigger Setup')
    .setColor(0xBF66E3)
    .setDescription('Please type out any words you would like to be counted. Seperate each word by a space. All punctuation will be ignored')
    .addField('Example', 'bots nice!', true)
    .addField('Cancel', 'Type "CANCEL" to cancel', true)
    .setFooter('Requested by ' + message.author.tag);
    message.channel.send(embed);

    let collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 20000 });
    collector.on('collect', message => {
      if(message.content === "CANCEL") {
        let embed = new MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription('Trigger Setup Canceled');
        message.channel.send(embed);
        collector.stop();

      } else {
        let strings = message.content.toLowerCase().split(/[s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
        strings = strings.filter(item => !!item);
        strings = strings.filter((item, index) => strings.indexOf(item) === index);
        strings = strings.join(', ');
        //data.servers[server].strings = strings;
        con.query("UPDATE servers SET strings = '" + strings + "' WHERE id = " + message.guild.id);

        let embed = new MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription('**Trigger Setup Complete**nn Triggers added:n' + strings);
        message.channel.send(embed);

        collector.stop();
      }
    });
  } else {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xFF0000)
    .setDescription('You must be an Administrator to use this command!');
    message.channel.send(embed);
    return;
  }
}

function cooldownFunction(message, args) {
  if(message.member.hasPermission('ADMINISTRATOR')) {
    if(args[1] === undefined) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('Please include a time (in seconds) after the command!');
      message.channel.send(embed);
      return;
    }
    if(args[1].toLowerCase() === 'none' || args[1].toLowerCase() === 'off' || parseInt(args[1]) === 0) {
      con.query("UPDATE servers SET cooldown = 0 WHERE id = " + message.guild.id);
      //data.servers[server].cooldown = 0;
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription('**Removed cooldown time!**nn*active cooldowns will not be cleared*')
      .setFooter('Requested by ' + message.author.tag);
      message.channel.send(embed);
      return;
    }
    if(isNaN(args[1])) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('Please include a time (in seconds) after the command!');
      message.channel.send(embed);
      return;
    }
    if(!isNaN(args[1])) {
      con.query("UPDATE servers SET cooldown = " + args[1] + " WHERE id = " + message.guild.id);
      //data.servers[server].cooldown = parseInt(args[1]);
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription('Changed cooldown time to **__' + args[1] + '__** secondsnn*active cooldowns will not be cleared*')
      .setFooter('Requested by ' + message.author.tag);
      message.channel.send(embed);
      return;
    }
  } else {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xFF0000)
    .setDescription('You must be an Administrator to use this command!');
    message.channel.send(embed);
    return;
  }
}

function info(message) {
  con.query("SELECT SUM(words) AS words FROM users", (err, total) => {
    //let timer = startTimer();
    let embed = new MessageEmbed()
    .setTitle(client.user.tag)
    .setColor(0xBF66E3)
    .setDescription('Counting Words... *please help me*')
    .setThumbnail(client.user.avatarURL())
    .addField('Authors', '`TacticalGubbins#0900`n`Cyakat#5061`', true)
    .addField('Version', version, true)
    .addField('Uptime', getUptime(), true)
    .addField('Total Words Tracked', total[0].words, true)
    .addField('Server Count', client.guilds.cache.size, true)
    .addField('Library', '[discord.js](' + 'https://discord.js.org/#/' + ')', true)
    .setFooter('Requested by ' + message.author.tag);
    message.channel.send(embed);
    //stopTimer(timer);
  });
  return;
}

function settings(message) {
  con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild.id , (err, response) => {
    let cooldown = response[0].cooldown;
    let strings = response[0].strings;

    let embed = new MessageEmbed()
    .setTitle(message.guild.name + " Settings")
    .setColor(0xBF66E3)
    .setDescription("Use:n**" + prefix + "cooldown** to change the cooldownn**" + prefix + "triggers** to change the trigger wordsn**" + prefix + "setPrefix** to change the server prefix")
    .setThumbnail(message.guild.iconURL())
    .addField('Prefix', prefix, true)
    .addField('Cooldown Time', + cooldown + " seconds", true)
    .addField('Trigger Words', strings)
    .setFooter('Requested by ' + message.author.tag);
    message.channel.send(embed);

  });

  return;
}

function global(message) {
  con.query("SELECT server_id, id, SUM(words) AS 'words' FROM users GROUP BY id ORDER BY words DESC;", (err, response) => {
    let embed = new MessageEmbed()
    .setColor(0xBF66E3)
    .setTitle('Global Leaderboard')
    .setDescription('The top-sending users world-widenThis uses a collection of all messages these users have sent')
    .setFooter('Requested by ' + message.author.tag);

    getTop(message, response, embed);
  });
  //getGlobalTop(message);
  return;
}

function bottom(message) {
  let bottomEmbed = new MessageEmbed()
  .setTitle('')
  .setColor(0xBF66E3)
  .setDescription("Bottom User")
  .setFooter('Requested by ' + message.author.tag)
  .setThumbnail('https://cdn.discordapp.com/avatars/445668261338677248/' + client.users.cache.get('445668261338677248').avatar + '.png?size=128')
  .addField('Darwen', '__**-69420**__ sent')
  message.channel.send(bottomEmbed);
  return;
}

function achievementsCheck(message, data, args) {
  let user;
  let achievementCounter = 0;
  let showHidden;
  let keys = Object.keys(achievements);
  let embed = new MessageEmbed();
  let newField = false;

  //check to see if the value inputted is a user
  if(args[1] === undefined) {
    user = message.author.id;
    showHidden = true;
  } else {
    user = args[1].replace(/D/g,'');
    showHidden = false;
  }
  if(client.users.cache.get(args[1].toString()) !== undefined) {
    con.query('SELECT * FROM achievements WHERE id = ' + user, (err, rows) => {

      if(rows[0] === undefined) {
        con.query('INSERT INTO achievements (id) VALUE (' + user + ')', (err, res) => {
        });
        newField = true;
      }

      if(!newField) {
        for(let i in keys) {
          achievementCode = keys[i];
          let description = 'This achievement is hidden';

          if(user !== client.user.id) {
            if(rows[0][achievementCode] != 0) {
              if(achievements[achievementCode].hidden && showHidden || achievements[achievementCode].hidden === false) {
                description = achievements[achievementCode].description
              }
              embed.addField(achievements[achievementCode].title, description, true);
              achievementCounter += 1;
            }
          }
          else {
            embed.setColor(0xFF0000)
            .addField("Bots can't earn achivements", "They just can't. It says it right here in the code")
            .setFooter('Requested by ' + message.author.tag);

            message.channel.send(embed);
            return;
          }
        }
      }

      if(achievementCounter === 0) {
        if(user === message.author.id){
          embed.addField('No achievements','You have not earned any achievements');
        }
        else {
          embed.addField('No achievements','They have not earned any achievements');
        }
      }
      embed.setTitle('Achievements')
      .setColor('0xBF66E3')
      .setFooter('Requested by ' + message.author.tag );

      if(showHidden) {
        let helpEmbed = new MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription("Check your dms :>")
        ;
        message.channel.send(helpEmbed);
        message.author.send(embed);
      } else {
        message.channel.send(embed);
      }
      });
    } else {
      embed.setTitle('')
      embed.setColor(0xFF0000)
      embed.setDescription("That's not a person!");
      //message.channel.send("That's not a person!")
      message.channel.send(embed);
    }
    return;
}

function giveAchievements(user, data, achievementCode, specialData) {

	notification = achievements[achievementCode].notification;

  let newField  = false;
  con.query('SELECT * FROM achievements WHERE id = ' + user.id, (err, rows) => {
    if(rows[0] === undefined) {
			let myDate = new Date(Date.now());
			let timestamp = myDate.toGMTString() + myDate.toLocaleString();
			timestamp = timestamp.substr(0,16);
			//console.log(timestamp);

      con.query('INSERT INTO achievements (id) VALUE (' + user.id + ')', () => {
        con.query('SELECT * FROM achievements WHERE id = ' + user.id, (err, rows2) => {
          if(rows2[0][achievementCode] === 0) {
            if(notification) {
              let embed = new MessageEmbed()
              .setTitle('Achievement Earned:')
              .setColor(0xBF66E3)
              .addField(achievements[achievementCode].title, achievements[achievementCode].description)
              .setThumbnail(achievements[achievementCode].image)
              .setDescription("Earned at " + timestamp)

							if(achievements[achievementCode].notification) {
								user.send(embed);
							}
            }

            con.query('UPDATE achievements SET \`' + achievementCode + '\` = ' + Date.now() + ' WHERE id = ' + user.id);
          }
        });
      });
      newField = true;
    }

    if(!newField){
      if(rows[0][achievementCode] === 0) {
        let embed = new MessageEmbed()
        .setTitle('Achievement Earned:')
        .setColor(0xBF66E3)
        .addField(achievements[achievementCode].title, achievements[achievementCode].description)
        .setThumbnail(achievements[achievementCode].image)
        .setTimestamp();

				if(achievements[achievementCode].notification) {
        	user.send(embed);
				}

        con.query('UPDATE achievements SET \`' + achievementCode + '\` = ' + Date.now() + ' WHERE id = ' + user.id);
      }
    }
  });
}

//fucntion to write in the array to the data file
function write (data) {

  //Save file
  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
  });
}


//generate a new password
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


function getUptime() {
  let seconds = parseInt(client.uptime/1000);
  let minutes = 0;
  let hours = 0;
  let days = 0;

  while(seconds >= 60) {
    minutes++;
    seconds -= 60;
  }

  while(minutes >= 60) {
    hours++;
    minutes -= 60;
  }

  while(hours >= 24) {
    days++;
    hours -= 24;
  }

  return days + 'd ' + hours + 'hr ' + minutes + 'm ' + seconds + 's';

}

function getOGS(data) {
  let ogs = new Set();
  for(var i = 0; i < data.ogs.length; i++) {
    ogs.add(data.ogs[i]);
  }
  return ogs;
}

function startTimer() {
  let timer = Date.now();
  return timer;
}

function stopTimer(timer) {
  let timer2 = Date.now();
  logging.debug((timer2 - timer)/1000);
}

function getTop(message, response, embed) {
  let inTop = false;
  let pos = 1;

  for(let i = 0; i < response.length; i++) {
    try{
      let user = client.users.cache.get(response[i].id.toString());
      //get user and server
      i = parseInt(i);

      //add user positions, max of 10, from json object
      if(user.id === message.author.id) {
        embed.addField('#' + (pos) + ' `' + message.author.username + '`', response[i].words);
        inTop = true;
      } else {
        if(i < 11) {
          embed.addField('#' + (pos) + ' ' + user.username, response[i].words);
        }
      }

      if(inTop === false && user.id === message.author.id) {
        embed.addField('#' + (i+1) + ' `' + message.author.username + '`', response[i].words, true);
        break;
      } else if(inTop === true && pos === 10) {
        break;
      }
      pos++;
    }
    catch(err) {}

  }
  message.channel.send(embed);
}

function getTotal() {
  con.query("SELECT SUM(words) AS words FROM users", (err, total) => {
    return total;
  });
}

client.login(config.token);
