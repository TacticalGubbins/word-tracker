//fuck fuck fuck fuck
/*
const ftpClient = require('ssh2').Client;
const conn = new ftpClient();

const connSettings = {
  host: 'ftp.tikomc.tk',
  port: 42069,
  username: 'louie',
  password: 'lasdfjk'
};

conn.on('ready', function() {
  conn.sftp(function(err,sftp) {
    if (err) throw err;
  });
}).connect(connSettings);

*/




const {Client, MessageAttachment, MessageEmbed} = require('discord.js');
const client = new Client();

const fs = require('fs');

const config = require("./config.json");

const prefix = 'n!'

//read and configure variable for the general data
var data = fs.readFileSync('data.txt');
data = data.toString();
var dataArray = data.split(/[\n \t]/);0
dataArray = dataArray.filter(item => !!item);
console.log(data);

//read in the total send n-words
var totalN = fs.readFileSync('totaln.txt');
console.log(totalN);

//read in the info for the top sending user
var top = fs.readFileSync('top.txt');
top = top.toString();
top = top.split('\t');
console.log(`top user loaded ${top}`);

//read in the archive file
var archive = fs.readFileSync('archive.txt');

//variables relating to users
var nigga = false;
var authorPos;
var stat = 0;


client.on('ready', () => {
  console.log("BOT ONLINE");

  client.user.setActivity(`Starting Up...`, {type : 'STREAMING'})
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`));

  setInterval(() => {
    if(stat == 0) {
      client.user.setActivity(`${totalN} sent n-words`, {type : 'LISTENING'});
      stat = 1;
    } else if(stat == 1) {
      client.user.setActivity(client.guilds.cache.size + ` servers`, {type : 'WATCHING'});
      stat = 2;
    } else if(stat == 2) {
      client.user.setActivity(`Top User: ${top[0]} with ${top[1]} sent`, {type : 'WATCHING'});
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


  let args = message.content.split(/[\s ? ! @ < > , . ; : ' " ` ~ * ^ % $ - ( ) + ]/);
  args = args.filter(item => !!item);

  //create an invite to the server | fuck you seb!
  if(message.content.toLowerCase().startsWith("invitenow")) {

    message.channel.createInvite({maxAge: 0})
    .then(invite => message.channel.send("*FUCK YOU SEB :)* https://discord.gg/" + invite.code))
    .catch(console.error);

    console.log(`\nCreated an invite in: ` + message.channel.guild.name + `, ` + message.channel.name);

    //message.react('✅')
    //.catch(console.error);
  }

  //see how many n-words somebody has sent
  if(message.content.toLowerCase().startsWith("ncheck") || message.content.toLowerCase().startsWith("ncount")) {

    //check to see if the value inputted is a user
    if(args[1] == null) {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('You must include an @!');
      //message.channel.send("You must include an @!")
      message.channel.send(embed);

      //message.react('❌')
      //.catch(console.error);
      return;
    }

    if(args[1] == '687077283965567006') {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Bruhg I've sent the n-word **__" + totalN + "__** times")
      .setFooter('Requested by ' + message.author.tag);
      //message.channel.send("Bruhg I've sent the n-word **__" + totalN + "__** times");
      message.channel.send(embed);

      //message.react('☑️')
      //.catch(console.error);
      return;
    }

    //if(args[1].slice(0,1) == '0' || args[1].slice(0,1) == '1' || args[1].slice(0,1) == '2' || args[1].slice(0,1) == '3' || args[1].slice(0,1) == '4' || args[1].slice(0,1) == '5' || args[1].slice(0,1) == '6' || args[1].slice(0,1) == '7' || args[1].slice(0,1) == '8' || args[1].slice(0,1) == '9') {
      if(client.users.cache.get(args[1].toString()) !== undefined) {
      //find the id of the user in question
      let user = args[1];
      console.log(`\nFetching info for ${user}`);

      let author = -1;
      //find the position of the user in the data file
      for (var i = 0; i < dataArray.length; i++) {
        if(user == dataArray[i]) {
            author = i+1;
            let embed = new MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription(client.users.cache.get(args[1]).tag + ' has sent the n-word a total of **__' + dataArray[author] + '__** times!')
            .setFooter('Requested by ' + message.author.tag);
            //message.channel.send("<@!" + args[1] + "> has sent the n-word a total of **__" + dataArray[author] + "__** times!")
            message.channel.send(embed);
            break;
        }
      }

      //detect if the user has not sent the n-word
      if(author == -1) {
        let embed = new MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription("I don't think " + client.users.cache.get(args[1]).tag + " is very racist because they haven't said the n-word!")
        .setFooter('Requested by ' + message.author.tag);
        //message.channel.send("I think <@!" + args[1] + "> isn't very racist because they haven't said the n-word!")
        message.channel.send(embed);
      }

      //react once the command is completed
      //message.react('✅')
      //.catch(console.error);

      //say that the argument is not a user
    } else {
      let embed = new MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription("That's not a person!");
      //message.channel.send("That's not a person!")
      message.channel.send(embed);

      //message.react('❌')
      //.catch(console.error);
    }
  }

  //check the total amount of sent n-words
  if(message.content.toLowerCase().startsWith("ntotal")) {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("There have been a total of **__" + totalN + "__** n-words sent!")
    .setFooter('Requested by ' + message.author.tag);
    //message.channel.send("There have been a total of **__" + totalN + "__** n-words sent!");
    message.channel.send(embed);

    //message.react('✅')
    //.catch(console.error);

    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested total N words: ${totalN} in ` + message.channel.guild.name);
  }

  //fetch and return the archive of n-words sent
  if(message.content.toLowerCase().startsWith("narchive")) {
    /*const attachment = new MessageAttachment('./archive.txt');
    message.channel.send("The full archive of every n-word sent: ", attachment);

    message.react('✅')
    .catch(console.error);*/

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
  if(message.content.toLowerCase().startsWith("ntop")) {
    let embed = new MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("The user with the largest amount of n-words sent is: **" + top[0] + "** with **__" + top[1] + "__** n-words sent!")
    .setFooter('Requested by ' + message.author.tag);
      //message.channel.send("The user with the largest amount of n-words sent is: **" + top[0] + "** with **__" + top[1] + "__** n-words sent!");
      message.channel.send(embed);

    //message.react('✅')
    //.catch(console.error);

    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested the top user in ` + message.channel.guild.name);
  }

  //retrive top 10 users
  if(message.content.toLowerCase().startsWith('nleaderboard') || message.content.toLowerCase().startsWith('nlead')) {

    let arr = getTop(dataArray);
    let pos = 0;

    for(var i = 0; i < arr.length; i++) {
      pos++;
      if(arr[i] == message.author.tag) {
        break;
      }
    }
    let embed = new MessageEmbed()
    .setTitle('Top 10 Most Racist Users')
    .setColor(0xBF66E3)
    .setDescription("Plese Note this is world-wide, not server-wide")
    .setFooter('Requested by ' + message.author.tag)
    .setTimestamp()
    .addField('#1 ' + arr[0], arr[1])
    .addField('#2 ' + arr[2], arr[3])
    .addField('#3 ' +arr[4], arr[5])
    .addField('#4 ' +arr[6], arr[7])
    .addField('#5 ' +arr[8], arr[9])
    .addField('#6 ' +arr[10], arr[11])
    .addField('#7 ' +arr[12], arr[13])
    .addField('#8 ' +arr[14], arr[15])
    .addField('#9 ' +arr[16], arr[17])
    .addField('#10 ' +arr[18], arr[19])
    .addField('----------', '----------', true)
    .addField('#' + pos + ' ' + message.author.tag, arr[pos], true)
    .addField('Name', 'Num of n-words');

      message.channel.send(embed);
  }

  //user info
  if(message.content.toLowerCase().startsWith('nuserinfo')) {
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
  if(message.content.toLowerCase().startsWith("nhelp")) {
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
    .addField('narchive', 'Gives complete archive of every n-word sent', true)
    .addField('nuserinfo', 'Gives some basic information on the user', true)
    .addField('invitenow', 'Creates a perma-link *fuck you seb!*', true)
    ;
    //message.author.send(`${help}`);
    message.author.send(embed);

    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested help file in ` + message.channel.guild.name);
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
    curr = args[j];

    if(curr.toLowerCase() == "nigger" || curr.toLowerCase() == "nigga" || curr.toLowerCase() == "niggers" || curr.toLowerCase() == "niggas") {
      authorPos = -1;
      nigga = true;

      //find the position of the user in the data file
      for (var i = 0; i < dataArray.length; i++) {
        if(message.author.id == dataArray[i]) {
            authorPos = i+1;
            break;
        }
      }

      //if the user has not sent a message before, create a line for the user
      if(authorPos == -1) {
        dataArray[dataArray.length] = message.author.id;
        dataArray[dataArray.length] = 0;
        authorPos = dataArray.length-1;
      }

      //add +1 to the user in the data array
      dataArray[authorPos] = parseInt(dataArray[authorPos]) + 1;
      totalN++;
    }


    if(j == args.length - 1 && nigga == true) {

      //special message for savi --- simp!
      if(message.author.id == 395980133565071360) {
        const attachmentSavi = new MessageAttachment('./savi.jpg');
        message.channel.send(attachmentSavi);
        console.log(`SAVI SENT THE N-WORD`);
      }

      //check to see if there is a new top user
      if(dataArray[authorPos] > parseInt(top[1])) {
        //re-define the top user
        top[0] = message.author.username;
        top[1] = dataArray[authorPos];

        //save the top user
        fs.writeFile('top.txt', message.author.username + "\t" + dataArray[authorPos], (err) => {
          if (err) throw err;
        });
        console.log(`new top user:` + top);
      }

      //write in the new data
      data = write(dataArray, totalN);

      console.log(`message sent by ` + message.author.username + ` in ` + message.channel.guild.name + `: ` + message.content);
      console.log(totalN);
      nigga = false;

    }
    if(j == args.length-1) {
      return;
    }
  }

    //message critic code (soon to be out of use)
  /*
  if(message.author.id == 521594161862934549 && curr == "the") {
      const attachmentCritic = new MessageAttachment('./estrogen.png');
      message.channel.send(attachmentCritic);
      console.log(`critic message sent`);
      return;
    }
    */


  //BAN CRITIC PLEASE PLEASE PLEASE
/*
  if(message.author.id == 521594161862934549) {
    message.guild.member(message.author).ban(message.author, {reason: 'chimp'}).catch(err => console.log(err));
    console.log(`\n\nCRITIC HAS BEEN KICKED\n\n`);
  }
*/


});

//fucntion to write in the array to the data file
function write (dataArray, totalN) {
  let data = "";
  //create a string from the array
  for(var i = 0; i < dataArray.length; i++) {
    data += dataArray[i] + "\t" + dataArray[i+1] + "\n";
    i++;
  }

  //write in the string
  fs.writeFile('data.txt' , data , (err) => {
    if (err) throw err;
  });

  fs.writeFile('totaln.txt' , totalN , (err) => {
    if (err) throw err;
  });

  //read in the newley written in file to keep the current data up to date
  data = fs.readFileSync('data.txt');
  data = data.toString();
  console.log(`Data Updated\n\n`);
  return data;
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

function getTop(arr) {
  var data = new Array(arr.length-1);
  var users = arr.filter((x, i) => !(i % 2));
  var nums = arr.filter((x, i) => i % 2);
  var curr = 0;
  var assign = 0;
  var n = nums.length;


  nums = nums.sort((a, b) => b - a);

  for(var i = 0; i < arr.length; i++) {
    if(parseInt(arr[i]) === parseInt(nums[curr])) {
      if(client.users.cache.get(arr[i-1].toString()) !== undefined) {
        data[assign] == arr[i-1].toString();
        data[assign] = client.users.cache.get(arr[i-1].toString()).tag;
        assign++;
        data[assign] = parseInt(nums[curr]);
        assign++;
      }
      curr++;
      i=0;
    }
  }

  for(var i = 0; i < data.length; i++) {
    if(data[i] === undefined) {
      data[i] = '---';
    }
  }

  return data;
}


client.login(config.token);
