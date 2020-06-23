//fuck fuck fuck fuck


const {Client, MessageAttachment, MessageEmbed, MessageCollector} = require('discord.js');
const client = new Client();

const fs = require('fs');

const config = require("./config.json");

const prefix = "n!"

//read in data from data.json
var data = require("./data.json");
var totalN = data.totalSent;

//read in the archive file
var archive = fs.readFileSync('archive.txt');

//variables relating to users
var nigga = false;

//changing status
var stat = 0;

//cooldown vars
var nword = 0;
let cooldown = new Set();
let cdseconds = 5;

var d = new Date();


client.on('ready', () => {
  console.log("BOT ONLINE");

  client.user.setActivity(`Starting Up...`, {type : 'STREAMING'})
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`));

  setInterval(() => {
    if(stat == 0) {
      client.user.setActivity(`${data.totalSent} sent n-words`, {type : 'LISTENING'});
      stat = 1;
    } else if(stat == 1) {
      client.user.setActivity(client.guilds.cache.size + ` servers`, {type : 'WATCHING'});
      stat = 2;
    } else if(stat == 2) {
      client.user.setActivity(`Top User: ${data.topUser.username} with ${data.topUser.nwords} sent`, {type : 'WATCHING'});
      stat = 0;
    }
  }, 10000);
});





client.on("message", (message) => {

  //ignore messages sent by bots
  if(message.author.bot ) return;

  //ignore messages sent in dms
  if(message.channel.type === 'dm') {
   message.channel.send("Shut up nigger go talk in a server");
   client.guilds.cache.get('687077613457375438').member('250408653830619137').send("**Message from " + message.author.username + ":** " + message.content + "");
   return;
 }

  let args = message.content.split(/[\s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + ]/);
  console.log(args);
  args = args.filter(item => !!item);

  console.log(args);

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
    if(args[2] == null) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('You must include an @!');
      //message.channel.send("You must include an @!")
      message.channel.send(embed);

      return;
    }

    if(args[2] == '687077283965567006') {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Bruhg I've sent the n-word **__" + data.totalSent + "__** times")
      .setFooter('Requested by ' + message.author.tag);
      //message.channel.send("Bruhg I've sent the n-word **__" + totalN + "__** times");
      message.channel.send(embed);

      return;
    }

    //if(args[1].slice(0,1) == '0' || args[1].slice(0,1) == '1' || args[1].slice(0,1) == '2' || args[1].slice(0,1) == '3' || args[1].slice(0,1) == '4' || args[1].slice(0,1) == '5' || args[1].slice(0,1) == '6' || args[1].slice(0,1) == '7' || args[1].slice(0,1) == '8' || args[1].slice(0,1) == '9') {
      if(client.users.cache.get(args[2].toString()) !== undefined) {
      //find the id of the user in question
      let user = args[2];
      console.log(`\nFetching info for ${user}`);

      let author = -1;
      //find the position of the user in the data file
      for (var i = 0; i < data.users.length; i++) {
        if(user == data.users[i].id) {
            author = i;
            let userCooldown = ((data.users[i].cooldown) - Date.now()) / 1000 + " seconds";
            if(((data.users[i].cooldown) - Date.now()) <= 0) {
              userCooldown = "none";
            }
            let embed = new MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription(client.users.cache.get(args[2]).tag + ' has sent the n-word a total of **__' + data.users[i].nwords + '__** times!')
            .setFooter('Requested by ' + message.author.tag)
            .addField("Cooldown:", userCooldown)
            ;

            message.channel.send(embed);
            break;
        }
      }

      //detect if the user has not sent the n-word
      if(author == -1) {
        let embed = new MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription("I don't think " + client.users.cache.get(args[2]).tag + " is very racist because they haven't said the n-word!")
        .setFooter('Requested by ' + message.author.tag);
        //message.channel.send("I think <@!" + args[1] + "> isn't very racist because they haven't said the n-word!")
        message.channel.send(embed);
      }


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
    .setDescription("There have been a total of **__" + data.totalSent + "__** n-words sent!")
    .setFooter('Requested by ' + message.author.tag);
    //message.channel.send("There have been a total of **__" + totalN + "__** n-words sent!");
    message.channel.send(embed);


    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested total N words: ${data.totalSent} in ` + message.channel.guild.name);
  }

  if(message.content.toLowerCase().startsWith(prefix + "invite")) {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("[[Click here to invite me]](https://discordapp.com/oauth2/authorize?client_id=687077283965567006&scope=bot&permissions=67492929)")
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
    .addField(data.topUser.username, '__**' + data.topUser.nwords + '**__ sent')
    ;
      //message.channel.send("The user with the largest amount of n-words sent is: **" + top[0] + "** with **__" + top[1] + "__** n-words sent!");
      message.channel.send(embed);


    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested the top user in ` + message.channel.guild.name);
  }

  //retrive top 10 users
  if(message.content.toLowerCase().startsWith(prefix + 'leaderboard') || message.content.toLowerCase().startsWith(prefix + 'lead')) {

    let arr = getTop(data);
    let pos = 0;
    let place = 0;

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
    .setTitle('Top 10 Most Racist Users')
    .setColor(0xBF66E3)
    .setDescription("Plese Note this is world-wide, not server-wide")
    .setFooter('Requested by ' + message.author.tag)
    .setTimestamp()
    .addField('#1 ' + arr[0].username, arr[0].nwords)
    .addField('#2 ' + arr[1].username, arr[1].nwords)
    .addField('#3 ' +arr[2].username, arr[2].nwords)
    .addField('#4 ' +arr[3].username, arr[3].nwords)
    .addField('#5 ' +arr[4].username, arr[4].nwords)
    .addField('#6 ' +arr[5].username, arr[5].nwords)
    .addField('#7 ' +arr[6].username, arr[6].nwords)
    .addField('#8 ' +arr[7].username, arr[7].nwords)
    .addField('#9 ' +arr[8].username, arr[8].nwords)
    .addField('#10 ' +arr[9].username, arr[9].nwords)
    .addField('----------', '----------', true)
    .addField('#' + pos + ' ' + message.author.tag, arr[pos-1].nwords, true)
    .addField('Name', 'Num of n-words');

      message.channel.send(embed);
  }

  //delete user info upon request
  if(message.content.toLowerCase().startsWith(prefix + 'deleteinfo') || message.content.toLowerCase().startsWith(prefix + 'delete')) {

    let embed = new MessageEmbed()
    .setTitle('Data Deletion')
    .setColor(0xBF66E3)
    .setDescription('Are you sure all of your data? *this is non-recoverable*\n\n Type:')
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
    if(args[2] === undefined) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('You must include an @!');
      message.channel.send(embed);
      return;
    }
    else if(client.users.cache.get(args[2].toString()) !== undefined) {
      userInf = client.users.cache.get(args[2].toString());
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
    .setDescription("Check your dms!")
    ;
    message.channel.send(helpEmbed);

    //let help = fs.readFileSync('help.txt')
    let embed = new MessageEmbed()
    .setTitle('All Commands')
    .setColor(0xBF66E3)
    .setDescription('')
    .setFooter('For private server:\n\ngetverify: retrieves current verify code')
    .addField('nhelp', 'Gives you this message')
    .addField('ncheck', 'Checks the # of n-words sent by a user', true)
    .addField('ncount', 'Same as **ncheck**', true)
    .addField('ntotal', 'Retrives the total amount of n-words recorded', true)
    .addField('ntop', 'Gives info about top-sending user', true)
    .addField('nleaderboard', 'Retrieves the top 10 users world-wide', true)
    .addField('ndelete', '**Permanently** deletes all data regarding n-words sent', true)
    .addField('narchive', 'Gives complete archive of every n-word sent', true)
    .addField('nuserinfo', 'Gives some basic information on the user', true)
    .addField('ninvite', 'Gives you [this link](https://discordapp.com/oauth2/authorize?client_id=687077283965567006&scope=bot&permissions=67492929)', true)
    .addField('invitenow', 'Creates a perma-link *fuck you seb!*', true)
    ;
    //message.author.send(`${help}`);
    message.author.send(embed);

    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested help file in ` + message.channel.guild.name);
  }

  if(message.content === "656598f1-5e5c-4aa7-b0de-9c854cefe0e6" && message.author.id === '250408653830619137') {
    var oldData = fs.readFileSync('data.txt');
    oldData = oldData.toString();
    var dataArray = oldData.split(/[\n \t]/);0
    dataArray = dataArray.filter(item => !!item);
    var total = 0;

    data.totalSent = 0;
    data.topUser = {
      "username" : "User",
      "id" : "0000",
      "nwords" : 0,
      "avatar" : "URL"
    }

    for(var i = 0; i < dataArray.length; i++) {
      if(client.users.cache.get(dataArray[i].toString()) !== undefined) {
        data.users.push({
          "username" : client.users.cache.get(dataArray[i].toString()).username,
          "id" : dataArray[i],
          "nwords" : parseInt(dataArray[i+1]),
          "cooldown" : 0
        });
        i++;
      }
    }

    for(var j = 0; j < data.users.length; j++) {
      if(data.users[j].nwords > data.topUser.nwords) {

        //re-define the top user
        data.topUser.username = data.users[j].username;
        data.topUser.id = data.users[j].id;
        data.topUser.nwords = data.users[j].nwords;
        data.topUser.avatar = client.users.cache.get(data.users[j].id.toString()).avatarURL();

        console.log(`new top user:` + data.topUser.username);
      }
      total += data.users[j].nwords;
    }
    data.totalSent = total;

    console.log(data);
    write(data);
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



  for(var j = 0; j < args.length; j++) {
    if(cooldown.has(message.author.id)) {
      break;
    }
    curr = args[j];

    if(curr.toLowerCase() == "nigger" || curr.toLowerCase() == "nigga" || curr.toLowerCase() == "niggers" || curr.toLowerCase() == "niggas") {
      var authorPos = -1;
      nigga = true;

      //find the position of the user in the data file
      for (var i = 0; i < data.users.length; i++) {
        if(message.author.id == data.users[i].id) {
            authorPos = i;
            break;
        }
      }

      //if the user has not sent a message before, create a line for the user
      if(authorPos === -1) {
        data.users.push({
          "username" : message.author.username,
          "id" : message.author.id,
          "nwords" : 0,
          "cooldown" : 0
        });
        authorPos = data.users.length-1;
      }

      //add +1 to the user in the data array
      data.users[authorPos].nwords = parseInt(data.users[authorPos].nwords) + 1;
      data.totalSent++;
      nword++;
    }


    if(j == args.length - 1 && nigga == true) {

      //special message for savi --- simp!
      if(message.author.id == 395980133565071360) {
        const attachmentSavi = new MessageAttachment('./savi.jpg');
        message.channel.send(attachmentSavi);
        console.log(`SAVI SENT THE N-WORD`);
      }

      //check to see if there is a new top user
      if(data.users[authorPos].nwords > data.topUser.nwords) {
        //re-define the top user
        data.topUser.username = message.author.username;
        data.topUser.id = message.author.id;
        data.topUser.nwords = data.users[authorPos].nwords;
        data.topUser.avatar = message.author.avatarURL();

        console.log(`new top user:` + data.topUser.username);
      }

      //update username
      data.users[authorPos].username = message.author.username;


      console.log(`message sent by ` + message.author.username + ` in ` + message.channel.guild.name + `: ` + message.content);
      console.log(data.totalSent)
      nigga = false;

      if(nword >= 5) {
        cooldown.add(message.author.id);
        data.users[authorPos].cooldown = (Date.now() + ((cdseconds * nword) * 1000));
        setTimeout(() => {
          cooldown.delete(message.author.id);
          for(var i = 0; i < data.users.length; i++) {
            if(data.users[i].id == message.author.id) {
              data.users[i].cooldown = 0;
              write(data);
              break;
            }
          }
        }, (cdseconds * nword) * 1000);
      }

      nword = 0;

      //write in the new data
      write(data);

    }
    if(j == args.length-1) {
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
function getTop(data) {
  var arr = JSON.parse(JSON.stringify(data));


  arr = arr.users.sort((a, b) => b.nwords - a.nwords);

  for(var i = 0; i < data.users.length; i++) {
      if(client.users.cache.get(arr[i].id) === undefined ) {
        arr[i].username = "---";
        arr[i].nwords = 0;
      }
      if(arr[i] === undefined) {
        arr.push({
          "username" : "---",
          "nwords" : 0
        });
      }
}
  console.log(arr);
  return arr;
}

function deleteUserInfo(data, message) {
  for(var i = 0; i < data.users.length; i++) {
    if(data.users[i].id === message.author.id && data.users[i].nwords > 0) {
      data.totalSent -= data.users[i].nwords;
      delete data.users[i];
      data.users = data.users.filter(item => !!item);
      data.topUser.username = "UserName";
      data.topUser.id = "0000";
      data.topUser.nwords = 0;
      data.topUser.avatar = "URL";

      let deleteEmbed = new MessageEmbed()
      .setTitle('')
      .setColor()
      .setColor(0xFF0000)
      .setDescription('Your data has been deleted, sorry to see you go :(')
      ;
      message.channel.send(deleteEmbed);
      for(var j = 0; j < data.users.length; j++) {
        if(data.users[j].nwords > data.topUser.nwords) {

          //re-define the top user
          data.topUser.username = data.users[j].username;
          data.topUser.id = data.users[j].id;
          data.topUser.nwords = data.users[j].nwords;
          data.topUser.avatar = client.users.cache.get(data.users[j].id.toString()).avatarURL()

          console.log(`new top user:` + data.topUser.username);
        }
      }
      write(data);
      return;
    }
  }

  let embed = new MessageEmbed()
  .setTitle('')
  .setColor()
  .setColor(0xBF66E3)
  .setDescription("You haven't sent the n-word so I can't delete any data idiot")
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


client.login(config.token);
