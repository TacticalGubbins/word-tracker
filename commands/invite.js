module.exports = {
  name: 'invite',
  description: 'responds with invite to bot and support server',
  execute(message, discordLink, invLink, Discord, client, con) {
    //creates an embed with the support server's invite code in it and a link to invite the bot to your own server
    let inviteEmbed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("[[Click here to invite me]](" + invLink + ")" + "\n[[Click here to join the bot's server]](" + discordLink + ")")
    .setFooter('Requested by ' + message.author.tag)
    ;

    message.channel.send(inviteEmbed);
    return;
  }
};
