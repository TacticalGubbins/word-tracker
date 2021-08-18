const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('invite')
  .setDescription('Responds with invite to bot and support server'),
  async execute(interaction, Discord, client, con, arguments) {


        discordLink = arguments.discordLink;
        invLink = arguments.invLink;

    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setURL(discordLink)
      .setLabel('Support Server')
      .setStyle('LINK'),
      new MessageButton()
      .setURL(invLink)
      .setLabel('Invite Me!')
      .setStyle('LINK')
    )


    //creates an embed with the support server's invite code in it and a link to invite the bot to your own server
    let inviteEmbed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("[[Click here to invite me]](" + invLink + ")" + "\n[[Click here to join the bot's server]](" + discordLink + ")")
    .setFooter('Requested by ' + interaction.user.tag)
    ;

    await interaction.reply({embeds: [inviteEmbed], components: [row]});
    return;
  }
};
