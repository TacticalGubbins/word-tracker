module.exports = {
  name: 'invite',
  description: 'responds with invite to bot and support server',
  async execute(message, Discord, client, con, arguments) {

    discordLink = arguments.discordLink;
    invLink = arguments.invLink;

    let inviteEmbed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("[[Click here to invite me]](" + invLink + ")" + "\n[[Click here to join the bot's server]](" + discordLink + ")")
    .setFooter({text: 'Requested by ' + message.author.tag})
    ;

    await message.channel.send({embeds: [inviteEmbed]});
    return;
  }
};
