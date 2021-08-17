const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {

  data: new SlashCommandBuilder()
  .setName("vote")
  .setDescription("gives the user the link for voting the bot on top.gg"),
  async execute(message, voteLink, Discord, client, con) {
    let embed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .addField('Vote for the bot', 'You can vote for the bot [here](' + voteLink + ')');

    message.channel.send(embed);
  }
};
