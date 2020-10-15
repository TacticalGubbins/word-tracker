module.exports = {
  name: 'check',
  description: 'checks the amount of words the specified user sent',
  execute(message, args,Discord, client, con) {

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

      //if(args[1].slice(0,1) == '0' || args[1].slice(0,1) == '1' || args[1].slice(0,1) == '2' || args[1].slice(0,1) == '3' || args[1].slice(0,1) == '4' || args[1].slice(0,1) == '5' || args[1].slice(0,1) == '6' || args[1].slice(0,1) == '7' || args[1].slice(0,1) == '8' || args[1].slice(0,1) == '9') {
      if(client.users.cache.get(user.toString()) !== undefined) {
        con.query('SELECT words FROM users WHERE id = ' + user + ' AND server_id = ' + message.guild.id, (err, rows) => {
          let embed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setFooter('Requested by ' + message.author.tag);

          //checks to see if the user is in the database
          if(rows[0] === undefined || rows[0].words === 0){
            embed.setDescription("That user hasn't sent any countable words!")
          }
          else {
            embed.setDescription(client.users.cache.get(user).tag + " has sent **__" + rows[0].words + "__** countable words!");
          }

          let ogs = getOGS(data);
          if(ogs.has(client.users.cache.get(user).id)) {
            embed.setColor(0xFFA417);
          }
          //custom colors for pog people
          if(client.users.cache.get(user).id === '445668261338677248') {
            embed.setColor(0xFF1CC5);
          }
          if(client.users.cache.get(user).id === '448269007800238080') {
            embed.setColor(0x17FF1B);
          }
          if(client.users.cache.get(user).id === '656755471847260170') {
            embed.setColor(0x17D1FF);
          }


          message.channel.send(embed);
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
