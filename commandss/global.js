module.exports = {
  name: 'global',
  description: 'gets the global leaderboard',
  execute(message, args, Discord, client, con) {

    let nextUpdateTime;
    let currentDate = Date.now()

    if(nextUpdateTime < currentDate) {


      //displays that the leaderboard is loading because sometimes the query can take a bit
      let embed = new Discord.MessageEmbed()
      .setColor(0xBF66E3)
      .setTitle('Global Leaderboard')
      .setDescription('Loading leaderboard')
      .setFooter('Requested by ' + message.author.tag);
      async function loading(message, embed) {
        let msg = await message.channel.send(embed);
        setTimeout(() => {
          msg.edit(embed);
        }, 1);
      }
      loading(message, embed);



        //gets the entire users database and sorts through it
        con.query("SELECT id, SUM(words) AS 'words' FROM users GROUP BY id ORDER BY words DESC;", (err, response) => {


            //this is for changing the pages in the global leaderboard. this broke i don't know why
            let inTop = false;
            let pos = 1;
            let o = 0;
            let set = args[1];
            if(set === undefined) {
              set = 0;
            }
            set = (set * 10) - 10;
            if (set < 0) {
              set = 0;
            }
            setpos = set/10;

            //formats the embed with the data given by the query
            for(let i = 0; i < response.length; i++) {
              try{
                let user = client.users.cache.get(response[i].id.toString());
                //get user and server
                i = parseInt(i);
                filler = user.username
                o++;
                //add user positions, max of 10, from json object
                if(user.id === message.author.id) {
                  embed.addField('#' + (o) + ' `' + message.author.username + '`', response[i].words);
                  inTop = true;
                } else {
                  if(o < 11+set & o > 0+set) {
                    embed.addField('#' + (o) + ' ' + user.username, response[i].words);
                  }
                }

                if(inTop === false && user.id === message.author.id) {
                  embed.addField('#' + (i+1) + ' `' + message.author.username + '`', response[i].words, true);
                  break;
                } else if(pos === 10+setpos) {
                  break;
                }
                pos++;
              }
              catch(err) {

              }

            }
            embed.setDescription('The top-sending users world-wide\nThis uses a collection of all messages these users have sent')
            //msg.edit(embed);

        });
        //getGlobalTop(message);
        return;
      }
      else {
        
      }
  }
};
