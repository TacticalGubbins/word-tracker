const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('invite')
  .setDescription('Responds with invite to bot and support server'),
  async execute(interaction, Discord, client, con, arguments) {

    discordLink = arguments.discordLink;
    invLink = arguments.invLink;

    //creates an embed with the support server's invite code in it and a link to invite the bot to your own server
    let inviteEmbed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("[[Click here to invite me]](" + invLink + ")" + "\n[[Click here to join the bot's server]](" + discordLink + ")")
    .setFooter('Requested by ' + interaction.user.tag)
    ;

    interaction.reply({embeds: [inviteEmbed]});
    return;
  }
};
