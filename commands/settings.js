module.exports = {
  name: 'settings',
  description: 'displays the current settings for the server',
  execute(message, Discord, client) {

      con.query('SELECT cooldown, strings FROM servers WHERE id = ' + message.guild.id , (err, response) => {
        let cooldown = response[0].cooldown;
        let strings = response[0].strings;

        let embed = new MessageEmbed()
        .setTitle(message.guild.name + " Settings")
        .setColor(0xBF66E3)
        .setDescription("Use:n**" + prefix + "cooldown** to change the cooldownn**" + prefix + "triggers** to change the trigger wordsn**" + prefix + "setPrefix** to change the server prefix")
        .setThumbnail(message.guild.iconURL())
        .addField('Prefix', prefix, true)
        .addField('Cooldown Time', + cooldown + " seconds", true)
        .addField('Trigger Words', strings)
        .setFooter('Requested by ' + message.author.tag);
        message.channel.send(embed);

      });

      return;

  }
};
