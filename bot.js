//hmmmmm

//Discord.js Library initialization
const {MessageAttachment, MessageEmbed, MessageCollector, Intents} = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

//extra libraries
const fs = require('fs');
const colors = require('colors');
const math = require('math');
const mysql = require('mysql');
const {logging} = require('./custom objects/logging');
const Piscina = require('piscina');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
//Create piscina worker pool
const piscina = new Piscina({
  filename: 'worker.js'
});

const botID = '687077283965567006';

//config.json has the bot's key and the key for DBLapi as well as the database password and user
const config = require("../config.json");

//Command handler. This goes through the command folder and stores the commands in json objects which can be called later
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

slashCommands = new Discord.Collection();
slashCommandFiles = fs.readdirSync('./slash commands').filter(file => file.endsWith('.js'));
for (const file of slashCommandFiles) {
	const slashCommand = require(`./slash commands/${file}`);
	slashCommands.set(slashCommand.data.name, slashCommand);
}

slashCommandsList = [];
slashCommandListFiles = fs.readdirSync('./slash commands').filter(file => file.endsWith('.js'));
for (const file of slashCommandListFiles) {
  const slashCommandList = require(`./slash commands/${file}`);
  slashCommandsList.push(slashCommandList.data.toJSON());
}

const rest = new REST({ version: '9'}).setToken(config.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands("664652964962631680"),
      {body: slashCommandsList},
    );

    console.log('Successfully reloaded application (/) commands.');
  }
  catch (error) {
    console.error(error);
  }
})();


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
const version = '3.11.0';
//version number: 1st = very large changes; 2nd = minor changes; 3rd = bug fixes and patches;
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
    return logging.error('error: ' + err.message);
  }
    logging.info('Connected to the database');
});

//OBJECTS************************
//***************************

//runs with the bot starts up
client.on('ready', () => {
  logging.info("BOT ONLINE");

	//states version upon startup in the bot's status
  client.user.setActivity(`v${version}`, {type : 'STREAMING'})
  //.then(presence => logging.info(`Activity set to ${presence.activities[0].name}`));

	//alternates displaying n!help for help and the total amount of words tracked ever in the bot's status
	//it will also sometimes display the "ppLength" variable. I know this is immature but its funny. gotta have some fun with the code you know?
  setInterval(() => {
		if(shardId === 0) {
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
		}
Discord.Permissions.FLAGS.MANAGE_GUILD
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
        logging.info(`The shard id is: ${message.data.shardId}`);
				shardId = message.data.shardId;
    };
});

let recentMessage = new Set();

client.on("interactionCreate", async (interaction) => {
  logging.debug("started interaction");

  commandName = interaction.commandName;

  //this little bit is what makes the buttons work in the slash commands
  //it will ignore anything that doesn't have a / command tied to its name
  if (!slashCommands.has(commandName)) return;

  let arguments = {version, voteLink, data, changelog, discordLink, invLink, shardId};
  await slashCommands.get(commandName).execute(interaction, Discord, client, con, arguments);

});

//runs everytime a message is sent
client.on("messageCreate", async (message) => {
  logging.debug("message recieved");
  console.log(message.content)

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
	  .setFooter({text:'For private server:\n\ngetverify: retrieves current verify code'})
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

		await message.channel.send({embeds: [helpEmbed]});

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
  });
  let channelMessage = {
    "content": message.content,
    "author": message.author.id,
    "guild": message.guild.id
  };
  //pass message content and the strings to the worker and the worker should spit out a number *fingers crossed
  //this set of queries gets all of the appropriate user and server information necessary for tracking the words of the user
  con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild.id, (err, server) => {
    con.query('SELECT cooldown, words FROM users WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id, (err2, user) => {
      //tries to put the tracked words of a server into the wordArgs variable and will provide the default words if it fails.
      try {
        wordArgs = server[0].strings.split(/[s ,]/);
      }
      catch(err) {
        wordArgs = defaultStrings;
        try {
          con.query("INSERT IGNORE INTO servers (id, prefix, cooldown, strings) VALUE (" + message.guild.id + ", '"+ defaultPrefix +"', "+ defaultCooldownTime +", '"+ defaultStrings +"')");
        }
        catch(err){};
      }
      try {
        cooldown = user[0].cooldown;
      }
      catch(err) {
        cooldown = 0
      }

      if (user[0] === undefined){
        con.query('INSERT IGNORE INTO users (id, server_id, cooldown, words) value (' + message.author.id +', ' + message.guild.id + ', 0, 0)');
        logging.info("Created new user!");

      }

      let channelMessage = {
        "wordArgs": wordArgs,
        "cooldown": cooldown,
        "content": message.content
      }

      //this function no longer works when in the sql query just move it outside i guess??? best to try it first
      numWords = piscinaTask(channelMessage).then(numWords => {
        console.log(numWords);

        //if this is the first time a user has a sent a tracked word in that server it will create a new entry in the users database.
        //if the users exists in the database it will add the number of words sent in the message to the users current amount
        if(user[0] === undefined) {
          con.query('UPDATE users SET words = ' + (0 + numWords) + ' WHERE id = ' + message.author + ' AND server_id = ' + message.guild);
        }
        else {
          con.query('UPDATE users SET words = ' + (parseInt(user[0].words) + numWords) + ' WHERE id = ' + message.author + ' AND server_id = ' + message.guild);
        }
        //if the user has sent more than five words, multiply the number of tracked words they have sent by the cooldown time and then add that to the epoch time and store it in the users entry in the database for that server
        if(numWords >= 5) {
          con.query('UPDATE users SET cooldown = ' + (Date.now() + ((server[0].cooldown) * 1000)) + ' WHERE id = ' + message.author + ' AND server_id = ' + message.guild);
        }
      });

    });
  });


  /*pool.exec(channelMessage).then(result => {});*/
});

async function piscinaTask(channelMessage) {
  const numWords = await piscina.runTask(channelMessage);
  return numWords;
}

//writes the data in memory to data.json so it can be saved across restarts
async function write(data) {
  //Save file
  await fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
  });
}

client.login(config.token);
