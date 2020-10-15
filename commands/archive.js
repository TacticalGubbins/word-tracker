module.exports = {
  name: 'archive',
  description: 'doesn\'t work bad ufncntion',
  execute(message, Discord, client, con) {

      let archiveEmbed = new Discord.MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('Sorry, this feature is currently disabled :(');
      //message.channel.send("sorry, this feature is disabled for the time being");
      message.channel.send(archiveEmbed);

      //message.react('&#10060;')
      //.catch(console.error);

      //console.log(`n` + message.author.username + `(` + message.author.id + `) requested the archive in ` + message.channel.guild.name);
      return;

  }
};
