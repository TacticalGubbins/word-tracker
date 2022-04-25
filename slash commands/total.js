const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('total')
  .setDescription('Gets the total amount of words counted ever'),
  name: 'total',
  description: 'gets the total amount of words counted ever',
  async execute(interaction, Discord, client, con) {

      con.query('SELECT SUM(words) AS words FROM users', async (err, total) => {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xBF66E3)
        .setDescription("There have been a total of **__" + total[0].words + "__** countable words sent!")
        .setFooter({text: 'Requested by ' + interaction.user.tag});
        //interaction.reply("There have been a total of **__" + totalN + "__** n-words sent!");
        await interaction.reply({embeds: [embed]});
      });
      return;

  }
};
