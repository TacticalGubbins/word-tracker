module.exports = {
  name: 'total',
  description: 'gets the total amount of words counted ever',
  execute(message, Discord, client, con) {

      //query gets the total words sent by everyone
      con.query('SELECT SUM(words) AS words FROM users', (err, total) => {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription("There have been a total of **__" + total[0].words + "__** countable words sent!")
        .setFooter('Requested by ' + message.author.tag);
        message.channel.send(embed);
      });
      return;

  }
};
