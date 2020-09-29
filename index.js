//hmmmmm

const {Client, MessageAttachment, MessageEmbed, MessageCollector} = require('discord.js');
const client = new Client();

const fs = require('fs');
const colors = require('colors');
const math = require('math');
const mysql = require('mysql');

const config = require("../test.json");
const changelog = require("./changelog.json");
const achievements = require('./achievements.json');

const DBL = require("dblapi.js");
const dbl = new DBL(config.topToken, client);

const invLink = 'https://discordapp.com/oauth2/authorize?client_id=730199839199199315&scope=bot&permissions=392257';
const discordLink = 'https://discord.gg/Z6rYnpy'

const version = '3.8.0';

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
  user: 'root',
  password: config.database,
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
    giveAchievements(member, data, 'joinServer');
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
    giveAchievements(message.author, data, "template", template1);
  }

  //ignore messages sent in dms
  if(message.channel.type === 'dm' && (message.content.toLowerCase().startsWith("n!help") || message.content.toLowerCase().startsWith("help"))) {
    let embed = new MessageEmbed()
    .setTitle('Bot Help')
    .setColor(0xBF66E3)
    .setDescription('')
    .setFooter('For private server:\n\ngetverify: retrieves current verify code')
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
    .addField('n!' + 'achievements', 'Shows which achievements you or the specified person have earned. The bot will DM you if you check yourself')
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
      logging.warn('Could not send dm to louie. This should only happen if the testing bot is running \n');
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
    prefix = prefixResponse[0].prefix;

    //splits the sentence into an array, splitting at spaces
    let args = message.content.split(" ");
    args = args.filter(item => !!item);

    //this switch statement handels all of the commands and if no commands are said, the bot will count the amount of tracked words in the message. this is handled by the default
    switch(true) {
      case (message.content === "🥚"):
        giveAchievements(message.author, data, "egg");
        break;
      case (message.content.toLowerCase().startsWith(prefix + "bottom")):
        bottom(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "global") || message.content.toLowerCase().startsWith(prefix + "globalleaderboard") || message.content.toLowerCase().startsWith(prefix + "globallead")):
        global(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "settings")):
        settings(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "info") || message.content.toLowerCase().startsWith(prefix + "stats")):
        info(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "cooldown")):
        cooldownFunction(message, args);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "triggers")):
        triggers(message);
        break;
      case (message.content.toLowerCase().startsWith("invitenow")):
        invitenow(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "check") || message.content.toLowerCase().startsWith(prefix + "count")):
        check(message, args);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "total")):
        total(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "invite")):
        invite(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "archive")):
        archive(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "top")):
        top(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + 'leaderboard') || message.content.toLowerCase().startsWith(prefix + 'lead')):
        leaderboard(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + 'deleteinfo') || message.content.toLowerCase().startsWith(prefix + 'delete')):
        deleteInfo(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + 'userinfo')):
        userinfo(message);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "help")):
        help(message, prefix);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "changelog")):
        changelogFunction(message, args);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "setprefix") || message.content.toLowerCase().startsWith(prefix + "prefix")):
        prefixFunction(message, prefix, args);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "setpplength") || message.content.toLowerCase().startsWith(prefix + "setpp") || message.content.toLowerCase().startsWith(prefix + "pp")):
        pp(message, data, args);
        break;
      case (message.content.toLowerCase().startsWith(prefix + "achievements") || message.content.toLowerCase().startsWith(prefix + "achievement")):
        achievementsCheck(message, data, args);
        return;
        break;
      case (message.guild.id == 694263395884728412 && message.channel.id == 694265200454402108 && message.content == fs.readFileSync('PASSWORD.txt')):
        checkVerify(message);
        break;
      case (message.guild.id == 694263395884728412 && message.channel.id != 694265200454402108 && message.content.toLowerCase().startsWith("getverify")):
        message.channel.send("Current verify message: **" + fs.readFileSync('PASSWORD.txt').toString() + "**");
        return;
        break;

      default:

        break;
    }
    let words = message.content.split(/[\s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
    words = words.filter(item => !!item);
    /*for(var j = 0; j < wordArgs.length; j++) {

      curr = wordArgs[j];

      let trackedWords = getTrackWords(message, data);*/
    con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild.id, (err, server) => {
      con.query('SELECT cooldown, words FROM users WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id, (err2, user) => {
        let nword = 0;
        let doesNotExist = false;
        let trackedWords = new Set();
        let wordArgs = server[0].strings.split(/[\s ,]/);
        wordArgs = wordArgs.filter(item => !!item);
        for(let i of wordArgs) {
          trackedWords.add(i);
        }



        for(let j in words) {
          curr = words[j];

          try {

            if(trackedWords.has(curr.toLowerCase())) {
              if(user[0].cooldown < Date.now()) {
                con.query('UPDATE users SET cooldown = 0 WHERE id = ' + message.author.id + ' AND  server_id = ' + message.guild.id);
              }

              checkIfShouldWrite = true;

              if (user[0].cooldown > 0) {
                break;
              }

              nword++;

            }
          }
          catch(err) {
            doesNotExist = true;
          }
        }
        if(checkIfShouldWrite) {
          checkIfShouldWrite = false;
          con.query('UPDATE users SET words = ' + (parseInt(user[0].words) + nword) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
          if(nword >= 5) {
            con.query('UPDATE users SET cooldown = ' + (Date.now() + ((server[0].cooldown) * 1000)) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
            setTimeout(() => {
              con.query('UPDATE users SET cooldown = 0 WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
            }, (server[0].cooldown) * 1000);
          }
        }
        if(doesNotExist) {
          con.query('INSERT INTO users (id, server_id, cooldown, words) VALUE (' + message.author.id + ', ' + message.guild.id + ', 0, ' + nword + ')' );
          doesNotExist = false;
        }
      });
    });
      /*try {
        if(trackedWords.has(curr.toLowerCase())) {
          //var authorPos = -1;
          checkIfShouldWrite = true;

          ////

          if(data.blacklist === undefined) {
            data.blacklist = {};
          }

          if(data.servers[server].users[authorPos].cooldown < Date.now()) {
            data.servers[server].users[authorPos].cooldown = 0;
            //write(data);
          }

          if(data.blacklist[message.author.id] < Date.now()) {
            delete data.blacklist[message.author.id];
            logging.info('Removed ' + message.author.username + 'from the blacklist');
          }

          if(data.servers[server].users[authorPos].cooldown > 0 || data.blacklist[message.author.id] > Date.now()) {
            authorPos = authorPos;
            break;
          }



          //add +1 to the user in the data array
          data.servers[server].users[authorPos].words = parseInt(data.servers[server].users[authorPos].words) + 1;
          data.totalSent++;
          nword++;
        }
      }
      catch(err) {
        logging.warn("\nSomething happened with the blacklist stuff \n");
        console.log(err + "\n \n");
      }


      if(j == wordArgs.length - 1 && checkIfShouldWrite == true) {
        let watchingSet = getWatching(watching);

        //special message for savi --- simp!
        /*if(message.author.id == 395980133565071360) {
          const attachmentSavi = new MessageAttachment('./savi.jpg');
          message.channel.send(attachmentSavi);
          console.log(`SAVI SENT THE N-WORD`);
        }
        //check to see if there is a new top user
        findTopUser(data);
        /*if(data.servers[server].users[authorPos].words > data.topUser.words) {
          //re-define the top user
          data.topUser.username = message.author.username;
          data.topUser.id = message.author.id;
          data.topUser.words = data.servers[server].users[authorPos].words;
          data.topUser.avatar = message.author.avatarURL();

          console.log(`new top user:` + data.topUser.username);
        }

        //update username
        data.servers[server].users[authorPos].username = message.author.username;


        //console.log(`message sent by ` + message.author.username + ` in ` + message.channel.guild.name + `: ` + message.content);
        //console.log(data.totalSent)
        checkIfShouldWrite = false;

        if(nword >= 5) {
          //cooldown.add(message.author.id);
          data.servers[server].users[authorPos].cooldown = (Date.now() + ((data.servers[server].cooldown * nword) * 1000));
          setTimeout(() => {
            //cooldown.delete(message.author.id);
            for(var i = 0; i < data.servers[server].users.length; i++) {
              if(data.servers[server].users[i].id == message.author.id) {
                data.servers[server].users[i].cooldown = 0;
                //write(data);
                break;
              }
            }
          }, (data.servers[server].cooldown * nword) * 1000);
        }

        if(nword >= 20) {

          if(!(watchingSet.has(message.author.id)) && data.blacklist[message.author.id] === undefined) {
            watching.push({
              "id": message.author.id,
              "words": nword,
              "time": Date.now() + 600000
            });
          }
        }


        if(watchingSet.has(message.author.id)) {
          for(var o = 0; o < watching.length; o++) {
            try {
              if(watching[o].id === message.author.id) {
                if(watching[o].words > 5000) {
                  data.blacklist[message.author.id] = Date.now() + 345600000;
                  logging.info(`${message.author.username} was blacklisted`);
                  let embed = new MessageEmbed()
                  .setTitle('')
                  .setColor()
                  .setColor(0xFF0000)
                  .setDescription(`You sent ${watching[o].words} words within 10 minutes, this is considered spamming, so to keep the bot running optimally, you have been blacklisted for **4** days`)
                  ;

                  message.author.send(embed);
                  delete watching[o];
                }
                else if(Date.now() > watching[o].time) {
                  delete watching[o];
                  //console.log(watching);
                  break;
                } else {
                  watching[o].words += nword;
                  break;
                }
              }
            }
            catch(err) {

            }
          }
          watching = watching.filter(item => !!item);
        }

        nword = 0;

        //write in the new data
        //write(data);
      }
      if(j == wordArgs.length-1) {
        return;
      }
    }*/



    /*if(message.content === "🥚") {
      giveAchievements(message.author, data, "egg");
    }

    if(message.content.toLowerCase().startsWith(prefix + "bottom")) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Bottom User")
      .setFooter('Requested by ' + message.author.tag)
      .setThumbnail('https://cdn.discordapp.com/avatars/445668261338677248/' + client.users.cache.get('445668261338677248').avatar + '.png?size=128')
      .addField('Darwen', '__**-69420**__ sent')
      message.channel.send(embed);
      return;
    }

    /*if(message.content === "hi" && message.author.id === "249382933054357504") {
      addServerNames(data);
    }

    if(message.content.toLowerCase().startsWith(prefix + "global") || message.content.toLowerCase().startsWith(prefix + "globalleaderboard") || message.content.toLowerCase().startsWith(prefix + "globallead")) {

      con.query('SELECT server_id, id, SUM(words) AS \'words\' FROM users GROUP BY id ORDER BY words DESC;', (err, response) => {
        let embed = new MessageEmbed()
        .setColor(0xBF66E3)
        .setTitle('Global Leaderboard')
        .setDescription('The top-sending users world-wide\nThis uses a collection of all messages these users have sent')
        .setFooter('Requested by ' + message.author.tag);

        getTop(message, response, embed);
      });
      //getGlobalTop(message);
      return;
    }

    /*if(message.content.toLowerCase().startsWith(prefix + "transferdata") || message.content.toLowerCase().startsWith(prefix + "transfer")) {
      assignOG(data, message);
      return;
    }

    if(message.content.toLowerCase().startsWith(prefix + "settings")) {
      con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild.id , (err, response) => {
        let cooldown = response[0].cooldown;
        let strings = response[0].strings;

        let embed = new MessageEmbed()
        .setTitle(message.guild.name + " Settings")
        .setColor(0xBF66E3)
        .setDescription("Use:\n**" + prefix + "cooldown** to change the cooldown\n**" + prefix + "triggers** to change the trigger words\n**" + prefix + "setPrefix** to change the server prefix")
        .setThumbnail(message.guild.iconURL())
        .addField('Prefix', prefix, true)
        .addField('Cooldown Time', + cooldown + " seconds", true)
        .addField('Trigger Words', strings)
        .setFooter('Requested by ' + message.author.tag);
        message.channel.send(embed);

      });

      return;
    }

    if(message.content.toLowerCase().startsWith(prefix + "info") || message.content.toLowerCase().startsWith(prefix + "stats")) {
      con.query("SELECT SUM(words) AS words FROM users", (err, total) => {
        //let timer = startTimer();
        let embed = new MessageEmbed()
        .setTitle(client.user.tag)
        .setColor(0xBF66E3)
        .setDescription('Counting Words... *please help me*')
        .setThumbnail(client.user.avatarURL())
        .addField('Authors', '`TacticalGubbins#0900`\n`Cyakat#5061`', true)
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

    if(message.content.toLowerCase().startsWith(prefix + "cooldown")) {
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
          con.query("UPDATE servers SET cooldown = 0 WHERE id = " + message.guild.id, (err));
          //data.servers[server].cooldown = 0;
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription('**Removed cooldown time!**\n\n*active cooldowns will not be cleared*')
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
          con.query("UPDATE servers SET cooldown = " + args[1] + " WHERE id = " + message.guild.id, (err));
          //data.servers[server].cooldown = parseInt(args[1]);
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription('Changed cooldown time to **__' + args[1] + '__** seconds\n\n*active cooldowns will not be cleared*')
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

    //change strings for server counting
    if(message.content.toLowerCase().startsWith(prefix + "triggers")) {
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
            let strings = message.content.toLowerCase().split(/[\s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
            strings = strings.filter(item => !!item);
            strings = strings.filter((item, index) => strings.indexOf(item) === index);
            strings = strings.join(', ');
            //data.servers[server].strings = strings;
            con.query("UPDATE servers SET strings = " + strings + "WHERE id = " + message.guild.id, (err));

            let embed = new MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('**Trigger Setup Complete**\n\n Triggers added:\n' + strings);
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

    //create an invite to the server | fuck you seb!
    if(message.content.toLowerCase().startsWith("invitenow")) {

      message.channel.createInvite({maxAge: 0})
      .then(invite => message.channel.send("*FUCK YOU SEB :)* https://discord.gg/" + invite.code))
      .catch(console.error);

      //console.log(`\nCreated an invite in: ` + message.channel.guild.name + `, ` + message.channel.name);
      giveAchievements(message.author, data, "inviteNow");
    }

    //see how many n-words somebody has sent
    if(message.content.toLowerCase().startsWith(prefix + "check") || message.content.toLowerCase().startsWith(prefix + "count")) {
      let user;

      //check to see if the value inputted is a user
      if(args[1] === undefined) {
        /*let embed = new MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must include an @!');
        //message.channel.send("You must include an @!")
        message.channel.send(embed);

        return;
        user = message.author.id;
      } else {
        user = args[1].replace(/\D/g,'');
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
            embed.setDescription('That user hasn\'t sent any countable words!')
          }
          else {
            embed.setDescription(client.users.cache.get(user).tag + " has sent **__" + rows[0].words + "__** countable words!");
          }

      //find the id of the user in question
      //console.log(`\nFetching info for ${user}`);


            //let author = getUser(message, data);
        /*let author = -1;
        //find the position of the user in the data file
        for (var i = 0; i < data.servers[server].users.length; i++) {
          if(user == data.servers[server].users[i].id) {
              author = i;
              break;
          }
        }*/

        /*if(author === -1) {
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription("That user hasn't sent any countable words!")
          .setFooter('Requested by ' + message.author.tag);
          //message.channel.send("I think <@!" + args[1] + "> isn't very racist because they haven't said the n-word!")
          message.channel.send(embed);
          return;
        }
        //detect if the user has not sent the n-word
        if(data.servers[server].users[author].words === 0) {
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription(client.users.cache.get(user).tag + " hasn't sent any countable words!")
          .setFooter('Requested by ' + message.author.tag);
          //message.channel.send("I think <@!" + args[1] + "> isn't very racist because they haven't said the n-word!")
          message.channel.send(embed);
          return;
        }

          //send the number of words counted
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription(client.users.cache.get(user).tag + ' has sent **__' + data.servers[server].users[author].words + '__** countable words!')
          .setFooter('Requested by ' + message.author.tag)
          ;
          let userCooldown = (((data.servers[server].users[author].cooldown) - Date.now()) / 1000).toFixed(1) + " seconds";
          if(((data.servers[server].users[author].cooldown) - Date.now()) > 0) {
            embed.addField("Cooldown:", userCooldown, true);
          }
          if(data.blacklist[user] - Date.now() > 0) {
            embed.addField("Blacklisted: ", ((data.blacklist[user] - Date.now()) / 3600000).toFixed(1) + " hours", true);
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
    }

    //check the total amount of sent n-words
    if(message.content.toLowerCase().startsWith(prefix + "total")) {
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
      //console.log(`\n` + message.author.username + `(` + message.author.id + `) requested total words: ${data.totalSent} in ` + message.channel.guild.name);
    }
    if(message.content.toLowerCase().startsWith(prefix + "invite")) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("[[Click here to invite me]](" + invLink + ")" + "\n[[Click here to join the bot's server]](" + discordLink + ")")
      .setFooter('Requested by ' + message.author.tag)
      ;

      message.channel.send(embed);
    }

    //fetch and return the archive of n-words sent
    if(message.content.toLowerCase().startsWith(prefix + "archive")) {


      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('Sorry, this feature is currently disabled :(');
      //message.channel.send("sorry, this feature is disabled for the time being");
      message.channel.send(embed);

      //message.react('❌')
      //.catch(console.error);

      //console.log(`\n` + message.author.username + `(` + message.author.id + `) requested the archive in ` + message.channel.guild.name);
    }

    //fetch and return the top sending user info
    if(message.content.toLowerCase().startsWith(prefix + "top")) {
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
      /*let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Top User")
      .setFooter('Requested by ' + message.author.tag)
      .setThumbnail(data.topUser.avatar)
      .addField(data.topUser.username, '__**' + data.topUser.words + '**__ sent')
      ;
        //message.channel.send("The user with the largest amount of n-words sent is: **" + top[0] + "** with **__" + top[1] + "__** n-words sent!");
        message.channel.send(embed);


      //console.log(`\n` + message.author.username + `(` + message.author.id + `) requested the top user in ` + message.channel.guild.name);
    }

    //retrive top 10 users
    if(message.content.toLowerCase().startsWith(prefix + 'leaderboard') || message.content.toLowerCase().startsWith(prefix + 'lead')) {

      //quieres stuff
      con.query("SELECT * FROM users WHERE server_id =  '" + message.guild.id + "' ORDER BY words DESC", (err, response) => {
        let embed = new MessageEmbed()
        .setColor(0xBF66E3)
        .setTitle(message.guild.name + ' Leaderboard')
        .setDescription("This is the server's local leaderboard")
        .setFooter('Requested by ' + message.author.tag);

        getTop(message, response, embed);
      });

      //getTop(message, data);

    }

    //delete user info upon request
    if(message.content.toLowerCase().startsWith(prefix + 'deleteinfo') || message.content.toLowerCase().startsWith(prefix + 'delete')) {

      let embed = new MessageEmbed()
      .setTitle('Data Deletion')
      .setColor(0xBF66E3)
      .setDescription('Are you sure all of your data on this server? *this is non-recoverable*\n\n Type:')
      .addField('**' + message.author.username + '** (your username)', 'to delete your data')
      .addField("**Cancel**", 'to cancel')
      .setFooter('Requested by ' + message.author.tag)
      ;
      message.channel.send(embed);

      //create a message collector that checks for cancel or username
      let collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
      collector.on('collect', message => {

        //delete user info
        if (message.content === message.author.username) {
          //deleteUserInfo(data, message);
          con.query('DELETE FROM users WHERE id = ' + message.author.id, (err) => {});
          con.query('DELETE FROM achievements WHERE id = ' + message.author.id);
          let deleteEmbed = new MessageEmbed()
          .setTitle('')
          .setColor()
          .setColor(0xFF0000)
          .setDescription('Your data has been deleted, sorry to see you go :<')
          ;
          message.channel.send(deleteEmbed);
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
    }

    //user info
    if(message.content.toLowerCase().startsWith(prefix + 'userinfo')) {
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


    }

    //fetch and return the help file
    if(message.content.toLowerCase().startsWith(prefix + "help")) {
      let helpEmbed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Check your dms :>")
      ;
      message.channel.send(helpEmbed);

      //let help = fs.readFileSync('help.txt')
      let embed = new MessageEmbed()
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
      .addField(prefix + 'transferData', '(transfer) Transfer your data from the original N-Word (Only works in __one__ server, this is non-reversible)', true)
      .addField(prefix + 'changelog', 'Shows the changelog for the specified version and if no version is specified the lastest changelog will be shown', true)
      .addField(prefix + 'achievements', 'Shows which achievements you or the specified person have earned. The bot will DM you if you check yourself')
      .addField("Server Setup", "----")
      .addField(prefix + "settings", "View all current server settings", true)
      .addField(prefix + 'triggers', 'Starts setup in order to change countable words', true)
      .addField(prefix + 'cooldown', 'Change the server cooldown for counted words', true)
      .addField(prefix + 'setPrefix', '(prefix) Changes the prefix for the server', true)
      ;
      //message.author.send(`${help}`);
      message.author.send(embed);

      //console.log(`\n` + message.author.username + `(` + message.author.id + `) requested help file in ` + message.channel.guild.name);
    }

    //fetches the changelog for the version specified
    if(message.content.toLowerCase().startsWith(prefix + "changelog")) {

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
    }

    if(message.content.toLowerCase().startsWith(prefix + "setprefix") || message.content.toLowerCase().startsWith(prefix + "prefix")) {
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
    }
    if(message.content.toLowerCase().startsWith(prefix + "setpplength") || message.content.toLowerCase().startsWith(prefix + "setpp") || message.content.toLowerCase().startsWith(prefix + "pp")) {

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

    if(message.content.toLowerCase().startsWith(prefix + "achievements") || message.content.toLowerCase().startsWith(prefix + "achievement")) {
      achievementsCheck(message, data, args);
      return;
    }


    //VERIFICATION FOR *MY* SERVER
    if(message.guild.id == 694263395884728412 && message.channel.id == 694265200454402108 && message.content == fs.readFileSync('PASSWORD.txt')) {
      message.guild.member(message.author).roles.add('694263460355244074');
      message.guild.member(message.author).roles.remove('694264932706943096');
      //console.log(`\n\n` + message.author.username + ` just verified`);

      password = newPASSWORD();

      message.guild.member('250408653830619137').send(message.author.username + " Just verfied\n\n**NEW PASSWORD:**\n`" + password + "`");
    }

    //get verification for *MY* server
    if(message.guild.id == 694263395884728412 && message.channel.id != 694265200454402108 && message.content.toLowerCase().startsWith("getverify")) {
      message.channel.send("Current verify message: **" + fs.readFileSync('PASSWORD.txt').toString() + "**");
    }

    let wordArgs = message.content.split(/[\s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
    wordArgs = wordArgs.filter(item => !!item);
    /*for(var j = 0; j < wordArgs.length; j++) {

      curr = wordArgs[j];

      let trackedWords = getTrackWords(message, data);
    con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild.id, (err, server) => {
      con.query('SELECT cooldown, words FROM users WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id, (err2, user) => {
        let nword = 0;
        let doesNotExist = false;
        let trackedWords = new Set();
        let words = server[0].strings.split(/[\s ,]/);
        words = words.filter(item => !!item);
        for(let i of words) {
          trackedWords.add(i);
        }



        for(let j in wordArgs) {
          curr = wordArgs[j];

          try {

            if(trackedWords.has(curr.toLowerCase())) {
              if(user[0].cooldown < Date.now()) {
                con.query('UPDATE users SET cooldown = 0 WHERE id = ' + message.author.id + ' AND  server_id = ' + message.guild.id);
              }

              checkIfShouldWrite = true;

              if (user[0].cooldown > 0) {
                break;
              }

              nword++;
            }
          }
          catch(err) {
            logging.warn("\nCreated new entry for a user \n");
            doesNotExist = true;
          }
        }
        if(checkIfShouldWrite) {
          checkIfShouldWrite = false;
          con.query('UPDATE users SET words = ' + (user[0].words + nword) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
          if(nword >= 5) {
            con.query('UPDATE users SET cooldown = ' + (Date.now() + ((server[0].cooldown) * 1000)) + ' WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
            setTimeout(() => {
              con.query('UPDATE users SET cooldown = 0 WHERE id = ' + message.author.id + ' AND server_id = ' + message.guild.id);
            }, (server[0].cooldown) * 1000);
          }
        }
        if(doesNotExist) {
          con.query('INSERT INTO users (id, server_id, cooldown, words) VALUE (' + message.author.id + ', ' + message.guild.id + ', 0, ' + nword + ')' );
          doesNotExist = false;
        }
      });
    });
      /*try {
        if(trackedWords.has(curr.toLowerCase())) {
          //var authorPos = -1;
          checkIfShouldWrite = true;

          ////

          if(data.blacklist === undefined) {
            data.blacklist = {};
          }

          if(data.servers[server].users[authorPos].cooldown < Date.now()) {
            data.servers[server].users[authorPos].cooldown = 0;
            //write(data);
          }

          if(data.blacklist[message.author.id] < Date.now()) {
            delete data.blacklist[message.author.id];
            logging.info('Removed ' + message.author.username + 'from the blacklist');
          }

          if(data.servers[server].users[authorPos].cooldown > 0 || data.blacklist[message.author.id] > Date.now()) {
            authorPos = authorPos;
            break;
          }



          //add +1 to the user in the data array
          data.servers[server].users[authorPos].words = parseInt(data.servers[server].users[authorPos].words) + 1;
          data.totalSent++;
          nword++;
        }
      }
      catch(err) {
        logging.warn("\nSomething happened with the blacklist stuff \n");
        console.log(err + "\n \n");
      }


      if(j == wordArgs.length - 1 && checkIfShouldWrite == true) {
        let watchingSet = getWatching(watching);

        //special message for savi --- simp!
        /*if(message.author.id == 395980133565071360) {
          const attachmentSavi = new MessageAttachment('./savi.jpg');
          message.channel.send(attachmentSavi);
          console.log(`SAVI SENT THE N-WORD`);
        }
        //check to see if there is a new top user
        findTopUser(data);
        /*if(data.servers[server].users[authorPos].words > data.topUser.words) {
          //re-define the top user
          data.topUser.username = message.author.username;
          data.topUser.id = message.author.id;
          data.topUser.words = data.servers[server].users[authorPos].words;
          data.topUser.avatar = message.author.avatarURL();

          console.log(`new top user:` + data.topUser.username);
        }

        //update username
        data.servers[server].users[authorPos].username = message.author.username;


        //console.log(`message sent by ` + message.author.username + ` in ` + message.channel.guild.name + `: ` + message.content);
        //console.log(data.totalSent)
        checkIfShouldWrite = false;

        if(nword >= 5) {
          //cooldown.add(message.author.id);
          data.servers[server].users[authorPos].cooldown = (Date.now() + ((data.servers[server].cooldown * nword) * 1000));
          setTimeout(() => {
            //cooldown.delete(message.author.id);
            for(var i = 0; i < data.servers[server].users.length; i++) {
              if(data.servers[server].users[i].id == message.author.id) {
                data.servers[server].users[i].cooldown = 0;
                //write(data);
                break;
              }
            }
          }, (data.servers[server].cooldown * nword) * 1000);
        }

        if(nword >= 20) {

          if(!(watchingSet.has(message.author.id)) && data.blacklist[message.author.id] === undefined) {
            watching.push({
              "id": message.author.id,
              "words": nword,
              "time": Date.now() + 600000
            });
          }
        }


        if(watchingSet.has(message.author.id)) {
          for(var o = 0; o < watching.length; o++) {
            try {
              if(watching[o].id === message.author.id) {
                if(watching[o].words > 5000) {
                  data.blacklist[message.author.id] = Date.now() + 345600000;
                  logging.info(`${message.author.username} was blacklisted`);
                  let embed = new MessageEmbed()
                  .setTitle('')
                  .setColor()
                  .setColor(0xFF0000)
                  .setDescription(`You sent ${watching[o].words} words within 10 minutes, this is considered spamming, so to keep the bot running optimally, you have been blacklisted for **4** days`)
                  ;

                  message.author.send(embed);
                  delete watching[o];
                }
                else if(Date.now() > watching[o].time) {
                  delete watching[o];
                  //console.log(watching);
                  break;
                } else {
                  watching[o].words += nword;
                  break;
                }
              }
            }
            catch(err) {

            }
          }
          watching = watching.filter(item => !!item);
        }

        nword = 0;

        //write in the new data
        //write(data);
      }
      if(j == wordArgs.length-1) {
        return;
      }
    }

  });*/
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

  //message.react('❌')
  //.catch(console.error);

  //console.log(`\n` + message.author.username + `(` + message.author.id + `) requested the archive in ` + message.channel.guild.name);
  return;
}

function invite(message) {
  let inviteEmbed = new MessageEmbed()
  .setTitle('')
  .setColor(0xBF66E3)
  .setDescription("[[Click here to invite me]](" + invLink + ")" + "\n[[Click here to join the bot's server]](" + discordLink + ")")
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
    user = args[1].replace(/\D/g,'');
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
        embed.setDescription('That user hasn\'t sent any countable words!')
      }
      else {
        embed.setDescription(client.users.cache.get(user).tag + " has sent **__" + rows[0].words + "__** countable words!");
      }

  //find the id of the user in question
  //console.log(`\nFetching info for ${user}`);


        //let author = getUser(message, data);
    /*let author = -1;
    //find the position of the user in the data file
    for (var i = 0; i < data.servers[server].users.length; i++) {
      if(user == data.servers[server].users[i].id) {
          author = i;
          break;
      }
    }*/

    /*if(author === -1) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("That user hasn't sent any countable words!")
      .setFooter('Requested by ' + message.author.tag);
      //message.channel.send("I think <@!" + args[1] + "> isn't very racist because they haven't said the n-word!")
      message.channel.send(embed);
      return;
    }
    //detect if the user has not sent the n-word
    if(data.servers[server].users[author].words === 0) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription(client.users.cache.get(user).tag + " hasn't sent any countable words!")
      .setFooter('Requested by ' + message.author.tag);
      //message.channel.send("I think <@!" + args[1] + "> isn't very racist because they haven't said the n-word!")
      message.channel.send(embed);
      return;
    }

      //send the number of words counted
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription(client.users.cache.get(user).tag + ' has sent **__' + data.servers[server].users[author].words + '__** countable words!')
      .setFooter('Requested by ' + message.author.tag)
      ;
      let userCooldown = (((data.servers[server].users[author].cooldown) - Date.now()) / 1000).toFixed(1) + " seconds";
      if(((data.servers[server].users[author].cooldown) - Date.now()) > 0) {
        embed.addField("Cooldown:", userCooldown, true);
      }
      if(data.blacklist[user] - Date.now() > 0) {
        embed.addField("Blacklisted: ", ((data.blacklist[user] - Date.now()) / 3600000).toFixed(1) + " hours", true);
      }*/

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

  //console.log(`\nCreated an invite in: ` + message.channel.guild.name + `, ` + message.channel.name);
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
        let strings = message.content.toLowerCase().split(/[\s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
        strings = strings.filter(item => !!item);
        strings = strings.filter((item, index) => strings.indexOf(item) === index);
        strings = strings.join(', ');
        //data.servers[server].strings = strings;
        con.query("UPDATE servers SET strings = \'" + strings + "\' WHERE id = " + message.guild.id);

        let embed = new MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription('**Trigger Setup Complete**\n\n Triggers added:\n' + strings);
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
      con.query("UPDATE servers SET cooldown = 0 WHERE id = " + message.guild.id, (err));
      //data.servers[server].cooldown = 0;
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription('**Removed cooldown time!**\n\n*active cooldowns will not be cleared*')
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
      con.query("UPDATE servers SET cooldown = " + args[1] + " WHERE id = " + message.guild.id, (err));
      //data.servers[server].cooldown = parseInt(args[1]);
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription('Changed cooldown time to **__' + args[1] + '__** seconds\n\n*active cooldowns will not be cleared*')
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
    .addField('Authors', '`TacticalGubbins#0900`\n`Cyakat#5061`', true)
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
    .setDescription("Use:\n**" + prefix + "cooldown** to change the cooldown\n**" + prefix + "triggers** to change the trigger words\n**" + prefix + "setPrefix** to change the server prefix")
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
  con.query('SELECT server_id, id, SUM(words) AS \'words\' FROM users GROUP BY id ORDER BY words DESC;', (err, response) => {
    let embed = new MessageEmbed()
    .setColor(0xBF66E3)
    .setTitle('Global Leaderboard')
    .setDescription('The top-sending users world-wide\nThis uses a collection of all messages these users have sent')
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
    user = args[1].replace(/\D/g,'');
    showHidden = false;
  }

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
          .addField('Bots can\'t earn achivements', 'They just can\'t. It says it right here in the code')
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
    }
    else {
      message.channel.send(embed);
    }
    return;
  });
  /*if(data.achievements[user] === undefined) {
    data.achievements[user] = {};
  }

  for(let i in keys) {
    achievementCode = keys[i];
    let description = 'This achievement is hidden';

    if(!(user === client.user.id)) {
      if(data.achievements[user][achievementCode] != undefined) {
      if(achievements[achievementCode].hidden && showHidden || achievements[achievementCode].hidden === false) {
        description = achievements[achievementCode].description
      }
      embed.addField(achievements[achievementCode].title, description, true);
      achievementCounter += 1;
      }
    }
    else {
      embed.setColor(0xFF0000)
      .addField('Bots can\'t earn achivements', 'They just can\'t. It says it right here in the code')
      .setFooter('Requested by ' + message.author.tag);

      message.channel.send(embed);
      return;
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
  }
  else {
    message.channel.send(embed);
  }
  return;*/
}

function giveAchievements(user, data, achievementCode, specialData) {
  let newField  = false;
  con.query('SELECT * FROM achievements WHERE id = ' + user.id, (err, rows) => {
    if(rows[0] === undefined) {
      con.query('INSERT INTO achievements (id) VALUE (' + user.id + ')', () => {
        con.query('SELECT * FROM achievements WHERE id = ' + user.id, (err, rows2) => {
          if(rows2[0][achievementCode] === 0) {
            let embed = new MessageEmbed()
            .setTitle('Achievement Earned:')
            .setColor(0xBF66E3)
            .addField(achievements[achievementCode].title, achievements[achievementCode].description)
            .setThumbnail(achievements[achievementCode].image)
            .setTimestamp();

            user.send(embed);

            con.query('UPDATE achievements SET ' + achievementCode + ' = 1 WHERE id = ' + user.id);
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

        user.send(embed);

        con.query('UPDATE achievements SET ' + achievementCode + ' = 1 WHERE id = ' + user.id);
      }
    }
  });
/*  if(data.achievements[user.id] === undefined) {
    data.achievements[user.id] = {};
  }

  if(data.achievements[user.id][achievementCode] === undefined){

    let embed = new MessageEmbed()
    .setTitle('Achievement Earned:')
    .setColor(0xBF66E3)
    .addField(achievements[achievementCode].title, achievements[achievementCode].description)
    .setThumbnail(achievements[achievementCode].image)
    .setTimestamp();

    user.send(embed);

    data.achievements[user.id][achievementCode] = Date.now();
  }*/

  /*let embed = new MessageEmbed();
  switch(achievementFlag) {
    case "roots":

      if(data.achievements[user.id].roots === undefined) {
        embed.setTitle('Back to the Roots')
        embed.setColor(0xBF66E3)
        embed.addField('Achievement','DM the bot the n-word',true)
        embed.setTimestamp();
        embed.setThumbnail('https://tikomc.tk/images/nwordpfp128.png')

      user.send(embed);

        data.achievements[user.id].roots = Date.now();
      }
      break;
    case "pp":

      if(data.achievements[user.id].pp === undefined) {
        embed.setTitle('PP')
        embed.setColor(0xBF66E3)
        embed.addField('Achievement','Discover the setPpLength command',true)
        embed.setTimestamp();

        user.send(embed);

        data.achievements[user.id].pp = Date.now();
      }
      break;
    case "changelog":

      if(data.achievements[user.id].changelog === undefined) {
        embed.setTitle('Stupid Idiot')
        embed.setColor(0xBF66E3)
        embed.addField('Achievement','Get the special changelog error',true)
        embed.setTimestamp();

        user.send(embed);

        data.achievements[user.id].changelog = Date.now();
      }
      break;
    case "inviteNow":
      if(data.achievements[user.id].inviteNow === undefined) {
        embed.setTitle('Fuck You Seb')
        embed.setColor(0xBF66E3)
        embed.addField('Achievement','Get the special invite link',true)
        embed.setTimestamp();

        user.send(embed);

        data.achievements[user.id].inviteNow = Date.now();
      }
      break;
    case "joinServer":
      if(data.achievements[user.id].joinServer === undefined) {
        embed.setTitle('A Supportive Boi')
        embed.setColor(0xBF66E3)
        embed.addField('Achievement','Join the support server',true)
        embed.setTimestamp();

        user.send(embed);

        data.achievements[user.id].joinServer = Date.now();
      }
      break;
    default:
      logging.warn("Uh this should not be showing up unless someone added an achievement without adding it here too");
      break;
  }*/
}

//fucntion to write in the array to the data file
function write (data) {

  //Save file
  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
  });
}



//organize users by num of nwords
/*function getTop(message, data) {
  //let server = getServer(message, data);

  //create new json object to sort
  var arr = JSON.parse(JSON.stringify(data));
  let pos = 0;
  let place = 0;
  let inTop = false;


  arr = arr.servers[server].users.sort((a, b) => b.words - a.words);

  //check to see if there are any users on this server
  if(data.servers[server].users.length < 3) {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor()
    .setColor(0xFF0000)
    .setDescription('There are not enough users to display a leaderboard')
    ;
    message.channel.send(embed);
    return;
  }

  //find user who is running command's position
  for(var i = 0; i < arr.length; i++) {
    pos++;
    if(arr[i].id == message.author.id) {
      break;
    }
  }
  if(Number.isInteger(pos/2) === false) {
    place = parseInt(pos/2) + 1;
  } else {
    place = (pos/2);
  }

  let embed = new MessageEmbed()
  .setColor(0xBF66E3)
  .setDescription("**Using the triggers: **" + data.servers[server].strings + "\n**Cooldown Time: **" + data.servers[server].cooldown + " seconds")
  .setFooter('Requested by ' + message.author.tag)
  .setTimestamp();

  //add user positions, max of 10, from json object
  for(var i = 0; i < data.servers[server].users.length && i < 10; i++) {
    embed.setTitle('Top ' + (i+1) + ' Users');
    if(arr[i].id === message.author.id) {
      embed.addField('#' + (i+1) + ' `' + arr[i].username + '`', arr[i].words);
      inTop = true;
    } else {
      embed.addField('#' + (i+1) + ' ' + arr[i].username, arr[i].words);
    }
  }

  //add final info
  if(inTop === false) {
    embed.addField('#' + pos + ' `' + message.author.username + '`', arr[pos-1].words, true);
  }

  //console.log(arr);
  message.channel.send(embed);
  return;

}*/

/*function deleteUserInfo(data, message) {
  let server = getServer(message, data);

  for(var i = 0; i < data.servers[server].users.length; i++) {
    if(data.servers[server].users[i].id === message.author.id && data.servers[server].users[i].words > 0) {
      data.totalSent -= data.servers[server].users[i].words;
      delete data.servers[server].users[i];
      data.servers[server].users = data.servers[server].users.filter(item => !!item);
      data.topUser.username = "NO TOP USERS";
      data.topUser.id = "0000";
      data.topUser.words = 0;
      data.topUser.avatar = "";

      let deleteEmbed = new MessageEmbed()
      .setTitle('')
      .setColor()
      .setColor(0xFF0000)
      .setDescription('Your data has been deleted, sorry to see you go :<')
      ;
      message.channel.send(deleteEmbed);

      findTopUser(data);

      //write(data);
      return;
    }
  }

  let embed = new MessageEmbed()
  .setTitle('')
  .setColor()
  .setColor(0xBF66E3)
  .setDescription("You haven't sent any key-words so I can't delete any data idiot")
  ;
  message.channel.send(embed);
  return;
}*/


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

   //console.log(`New PASSWORD Generated: ` + result + `\n\n`);
   return result;
}


/*function getTrackWords(message, data) {
  let server = getServer(message, data);
  let words = new Set();
  for(var i = 0; i < data.servers[server].strings.length; i++) {
    words.add(data.servers[server].strings[i]);
  }
  return words;
}*/

/*function getServer(message, data) {
  let server = -1;
  for(var i = 0; i < data.servers.length; i++) {
    if(data.servers[i].id === message.guild.id) {
     server = i;
    }
  }

  if(server === -1) {
    data.servers.push({
      "name": message.guild.name,
      "id": message.guild.id,
      "cooldown": 5,
      "strings": defaultStrings,
      "users": [],
    });
    //write(data);
    server = data.servers.length-1;
  }
  return server;
}*/

/*function getUser(message, data) {
  let server = getServer(message, data);
  let authorPos = -1;
  //find the position of the user in the data file
  for (var i = 0; i < data.servers[server].users.length; i++) {
    if(message.author.id == data.servers[server].users[i].id) {
        authorPos = i;
        break;
    }
  }

  //if the user has not sent a message before, create a line for the user
  if(authorPos === -1) {
    data.servers[server].users.push({
      "username" : message.author.username,
      "id" : message.author.id,
      "words" : 0,
      "cooldown" : 0
    });
    authorPos = data.servers[server].users.length-1;
  }

  //write(data);
  return authorPos;
}*/

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

/*function findTopUser(data) {

  let arr = {"users":[]};

  for(var server = 0; server < data.servers.length; server++) {
    for(var user = 0; user < data.servers[server].users.length; user++) {
      arr.users = arr.users.concat(data.servers[server].users[user]);
    }
  }

  arr = JSON.stringify(arr, null, 2);
  arr = JSON.parse(arr);


  for(var i = 0; i < arr.users.length; i++) {
    for(var o = i+1; o < arr.users.length; o++) {
      if(arr.users[i].id === arr.users[o].id) {
        arr.users[i].words += arr.users[o].words;
        delete arr.users[o];
        arr.users = arr.users.filter(item => !!item);
        o = i+1;
      }
    }
  }


  arr = arr.users.sort((a, b) => b.words - a.words);

  if(arr.length > 0 && arr[0].words > data.topUser.words) {
    data.topUser.username = arr[0].username;
    data.topUser.id = arr[0].id;
    data.topUser.words = arr[0].words;
    data.topUser.avatar = (client.users.cache.get(arr[0].id.toString())).avatarURL();
  }

  return;
  /*for(var server = 0; server < data.servers.length; server++) {
    for (var user = 0; user < data.servers[server].users.length; user++) {
      if(data.servers[server].users[user].words > data.topUser.words) {
        data.topUser.username = data.servers[server].users[user].username;
        data.topUser.id = data.servers[server].users[user].id;
        data.topUser.words = data.servers[server].users[user].words;
        data.topUser.avatar = (client.users.cache.get(data.servers[server].users[user].id.toString())).avatarURL();
      }
    }
  }
  return;
}*/

/*function assignOG(data, message) {
  let server = getServer(message, data);
  let user = getUser(message, data);
  let ogs = getOGS(data);

  if(ogs.has(message.author.id)) {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor()
    .setColor(0xFF0000)
    .setDescription("You've already transfered data to a server!")
    ;
    message.channel.send(embed);
    return;
  }

  for(var i = 0; i < oldData.users.length; i++) {
    if(oldData.users[i].id === message.author.id && oldData.users[i].nwords > 0) {
      data.servers[server].users[user].words += oldData.users[i].nwords;
      data.ogs.push(message.author.id);
      data.totalSent += oldData.users[i].nwords;
      findTopUser(data);

      let deleteEmbed = new MessageEmbed()
      .setTitle('')
      .setColor()
      .setColor(0xBF66E3)
      .setDescription('Your data has been transfered to this server! (' + oldData.users[i].nwords + " words)")
      ;
      message.channel.send(deleteEmbed);
      return;
    }
  }

  let embed = new MessageEmbed()
  .setTitle('')
  .setColor()
  .setColor(0xFF0000)
  .setDescription("Unfortunately you have no data to transfer")
  ;
  message.channel.send(embed);
  return;
}*/

function getOGS(data) {
  let ogs = new Set();
  for(var i = 0; i < data.ogs.length; i++) {
    ogs.add(data.ogs[i]);
  }
  return ogs;
}

/*function getGlobalTop(message) {
  let timer = startTimer();
  let users = new Array();
  let pos = 0;
  let place = 0;
  let inTop = false;

  /*for(var server = 0; server < data.servers.length; server++) {
    for(var user = 0; user < data.servers[server].users.length; user++) {
      users.add(data.servers[server].users[user]);
    }
  }

  for(let server of data.servers) {
    for(let user of server.users) {
      users.push(user);
    }
  }

/*  for(let server of data.servers) {
    users.push(server.users);
  }
  console.log(users);

  /*for(let group in users) {
    for(let usr in users[group]) {
      totalWords += users[group][usr];
    }
  }


  //arr = JSON.stringify(arr, null, 2);
  //arr = JSON.parse(arr);


  /*for(var i = 0; i < users.length; i++) {
    for(var o = i+1; o < users.length; o++) {
      if(users[i].id === users[o].id) {
        users[i].words += users[o].words;
        users[i].serverName = "pee";
        delete users[o];
        o = i+1;
        users = users.filter(item => !!item);
      }
    }
  }

/*  for(var i = 0; i < data.servers.length; i++) {
    for(var o = 0; o < data.servers[i].users.length; o++) {
      for(var p = 0; p < users.length; p++) {
        if(data.servers[i].users[o].id === users[p].id) {
          users[p].serverName = data.servers[i].name;
          if(users[p].serverName !== undefined) {
            break;
          }
        }
      }
    }
  }


  users = users.sort((a, b) => b.words - a.words);

  //check to see if there are any users on this server
  if(users.length < 3) {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor()
    .setColor(0xFF0000)
    .setDescription("There aren't enough users to display this leaderboard")
    ;
    message.channel.send(embed);
    return;
  }

  //find user who is running command's position
  for(let i in users) {
    pos++;
    if(users[i].id === message.author.id) {
      break;
    }
  }
  if(Number.isInteger(pos/2) === false) {
    place = parseInt(pos/2) + 1;
  } else {
    place = (pos/2);
  }

  let embed = new MessageEmbed()
  .setTitle('Global Leaderboard')
  .setColor(0xBF66E3)
  .setDescription("The top-sending users world-wide\nThis uses a collection of all messages these users have sent")
  .setFooter('Requested by ' + message.author.tag)
  .setTimestamp();

  var currentPos = 0;
  var o = 0;
  var trackedWords = [];
  var trackedWordsScore = [];
  var trackedWordsScoreSorted = [];
  var topWordPos = 0  ;

  for(var i = 0; i < data.servers.length; i++) {
    currentPos = i+o;
    for(var o = 0; o < data.servers[i].strings.length; o++) {
      trackedWords[currentPos+o] = data.servers[i].strings[o];
    }
  }
  trackedWords = trackedWords.filter(item => !!item);
  for(var i = 0; i < trackedWords.length; i++) {
    trackedWordsScore[i] = 1;
  }
  for(var i = 0; i < trackedWords.length; i++) {
    for(var o = i+1; o < trackedWords.length; o++) {
      if(trackedWords[i] === trackedWords[o]) {
        trackedWordsScore[i] = trackedWordsScore[i] + 1;
      }
    }
  }
  trackedWordsScoreSorted = trackedWordsScore.sort((a,b) => b-a);
  for(var i = 0; i < trackedWords.length; i++) {
    if(trackedWordsScoreSorted[0] === trackedWordsScore[i])
    {
      topWordPos = i;
    }
  }
  //console.log(trackedWordsScoreSorted)
  if(trackedWordsScore[topWordPos] > 1) {
    embed.addField('**The most popular tracked word is:** ', trackedWords[topWordPos]);
  }

  //console.log(arr)
  //add user positions, max of 10, from json object
  for(var i = 0; i < users.length && i < 10; i++) {
    if(users[i].id === message.author.id) {
      embed.addField('#' + (i+1) + ' `' + users[i].username + '`', users[i].words + " in " + users[i].serverName);
      inTop = true;
    } else {
      embed.addField('#' + (i+1) + ' ' + users[i].username, users[i].words + " in " + users[i].serverName);
    }
  }

  //add final info
  if(inTop === false) {
    embed.addField('#' + pos + ' `' + message.author.username + '`', users[pos-1].words, true)
  }

  //console.log(arr);
  message.channel.send(embed);

  stopTimer(timer);
  return;
}*/

//adds the name of the server to the data file
/*function addServerNames(data) {
  for(var i = 0; i < data.servers.length; i++) {
    try {
      data.servers[i].name = client.guilds.cache.get(data.servers[i].id).name;
    }
    catch(err) {
      logging.error("Bot is no longer in the server with id " + data.servers[i].id + "\n Also this shouldn't be showing up \n \n")
      console.log(err);
      console.log("\n");
    }
  }
}*/

/*function storeServerName(guild, data) {
  for(var i = 0; i < data.servers.length; i++) {
    if (data.servers[i].id === guild.id) {
      try {
        data.servers[i].name = guild.name;
      }
      catch(err) {
        logging.warn("Uhh idk how you could get here but something is wrong with the the bot joining probs " + data.servers[i].id + "\n \n")
        console.log(err + "\n");
      }
      break;
    }
  }
}*/

/*function getPrefix(message, data) {
  if(data.servers[getServer(message, data)].prefix === undefined) {
    return "n!";
  } else {
    return data.servers[getServer(message, data)].prefix;
  }
}*/

/*function getWatching(watching) {
  let watchingSet = new Set();
  for(var i = 0; i < watching.length; i++) {
    try {
      watchingSet.add(watching[i].id);
    }
    catch(err) {

    }
  }
  return watchingSet;
}*/

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

/*function getBlacklist(message, data) {
  let blacklist = new Set();
  if(data.blacklist === undefined) {
    data.blacklist = new Array();
    logging.info(`created blacklist`);
  }
  for(var i = 0; i < data.blacklist.length; i++) {
    if(data.blacklist[i].time > Date.now) {
      delete data.blacklist[i];
    } else if(!(blacklist.has(message.author.id))) {
      blacklist.add(data.blacklist[i].id);
    }
  }
  data.blacklist = data.blacklist.filter(item => !!item);
  return blacklist;
}

/*function newBot(message) {
  let embed = new MessageEmbed()
  .setTitle('This Bot is Being Replaced')
  .setColor(0xBF66E3)
  .setDescription('Unfortunately, due to this bot going against discord TOS, it will no longer be hosted.\n\nBut luckily for you, we have come up with a replacement! A fully customizable version of N-Word is being released, with this, you still have the ability to use the core functions of the original bot as well as many customization features that were previously not possibile with this version of the bot. You can use [this link](' + invLink + ') to invite the new bot\nUsually we would just update this bot, but as the verification process for this user id has been disabled, we have to create a clean slate in order to reach above 100 servers')
  .addField('Will I still have my tracked words?', 'Yes! once you invite the new bot to the server, use the `n!transferData` command to move old data to the new bot. **THIS CAN ONLY BE DONE ONCE** so choose your server wisely\nAfter running this command you will be given a special color whenever someone checks you :>', true)
  .addField('What are the new features?', 'With this re-code you can now control *which* words are counted, as well as the cooldown that is applied by default in this version.\nThe leaderboard command is now per-server as well as the old global leaderboard\nThere are also a few QOL features that arent worth mentioning', true)
  .addField('Please message', '`TacticalGubbins#0900` or `Cyakat#5061` if you have any questions')
  ;

  message.channel.send(embed);

}*/
client.login(config.token);
