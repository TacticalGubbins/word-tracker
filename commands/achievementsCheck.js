module.exports = {
  name: 'achievementsCheck',
  description: 'shows the achievements of the specified person',
  execute(message, data, args, Discord, client) {

      let user;
      let achievementCounter = 0;
      let showHidden;
      let keys = Object.keys(achievements);
      let embed = new Discord.MessageEmbed();
      let newField = false;

      //check to see if the value inputted is a user
      if(args[1] === undefined) {
        user = message.author.id;
        showHidden = true;
      } else {
        user = args[1].replace(/D/g,'');
        showHidden = false;
      }
      if(client.users.cache.get(args[1].toString()) !== undefined) {
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
                .addField("Bots can't earn achivements", "They just can't. It says it right here in the code")
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
            let helpEmbed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription("Check your dms :>")
            ;
            message.channel.send(helpEmbed);
            message.author.send(embed);
          } else {
            message.channel.send(embed);
          }
          });
        } else {
          embed.setTitle('')
          embed.setColor(0xFF0000)
          embed.setDescription("That's not a person!");
          //message.channel.send("That's not a person!")
          message.channel.send(embed);
        }
        return;
  }
};
