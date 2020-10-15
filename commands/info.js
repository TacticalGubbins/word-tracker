module.exports = {
  name: 'info',
  description: 'gets the info of the bot',
  execute(message, Discord, client, con) {

      con.query("SELECT SUM(words) AS words FROM users", (err, total) => {
        //let timer = startTimer();
        let embed = new Discord.MessageEmbed()
        .setTitle(client.user.tag)
        .setColor(0xBF66E3)
        .setDescription('Counting Words... *please help me*')
        .setThumbnail(client.user.avatarURL())
        .addField('Authors', '`TacticalGubbins#0900`n`Cyakat#5061`', true)
        .addField('Version', version, true)
        .addField('Uptime', getUptime(), true)
        .addField('Total Words Tracked', total[0].words, true)
        .addField('Server Count', client.guilds.cache.size, true)
        .addField('Library', '[discord.js](' + 'https://discord.js.org/#/' + ')', true)
        .setFooter('Requested by ' + message.author.tag);
        message.channel.send(embed);
        //stopTimer(timer);
      });
      return;

  }
};
