module.exports = {
  name: 'cooldown',
  description: 'Allows the Administrators set up the cooldown time for the server',
  execute(message, args, Discord, client) {

      if(message.member.hasPermission('ADMINISTRATOR')) {
        if(args[1] === undefined) {
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xFF0000)
          .setDescription('Please include a time (in seconds) after the command!');
          message.channel.send(embed);
          return;
        }
        if(args[1].toLowerCase() === 'none' || args[1].toLowerCase() === 'off' || parseInt(args[1]) === 0) {
          con.query("UPDATE servers SET cooldown = 0 WHERE id = " + message.guild.id);
          //data.servers[server].cooldown = 0;
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription('**Removed cooldown time!**nn*active cooldowns will not be cleared*')
          .setFooter('Requested by ' + message.author.tag);
          message.channel.send(embed);
          return;
        }
        if(isNaN(args[1])) {
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xFF0000)
          .setDescription('Please include a time (in seconds) after the command!');
          message.channel.send(embed);
          return;
        }
        if(!isNaN(args[1])) {
          con.query("UPDATE servers SET cooldown = " + args[1] + " WHERE id = " + message.guild.id);
          //data.servers[server].cooldown = parseInt(args[1]);
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription('Changed cooldown time to **__' + args[1] + '__** secondsnn*active cooldowns will not be cleared*')
          .setFooter('Requested by ' + message.author.tag);
          message.channel.send(embed);
          return;
        }
      } else {
        let embed = new MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must be an Administrator to use this command!');
        message.channel.send(embed);
        return;
      }

  }
};
