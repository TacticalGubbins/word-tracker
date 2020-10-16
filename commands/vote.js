module.exports = {
  name: "vote",
  description: "gives the user the link for voting the bot on top.gg",
  execute(message, voteLink, Discord, client, con) {
    let embed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .addField('Vote for the bot', 'You can vote for the bot [here](' + voteLink + ')');

    message.channel.send(embed);
  }
};
