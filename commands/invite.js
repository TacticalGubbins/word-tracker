module.exports = {
  name: 'invite',
  description: 'responds with invite to bot and support server',
  execute(message, Discord, client) {
    let inviteEmbed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("[[Click here to invite me]](" + invLink + ")" + "n[[Click here to join the bot's server]](" + discordLink + ")")
    .setFooter('Requested by ' + message.author.tag)
    ;

    message.channel.send(inviteEmbed);
    return;
  }
};
