const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
  data: new SlashCommandBuilder()
  .setName('achievements-check')
  .setDescription('shows the achievements of the specified person')
  .addMentionableOption(option => option.setName('user').setDescription('Mention the user you who\'s achievements you would like to know!')),
  async execute(interaction, Discord, client, con, version, voteLink, achievements, data) {

      //defines the variables needed for the command
      let user = interaction.options.getMentionable('user');
      if(user == null)
      {
        user = interaction.user.id;
      }
      else {
        user = user.id;
      }

      let achievementCounter = 0;
      let showHidden;
      let keys = Object.keys(achievements);
      let embed = new Discord.MessageEmbed();
      let newField = false;

      //check to see if the value inputted is a user
/*      if(args[1] === undefined) {
        user = interaction.user.id;
        showHidden = true;
      } else {
        user = args[1].replace(/D/g,'');
        user = user.replace(/<@!/, '');
        user = user.replace(/>/, '');
        showHidden = false;
      }*/
      //query gets the achievments that the user has obtained from the database
      if(client.users.cache.get(user) !== undefined) {
        con.query('SELECT * FROM achievements WHERE id = ' + user, (err, rows) => {


          if(rows[0] === undefined) {
            con.query('INSERT INTO achievements (id) VALUE (' + user + ')', (err, res) => {
            });
            newField = true;
          }
          //this bit determine whether a achievement's description should be shown publicly
          if(!newField) {
            for(let i in keys) {
              achievementCode = keys[i];
              let description = 'This achievement is hidden';
              let time = rows[0][achievementCode];
              let myDate = new Date(parseInt(time));
              let timestamp = myDate.toGMTString() + myDate.toLocaleString();
              timestamp = timestamp.substr(0,16);

              if(user !== client.user.id) {
                if(rows[0][achievementCode] != 0) {
                  if(achievements[achievementCode].hidden && showHidden || achievements[achievementCode].hidden === false) {
                    description = achievements[achievementCode].description
                  }
                  console.log(achievements[achievementCode].title, "\"" + description + "\" Earned on \n" + timestamp);
                  embed.addField(achievements[achievementCode].title, "\"" + description + "\" Earned on \n" + timestamp, true);
                  achievementCounter += 1;
                }
              }
              else {
                embed.setColor(0xFF0000)
                .addField("Bots can't earn achivements", "They just can't. It says it right here in the code")
                .setFooter('Requested by ' + interaction.user.tag);

                interaction.reply({embeds: [embed]});
                return;
              }
            }
          }
          //if the user has not earned any achievements it will specify so in a message
          if(achievementCounter === 0) {
            if(user === interaction.user.id){
              embed.addField('No achievements','You have not earned any achievements');
            }
            else {
              embed.addField('No achievements','They have not earned any achievements');
            }
          }
          embed.setTitle('Achievements')
          .setColor('0xBF66E3')
          .setFooter('Requested by ' + interaction.user.tag );

          if(showHidden) {
            let helpEmbed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription("Check your dms :>")
            ;
            interaction.reply({embeds: [helpEmbed]});;
            interaction.user.send(embed);
          } else {
            interaction.reply({embeds: [embed]});
          }
          });
        } else {
          embed.setTitle('')
          embed.setColor(0xFF0000)
          embed.setDescription("That's not a person!");
          //message.channel.send("That's not a person!")
          interaction.reply({embeds: [embed]});
        }
        return;
  }
};
