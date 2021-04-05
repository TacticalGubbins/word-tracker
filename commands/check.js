module.exports = {
  name: 'check',
  description: 'checks the amount of words the specified user sent',
  execute(message, args, Discord, client, con, data) {
    date = new Date();
    date = Date.now();

      let user;

      //check to see if the value inputted is a user
      if(args[1] === undefined) {
        /*let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must include an @!');
        //message.channel.send("You must include an @!")
        message.channel.send(embed);

        return;*/
        user = message.author.id;
      } else {
        user = args[1].replace(/D/g,'');
        user = user.replace("<@!","");
        user = user.replace(">","");

      }

      if(user == client.user.id) {
        con.query('SELECT SUM(words) AS words FROM users', (err, total) => {
          let embed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription("Bruhg I've counted **__" + total[0].words + "__** words")
          .setFooter('Requested by ' + message.author.tag);
          //message.channel.send("Bruhg I've sent the n-word **__" + totalN + "__** times");
          message.channel.send(embed);
        });

        return;
      }

      console.log(user);
      //if(args[1].slice(0,1) == '0' || args[1].slice(0,1) == '1' || args[1].slice(0,1) == '2' || args[1].slice(0,1) == '3' || args[1].slice(0,1) == '4' || args[1].slice(0,1) == '5' || args[1].slice(0,1) == '6' || args[1].slice(0,1) == '7' || args[1].slice(0,1) == '8' || args[1].slice(0,1) == '9') {
      if(client.users.cache.get(user.toString()) !== undefined) {
        con.query('SELECT words FROM users WHERE id = ' + user + ' AND server_id = ' + message.guild.id, (err, localwords) => {
          con.query("SELECT SUM(words) AS words FROM users WHERE id = " + user, (err, globalwords) => {
            con.query("SELECT * from achievements WHERE id = " + message.author.id, (err, achievements) => {
              user = client.users.cache.get(user);
              avatarURL = 'https://cdn.discordapp.com/avatars/'+ user.id +'/'+ user.avatar +'.png?size=128'
              console.log(user);
              let embed = new Discord.MessageEmbed()
              .setAuthor(user.username + "#" + user.discriminator, avatarURL)
              .setColor(0xBF66E3)

              //checks to see if the user is in the database
              if(localwords[0] === undefined || localwords[0].words === 0){
                embed.setDescription("That user hasn't sent any countable words!")
                .setTitle('')
              }
              else {
                embed.addField("Words Tracked (this server)", localwords[0].words, true)
                .addField("Words Tracked (all servers)", globalwords[0].words, true)
                //.addField("​","`Cooldown:` " + parseInt(date) - parseInt(globalwords[0].cooldown))
                //console.log(globalwords[0].cooldown);
                //.setTitle("Achievements: " + emoji("760541771632738345"))

              }

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


              message.channel.send(embed)
            });
          });
        });


        //say that the argument is not a user
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription("That's not a person!");
        //message.channel.send("That's not a person!")
        message.channel.send(embed);

      }
      return;

  }
};
