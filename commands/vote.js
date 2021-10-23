module.exports = {
  name: "vote",
  description: "gives the user the link for voting the bot on top.gg",
  async execute(message, Discord, client, con, arguments) {

    voteLink = arguments.voteLink;

    let embed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .addField('Vote for the bot', 'You can vote for the bot [here](' + voteLink + ')');

    await message.channel.send(embed);
  }
};
