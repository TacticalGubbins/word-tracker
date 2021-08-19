const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('help')
  .setDescription('DMs the user the help file'),
  async execute(message, Discord, client, con, arguments) {

    discordLink = arguments.discordLink;
    invLink = arguments.invLink;
    helpEmbed = arguments.helpEmbed;

    let dmEmbed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("Check your dms :>")
    ;

    await message.channel.send({embeds: [dmEmbed]});

    await message.author.send({embeds: [helpEmbed], ephemeral: true});
    return;
  }
};