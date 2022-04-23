module.exports = {
  name: 'cooldown',
  description: 'Allows the Administrators set up the cooldown time for the server',
  async execute(message, Discord, client, con, arguments) {

    args = arguments.args;
    console.log(args[1]);

      //checks to see if the user has suffcient permissions
      if(message.member.permission.has(Discord.Permissions.FLAGS.ADMINISTATOR) || message.member.hasPermission(32)) {

        if(args[1] === undefined) {
          let embed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor(0xFF0000)
          .setDescription('Please include a time (in seconds) after the command!');
          await message.channel.send({embeds: [embed]});
          return;
        }
        //checks to see if there even is a number provided
        if(args[1] <= 1000) {
          //if the user provides none, off, or 0 as an argument it will remove the cooldown
          if(args[1].toLowerCase() === 'none' || args[1].toLowerCase() === 'off' || parseInt(args[1]) === 0) {
            con.query("UPDATE servers SET cooldown = 0 WHERE id = " + message.guild.id);
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('**Removed cooldown time!**\n\n*active cooldowns will not be cleared*')
            .setFooter({text: 'Requested by ' + message.author.tag});
            await message.channel.send({embeds: [embed]});
            return;
          }
          //if the argument is not a number it will tell them to provide a number next time
          if(isNaN(args[1])) {
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xFF0000)
            .setDescription('Please include a time (in seconds) after the command!');
            await message.channel.send({embeds: [embed]});
            return;
          }
          //if the user provides a correct number it will update the database with that number
          if(!isNaN(args[1])) {
            con.query("UPDATE servers SET cooldown = " + args[1] + " WHERE id = " + message.guild.id);
            //data.servers[server].cooldown = parseInt(args[1]);
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('Changed cooldown time to **__' + args[1] + '__** seconds\n\n*active cooldowns will not be cleared*')
            .setFooter({text: 'Requested by ' + message.author.tag});
            await message.channel.send({embeds: [embed]});
            return;
          }
          //if the user sets a number above 1000 it will stop them from doing so
        } else {
          let embed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor(0xFF0000)
          .setDescription('The max cooldown time is 1000!')
          await message.channel.send({embeds: [embed]});
          return;
        }
        //if the user doesn't have suffcient permissions it will inform them so
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must be an Administrator to use this command!');
        await message.channel.send({embeds: [embed]});
        return;
      }

  }
};
