//hmmmmm

const {Client, MessageAttachment, MessageEmbed, MessageCollector} = require('discord.js');
const client = new Client();

const fs = require('fs');

const config = require("../test.json");
const changelog = require("./changelog.json");

const DBL = require("dblapi.js");
const dbl = new DBL(config.topToken, client);

const invLink = 'https://discordapp.com/oauth2/authorize?client_id=730199839199199315&scope=bot&permissions=392257';
const discordLink = 'https://discord.gg/Z6rYnpy'
const version = '3.7.1';
//version number: 1st = very large changes; 2nd = new features; 3rd = bug fixes and other small changes;
const botID = '687077283965567006';
//const prefix = "n!";
const defaultStrings = ["bruh", "nice", "bots", "cow"];
const uptime = Date.now();

//read in data from data.json
var data = require("./data.json");
var oldData = require("./oldData.json");
var totalN = data.totalSent;


//variables relating to users
var checkIfShouldWrite = false;

//changing status
var stat = 0;

//cooldown vars
var nword = 0;
let cooldown = new Set();
let cdseconds = 0;

var d = new Date();

client.on('ready', () => {
  console.log("BOT ONLINE");

  client.user.setActivity(`v${version}`, {type : 'STREAMING'})
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`));

  setInterval(() => {
        try {
          dbl.postStats(client.guilds.size, client.shards.Id, client.shards.total);
        }
        catch(err) {
          console.log("Unable to post status to dbl");
        }
    }, 1800000);

  setInterval(() => {
      if(stat === 0) {
        client.user.setActivity(`n! help for help`, {type : 'PLAYING'});
        stat = 1;
      } else {
        client.user.setActivity(`${data.totalSent} words`, {type : 'WATCHING'});
        stat = 0;
      }
        write(data);

    }, 10000);
});



dbl.on('posted', () => {
  console.log('Server count posted!');
});

dbl.on('error', e => {
  console.log(`Oops! ${e}`);
});




client.on("message", (message) => {

  //ignore messages sent by bots
  if(message.author.bot ) return;

  //ignore messages sent in dms
  if(message.channel.type === 'dm') {
   message.channel.send("Shut up retard go talk in a server");
   client.guilds.cache.get('687077613457375438').member('250408653830619137').send("**Message from " + message.author.username + ":** " + message.content + "");
   return;
 }

  let server = getServer(message, data);
  let authorPos = getUser(message, data);
  let prefix = getPrefix(message, data);


  let args = message.content.split(" ");
  args = args.filter(item => !!item);

  if(message.content.toLowerCase().startsWith(prefix + "bottom")) {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("Bottom User")
    .setFooter('Requested by ' + message.author.tag)
    .setThumbnail('https://cdn.discordapp.com/avatars/445668261338677248/5c309586832c752c0826dfb5903cdb6d.webp?size=128')
    .addField('Darwen', '__**-69420**__ sent')
    message.channel.send(embed)
  }

  if(message.content === "hi" && message.author.id === "249382933054357504") {
    addServerNames(message, data);
  }

  if(message.content.toLowerCase().startsWith(prefix + "global") || message.content.toLowerCase().startsWith(prefix + "globalleaderboard") || message.content.toLowerCase().startsWith(prefix + "globallead")) {
    getGlobalTop(message, data);
    return;
  }

  if(message.content.toLowerCase().startsWith(prefix + "transferdata") || message.content.toLowerCase().startsWith(prefix + "transfer")) {
    assignOG(data, message);
    return;
  }

  if(message.content.toLowerCase().startsWith(prefix + "settings")) {
    let embed = new MessageEmbed()
    .setTitle(message.guild.name + " Settings")
    .setColor(0xBF66E3)
    .setDescription("Use:\n**" + prefix + "cooldown** to change the cooldown\n**" + prefix + "triggers** to change the trigger words\n**" + prefix + "setPrefix** to change the server prefix")
    .setThumbnail(message.guild.iconURL())
    .addField('Prefix', prefix, true)
    .addField('Cooldown Time', + data.servers[server].cooldown + " seconds", true)
    .addField('Trigger Words', data.servers[server].strings)
    .setFooter('Requested by ' + message.author.tag);
    message.channel.send(embed);
    return;
  }

  if(message.content.toLowerCase().startsWith(prefix + "info") || message.content.toLowerCase().startsWith(prefix + "stats")) {
    let embed = new MessageEmbed()
    .setTitle(client.user.tag)
    .setColor(0xBF66E3)
    .setDescription('Counting Words... *please help me*')
    .setThumbnail(client.user.avatarURL())
    .addField('Authors', '`TacticalGubbins#0900`\n`Cyakat#5061`', true)
    .addField('Version', version, true)
    .addField('Uptime', getUptime(), true)
    .addField('Total Words Tracked', data.totalSent, true)
    .addField('Server Count', client.guilds.cache.size, true)
    .addField('Library', '[discord.js](' + 'https://discord.js.org/#/' + ')', true)
    .setFooter('Requested by ' + message.author.tag);
    message.channel.send(embed);
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
        data.servers[server].cooldown = 0;
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
        data.servers[server].cooldown = parseInt(args[1]);
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
      .addField('Example', 'cows bots nice!', true)
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
          data.servers[server].strings = strings;

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

    console.log(`\nCreated an invite in: ` + message.channel.guild.name + `, ` + message.channel.name);

  }

  //see how many n-words somebody has sent
  if(message.content.toLowerCase().startsWith(prefix + "check") || message.content.toLowerCase().startsWith(prefix + "count")) {

    //check to see if the value inputted is a user
    if(args[1] == null) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('You must include an @!');
      //message.channel.send("You must include an @!")
      message.channel.send(embed);

      return;
    }

    let user = args[1].replace(/\D/g,'');

    if(user == client.user.id) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Bruhg I've counted **__" + data.totalSent + "__** words")
      .setFooter('Requested by ' + message.author.tag);
      //message.channel.send("Bruhg I've sent the n-word **__" + totalN + "__** times");
      message.channel.send(embed);

      return;
    }

    //if(args[1].slice(0,1) == '0' || args[1].slice(0,1) == '1' || args[1].slice(0,1) == '2' || args[1].slice(0,1) == '3' || args[1].slice(0,1) == '4' || args[1].slice(0,1) == '5' || args[1].slice(0,1) == '6' || args[1].slice(0,1) == '7' || args[1].slice(0,1) == '8' || args[1].slice(0,1) == '9') {
      if(client.users.cache.get(user.toString()) !== undefined) {
      //find the id of the user in question
      let user = args[1].replace(/\D/g,'');
      console.log(`\nFetching info for ${user}`);


            //let author = getUser(message, data);
            let author = -1;
            //find the position of the user in the data file
            for (var i = 0; i < data.servers[server].users.length; i++) {
              if(user == data.servers[server].users[i].id) {
                  author = i;
                  break;
              }
            }

            if(author === -1) {
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
              let userCooldown = ((data.servers[server].users[author].cooldown) - Date.now()) / 1000 + " seconds";
              if(((data.servers[server].users[author].cooldown) - Date.now()) > 0) {
                embed.addField("Cooldown:", userCooldown)
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
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("There have been a total of **__" + data.totalSent + "__** countable words sent!")
    .setFooter('Requested by ' + message.author.tag);
    //message.channel.send("There have been a total of **__" + totalN + "__** n-words sent!");
    message.channel.send(embed);


    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested total words: ${data.totalSent} in ` + message.channel.guild.name);
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

    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested the archive in ` + message.channel.guild.name);
  }

  //fetch and return the top sending user info
  if(message.content.toLowerCase().startsWith(prefix + "top")) {

    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("Top User")
    .setFooter('Requested by ' + message.author.tag)
    .setThumbnail(data.topUser.avatar)
    .addField(data.topUser.username, '__**' + data.topUser.words + '**__ sent')
    ;
      //message.channel.send("The user with the largest amount of n-words sent is: **" + top[0] + "** with **__" + top[1] + "__** n-words sent!");
      message.channel.send(embed);


    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested the top user in ` + message.channel.guild.name);
  }

  //retrive top 10 users
  if(message.content.toLowerCase().startsWith(prefix + 'leaderboard') || message.content.toLowerCase().startsWith(prefix + 'lead')) {

    getTop(message, data);

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
        deleteUserInfo(data, message);
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
    .addField(prefix + 'help', 'Gives you this message')
    .addField(prefix + 'check', 'Checks the # of words sent by a user', true)
    .addField(prefix + 'count', 'Same as **ncheck**', true)
    .addField(prefix + 'total', 'Retrieves the total amount of words recorded', true)
    .addField(prefix + 'top', 'Gives info about top-sending user', true)
    .addField(prefix + 'lead', '(leaderboard) Retrieves the top 10 users in a server', true)
    .addField(prefix + 'globalLead', 'Retrieves the top 10 sending users world-wide', true)
    .addField(prefix + 'delete', '**Permanently** deletes all data regarding words counted in a server', true)
    .addField(prefix + 'info', 'Gives info about the bot', true)
    .addField(prefix + 'invite', 'Gives you [this link](' + invLink + ')', true)
    .addField(prefix + 'transferData', '(transfer) Transfer your data from the original N-Word (Only works in __one__ server, this is non-reversible)', true)
    .addField(prefix + 'changelog', 'Shows the changelog for the specified version and if no version is specified the lastest changelog will be shown', true)
    .addField("Server Setup", "----")
    .addField(prefix + "settings", "View all current server settings", true)
    .addField(prefix + 'triggers', 'Starts setup in order to change countable words', true)
    .addField(prefix + 'cooldown', 'Change the server cooldown for counted words', true)
    .addField(prefix + 'setPrefix', 'Changes the prefix for the server', true)
    ;
    //message.author.send(`${help}`);
    message.author.send(embed);

    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested help file in ` + message.channel.guild.name);
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
      .setColor(0xBF66E3);

      for(var i = 0; i < changes.length; i++) {
        embed.addField(i+1, changes[i]);
      }
      message.channel.send(embed);
    }
    catch(err) {
      let embed = new MessageEmbed()
      .setTitle("jesus christ your dumn")
      .setColor(0xFF7777)
      .setDescription("stupid idiot")
      .setFooter("try " + prefix + "changelog 3.6.4");

      message.channel.send(embed);
    }
  }

  if(message.content.toLowerCase().startsWith(prefix + "setprefix")) {
    if(message.member.hasPermission('ADMINISTRATOR')) {
    data.servers[server].prefix = args[1].toLowerCase();
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("Prefix has been changed to **" + data.servers[server].prefix + "**");

    message.channel.send(embed);
  } else {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('You must be an Administrator to use this command!');
      message.channel.send(embed);
      return;
    }
  }
  if(message.content.toLowerCase().startsWith(prefix + "setpplength")) {

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
  }


  //VERIFICATION FOR *MY* SERVER
  if(message.guild.id == 694263395884728412 && message.channel.id == 694265200454402108 && message.content == fs.readFileSync('PASSWORD.txt')) {
    message.guild.member(message.author).roles.add('694263460355244074');
    message.guild.member(message.author).roles.remove('694264932706943096');
    console.log(`\n\n` + message.author.username + ` just verified`);

    password = newPASSWORD();

    message.guild.member('250408653830619137').send(message.author.username + " Just verfied\n\n**NEW PASSWORD:**\n`" + password + "`");
  }

  //get verification for *MY* server
  if(message.guild.id == 694263395884728412 && message.channel.id != 694265200454402108 && message.content.toLowerCase().startsWith("getverify")) {
    message.channel.send("Current verify message: **" + fs.readFileSync('PASSWORD.txt').toString() + "**");
  }

  let wordArgs = message.content.split(/[\s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
  wordArgs = wordArgs.filter(item => !!item);
  for(var j = 0; j < wordArgs.length; j++) {

    curr = wordArgs[j];

    let trackedWords = getTrackWords(message, data);
    try {
      if(trackedWords.has(curr.toLowerCase())) {
        //var authorPos = -1;
        checkIfShouldWrite = true;

        ////

        if(data.servers[server].users[authorPos].cooldown < Date.now()) {
          data.servers[server].users[authorPos].cooldown = 0;
          //write(data);
        }
        if(data.servers[server].users[authorPos].cooldown > 0) {
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
      console.log("Oops something when wrong with curr being undefined probably");
    }


    if(j == wordArgs.length - 1 && checkIfShouldWrite == true) {

      //special message for savi --- simp!
      /*if(message.author.id == 395980133565071360) {
        const attachmentSavi = new MessageAttachment('./savi.jpg');
        message.channel.send(attachmentSavi);
        console.log(`SAVI SENT THE N-WORD`);
      }*/
      //check to see if there is a new top user
      findTopUser(data);
      /*if(data.servers[server].users[authorPos].words > data.topUser.words) {
        //re-define the top user
        data.topUser.username = message.author.username;
        data.topUser.id = message.author.id;
        data.topUser.words = data.servers[server].users[authorPos].words;
        data.topUser.avatar = message.author.avatarURL();

        console.log(`new top user:` + data.topUser.username);
      }*/

      //update username
      data.servers[server].users[authorPos].username = message.author.username;


      console.log(`message sent by ` + message.author.username + ` in ` + message.channel.guild.name + `: ` + message.content);
      console.log(data.totalSent)
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

      nword = 0;

      //write in the new data
      //write(data);

    }
    if(j == wordArgs.length-1) {
      return;
    }
  }


});

//fucntion to write in the array to the data file
function write (data) {

  //Save file
  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
  });
}



//organize users by num of nwords
function getTop(message, data) {
  let server = getServer(message, data);

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

}

function deleteUserInfo(data, message) {
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

   console.log(`New PASSWORD Generated: ` + result + `\n\n`);
   return result;
}


function getTrackWords(message, data) {
  let server = getServer(message, data);
  let words = new Set();
  for(var i = 0; i < data.servers[server].strings.length; i++) {
    words.add(data.servers[server].strings[i]);
  }
  return words;
}

function getServer(message, data) {
  let server = -1;
  for(var i = 0; i < data.servers.length; i++) {
    if(data.servers[i].id === message.guild.id) {
     server = i;
    }
  }

  if(server === -1) {
    data.servers.push({
      "id": message.guild.id,
      "cooldown": 5,
      "strings": defaultStrings,
      "users": [],
    });
    //write(data);
    server = data.servers.length-1;
  }
  return server;
}

function getUser(message, data) {
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

function findTopUser(data) {

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
  return;*/
}

function assignOG(data, message) {
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
}

function getOGS(data) {
  let ogs = new Set();
  for(var i = 0; i < data.ogs.length; i++) {
    ogs.add(data.ogs[i]);
  }
  return ogs;
}

function getGlobalTop(message, data) {
  let arr = {"users":[]};
  let pos = 0;
  let place = 0;
  let inTop = false;

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

  for(var i = 0; i < data.servers.length; i++) {
    for(var o = 0; o < data.servers[i].users.length; o++) {
      for(var p = 0; p < arr.users.length; p++) {
        if(data.servers[i].users[o].id === arr.users[p].id) {
          arr.users[p].serverName = data.servers[i].name;
          if(arr.users[p].serverName != undefined) {
            break;
          }
        }
      }
    }
  }

  arr = arr.users.sort((a, b) => b.words - a.words);

  //check to see if there are any users on this server
  if(arr.length < 3) {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor()
    .setColor(0xFF0000)
    .setDescription("There isn't enough users to display this leaderboard")
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
  console.log(trackedWordsScoreSorted)
  if(trackedWordsScore[topWordPos] > 1) {
    embed.addField('**The most popular tracked word is:** ', trackedWords[topWordPos]);
  }

  console.log(arr)
  //add user positions, max of 10, from json object
  for(var i = 0; i < arr.length && i < 10; i++) {
    if(arr[i].id === message.author.id) {
      embed.addField('#' + (i+1) + ' `' + arr[i].username + '`', arr[i].words + " in " + arr[i].serverName);
      inTop = true;
    } else {
      embed.addField('#' + (i+1) + ' ' + arr[i].username, arr[i].words + " in " + arr[i].serverName);
    }
  }

  //add final info
  if(inTop === false) {
    embed.addField('#' + pos + ' `' + message.author.username + '`', arr[pos-1].words, true)
  }

  //console.log(arr);
  message.channel.send(embed);
  return;
}

//adds the name of the server to the data file
function addServerNames(message, data) {
  for(var i = 0; i < data.servers.length; i++) {
    try {
      data.servers[i].name = client.guilds.cache.get(data.servers[i].id).name;
    }
    catch(err) {
      console.log("Bot is no longer in the server with id " + data.servers[i].id);
    }
  }
}

function getPrefix(message, data) {
  if(data.servers[getServer(message, data)].prefix === undefined) {
    return "n!";
  } else {
    return data.servers[getServer(message, data)].prefix;
  }
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
