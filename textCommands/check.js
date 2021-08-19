const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('check')
  .setDescription('Checks the amount of words the specified user sent')
  .addMentionableOption(option => option.setName('user').setDescription('Check a user\'s word count on this server and all servers combined')),
  async execute(message, Discord, client, con, arguments) {

    data = arguments.data;
    args = arguments.args;

    date = new Date();
    date = Date.now();

      //check to see if the value inputted is a user and then filters it and gets just the id
      let user = args[1];

      if(user == null)
      {
        user = message.author.id;
      }
      else {
        user = args[1].replace(/D/g,'');
        user = user.replace("<@!","");
        user = user.replace(">","");
      }

      //if the user mentioned is the bot it will display the total words counted
      if(user == client.user.id) {
        con.query('SELECT SUM(words) AS words FROM users', (err, total) => {
          let embed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription("Bruhg I've counted **__" + total[0].words + "__** words")
          .setFooter('Requested by ' + message.author.tag);
          await interaction.reply({embeds: [embed]});
        });

        return;
      }

      //checks the database for the users total tracked words and local tracked words then it wil display them in a message
      if(client.users.cache.get(user.toString()) !== undefined) {
        con.query('SELECT words FROM users WHERE id = ' + user + ' AND server_id = ' + message.guild.id, async (err, localwords) => {
          con.query("SELECT SUM(words) AS words FROM users WHERE id = " + user, async (err, globalwords) => {
            con.query("SELECT * from achievements WHERE id = " + message.author.id, async (err, achievements) => {
              user = client.users.cache.get(user);
              avatarURL = 'https://cdn.discordapp.com/avatars/'+ user.id +'/'+ user.avatar +'.png?size=128'
              let embed = new Discord.MessageEmbed()
              .setAuthor(user.username + "#" + user.discriminator, avatarURL)
              .setColor(0xBF66E3)

              //checks to see if the user is in the database
              if(!(globalwords[0].words > 0)){
                embed.setDescription("That user hasn't sent any countable words!")
                .setTitle('')
              }
              else {
                let words;

                if(localwords[0] === undefined)
                {
                  words = 0;
                }
                else {
                  words = localwords[0].words;
                }
                embed.addField("Words Tracked (this server)", words.toString(), true)
                .addField("Words Tracked (all servers)", globalwords[0].words.toString(), true)


              }

              //the "ogs" get special colors. These people helped come up with the idea for the bot and also helped with he bot in the beginning
              let ogs = new Set();
              for(var i = 0; i < data.ogs.length; i++) {
                ogs.add(data.ogs[i]);
              }

              if(ogs.has(user.id)) {
                embed.setColor(0xFFA417);
              }
              //custom colors for pog people
              if(user.id === '445668261338677248') {
                embed.setColor(0xFF1CC5);
              }
              if(user.id === '448269007800238080') {
                embed.setColor(0x17FF1B);
              }
              if(user.id === '656755471847260170') {
                embed.setColor(0x17D1FF);
              }


              await message.channel.send({embeds: [embed]})
            });
          });
        });


        //say that the user mentioned is not a user in case they are a robot
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription("That's not a person!");
        await message.channel.send({embeds: [embed]});

      }
      return;

  }
};
