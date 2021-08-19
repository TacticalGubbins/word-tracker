const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('total')
  .setDescription('Gets the total amount of words counted ever'),
  async execute(message, Discord, client, con) {

      //query gets the total words sent by everyone
      con.query('SELECT SUM(words) AS words FROM users', async (err, total) => {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription("There have been a total of **__" + total[0].words + "__** countable words sent!")
        .setFooter('Requested by ' + message.author.tag);
        await message.channel.send({embeds: [embed]});
      });
      return;

  }
};
