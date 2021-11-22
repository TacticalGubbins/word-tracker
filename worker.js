const {parentPort} = require("worker_threads");
const mysql = require('mysql');
const config = require("../config.json");

const con = mysql.createConnection({
  host: '127.0.0.1',
  user: config.databaseUser,
  password: config.databasePass,
  database: 'data',
  supportBigNumbers: true
});


parentPort.on("message", message => {
  main(message)
});


function main(message) {
  //initializing the variable that flags if the user sent and trackable words
  var checkIfShouldWrite = false;

  //number of words the user has sent
  var numWords = 0;

  //this whole chunk counts the words sent in the message and ups the counter of the user in the database
  let words = message.content.split(/[s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
  words = words.filter(item => !!item);

  //this set of queries gets all of the appropriate user and server information necessary for tracking the words of the user
  con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild, (err, server) => {
    con.query('SELECT cooldown, words FROM users WHERE id = ' + message.author + ' AND server_id = ' + message.guild, (err2, user) => {

      if (user[0] === undefined){
        con.query('INSERT IGNORE INTO users (id, server_id, cooldown, words) value (' + message.author +', ' + message.guild + ', 0, 0)');
        logging.info("Created new user!");
      }
      //redefines the number of words variable
      let numWords = 0;
      //creates a set for storing the tracked words of the server. the set makes it faster to find if a word is tracked or not
      let trackedWords = new Set();
      //creates word args which is a string that eventually gets put into trackedWords
      let wordArgs;

      //tries to put the tracked words of a server into the wordArgs variable and will provide the default words if it fails.
      try {
        wordArgs = server[0].strings.split(/[s ,]/);
      }
      catch(err) {
        wordArgs = defaultStrings;
        try {
          con.query("INSERT IGNORE INTO servers (id, prefix, cooldown, strings) VALUE (" + message.guild + ", "+ defaultPrefix +", "+ defaultCooldownTime +", "+ defaultStrings +")");
        }
        catch(err){};
      }
      //filters out empty strings in the array
      wordArgs = wordArgs.filter(item => !!item);

      //puts the strings in the wordArgs variable into the trackedWords set for speed
      for(let i of wordArgs) {
        trackedWords.add(i);
      }
      //this for loop goes through all of the words and counts how many times a tracked word has been said
      for(let j in words) {

        try {
          if (user[0].cooldown > Date.now()) {
            break;
          }
        }
        catch(err) {}

        curr = words[j];

        try {

          if(trackedWords.has(curr.toLowerCase())) {

            checkIfShouldWrite = true;

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
          cooldownTime = defaultCooldownTime;
          try {
            con.query('INSERT IGNORE INTO servers (id, prefix, cooldown, strings) VALUE (' + message.guild + ', '+ defaultPrefix +", "+ defaultCooldownTime +", "+ defaultStrings +")");
          }
          catch(err){};
        }
        checkIfShouldWrite = false;
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
      }
    });
  });
}
