module.exports = {
  name: 'total',
  description: 'gets the total amount of words counted ever',
  async execute(message, Discord, client, con) {

      con.query('SELECT SUM(words) AS words FROM users', async (err, total) => {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription("There have been a total of **__" + total[0].words + "__** countable words sent!")
        .setFooter('Requested by ' + message.author.tag);
        //message.channel.send("There have been a total of **__" + totalN + "__** n-words sent!");
        await message.channel.send(embed);
      });
      return;

  }
};
