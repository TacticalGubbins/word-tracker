module.exports = async (message) => {

wordArgs = message.wordArgs;
userCooldownTime = message.cooldown;


const {logging} = require("./custom objects/logging")

logging.debug("running!");

//this whole chunk counts the words sent in the message and ups the counter of the user in the database
let words = message.content.split(" ");
logging.debug(message.content);
logging.debug(words);
logging.debug(wordArgs);
words = words.filter(item => !!item);

    //creates a set for storing the tracked words of the server. the set makes it faster to find if a word is tracked or not
    let trackedWords = new Set();
    //filters out empty strings in the array
    wordArgs = wordArgs.filter(item => !!item);
    //creating a variable to keep track of the number of tracked words
    var numWords = 0;

    //puts the strings in the wordArgs variable into the trackedWords set for speed
    for(let i of wordArgs) {
      trackedWords.add(i);
    }

    console.log(words);
    //this for loop goes through all of the words and counts how many times a tracked word has been said
    for(let j in words) {

      try {
        if (userCooldownTime > Date.now()) {
          break;
        }
      }
      catch(err) {}

      curr = words[j];

      try {

        if(trackedWords.has(curr.toLowerCase())) {
          console.log("found word: " + curr);
          numWords++;
        }
      }
      catch(err) {
      }
    }
    return numWords;
}
