module.exports = {
  name: 'global',
  description: 'gets the global leaderboard',
  execute(message, Discord, client, con) {

      con.query("SELECT id, SUM(words) AS 'words' FROM users GROUP BY id ORDER BY words DESC;", (err, response) => {
        let embed = new Discord.MessageEmbed()
        .setColor(0xBF66E3)
        .setTitle('Global Leaderboard')
        .setDescription('The top-sending users world-wide\nThis uses a collection of all messages these users have sent')
        .setFooter('Requested by ' + message.author.tag);

        //getTop(message, response, embed);


          let inTop = false;
          let pos = 1;
          let o = 0;

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
                if(o < 11) {
                  embed.addField('#' + (o) + ' ' + user.username, response[i].words);
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
            catch(err) {

            }

          }
          message.channel.send(embed);

      });
      //getGlobalTop(message);
      return;

  }
};
