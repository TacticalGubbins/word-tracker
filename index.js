const {Client, MessageAttachment} = require('discord.js');
const client = new Client();

const fs = require('fs');

const config = require("./config.json");

const prefix = 'a!'

//read and configure variable for the general data
var data = fs.readFileSync('data.txt');
data = data.toString();
var dataArray = data.split(/[\n \t]/);
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




client.on('ready', () => {
  console.log("BOT ONLINE");

  client.user.setActivity(`with ${totalN} sent n-words | nhelp`)
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`));
});


client.on("message", (message) => {

  //ignore messages sent by bots
  if(message.author.bot ) return;

  //ignore messages sent in dms
  if(message.channel.type === 'dm') {
   message.channel.send("Shut up nigger go talk in a server");
   client.guilds.cache.get('697870932408270968').member('250408653830619137').send("Message from " + message.author.username + ": **" + message.content + "**");
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

    message.react('✅')
    .catch(console.error);
  }

  //see how many n-words somebody has sent
  if(message.content.toLowerCase().startsWith("ncheck") || message.content.toLowerCase().startsWith("ncount")) {

    //check to see if the value inputted is a user
    if(args[1] == null) {
      message.channel.send("You must include an @!")

      message.react('❌')
      .catch(console.error);
      return;
    }

    if(args[1] == '687077283965567006') {
      message.channel.send("Bruhg I've sent the n-word **__" + totalN + "__** times");

      message.react('☑️')
      .catch(console.error);
      return;
    }

    if(args[1].slice(0,1) == '0' || args[1].slice(0,1) == '1' || args[1].slice(0,1) == '2' || args[1].slice(0,1) == '3' || args[1].slice(0,1) == '4' || args[1].slice(0,1) == '5' || args[1].slice(0,1) == '6' || args[1].slice(0,1) == '7' || args[1].slice(0,1) == '8' || args[1].slice(0,1) == '9') {
      //find the id of the user in question
      let user = args[1];
      console.log(`\nFetching info for ${user}`);

      let author = -1;
      //find the position of the user in the data file
      for (var i = 0; i < dataArray.length; i++) {
        if(user == dataArray[i]) {
            author = i+1;
            message.channel.send("<@!" + args[1] + "> has sent the n-word a total of **__" + dataArray[author] + "__** times!")
            break;
        }
      }

      //detect if the user has not sent the n-word
      if(author == -1) {
        message.channel.send("I think <@!" + args[1] + "> isn't very racist because they haven't said the n-word!")
      }

      //react once the command is completed
      message.react('✅')
      .catch(console.error);

      //say that the argument is not a user
    } else {
      message.channel.send("That's not a person!")

      message.react('❌')
      .catch(console.error);
    }
  }

  //check the total amount of sent n-words
  if(message.content.toLowerCase().startsWith("ntotal")) {
    message.channel.send("There have been a total of **__" + totalN + "__** n-words sent!");

    message.react('✅')
    .catch(console.error);

    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested total N words: ${totalN} in ` + message.channel.guild.name);
  }

  //fetch and return the archive of n-words sent
  if(message.content.toLowerCase().startsWith("narchive")) {
    /*const attachment = new MessageAttachment('./archive.txt');
    message.channel.send("The full archive of every n-word sent: ", attachment);

    message.react('✅')
    .catch(console.error);*/

    message.channel.send("sorry, this feature is disabled for the time being");
    message.react('❌')
    .catch(console.error);

    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested the archive in ` + message.channel.guild.name);
  }

  //fetch and return the top sending user info
  if(message.content.toLowerCase().startsWith("ntop")) {
      message.channel.send("The user with the largest amount of n-words sent is: **" + top[0] + "** with **__" + top[1] + "__** n-words sent!");

    message.react('✅')
    .catch(console.error);

    console.log(`\n` + message.author.username + `(` + message.author.id + `) requested the top user in ` + message.channel.guild.name);
  }

  //fetch and return the help file
  if(message.content.toLowerCase().startsWith("nhelp")) {
    let help = fs.readFileSync('help.txt')
    message.channel.send(`${help}`);

    message.react('✅')
    .catch(console.error);

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


  args.forEach(curr => {

    //message critic code (soon to be out of use)
  /*
  if(message.author.id == 521594161862934549 && curr == "the") {
      const attachmentCritic = new MessageAttachment('./estrogen.png');
      message.channel.send(attachmentCritic);
      console.log(`critic message sent`);
      return;
    }
    */

    //check to see if the message contains any n-words
    if(curr.toLowerCase() == "nigger" || curr.toLowerCase() == "nigga" || curr.toLowerCase() == "niggers" || curr.toLowerCase() == "niggas") {
      nigga = true;
      authorPos = -1;

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

      console.log(dataArray);
      console.log(totalN);

    }

    //log the new array in the data file once the message has been fully scanned
    if(curr == args[args.length-1] && nigga == true) {
      console.log(`message sent by ` + message.author.username + ` in ` + message.channel.guild.name + `: ` + message.content);

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

      //add to the archive
      archive = archive + message.channel.guild.name + ":\t" + message.author.username + ":\t" + message.content + "\n\n";
      fs.writeFile('archive.txt' , archive , (err) => {
        if (err) throw err;
      });
      console.log(`Updated Archive`);

      //write in the new data
      data = write(dataArray, totalN);

      nigga = false;
    }

    client.user.setActivity(`with ${totalN} sent n-words | nhelp`);

  });

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


client.login(config.token);
