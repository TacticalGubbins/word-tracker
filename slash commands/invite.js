const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
  .setName('invite')
  .setDescription('Responds with a link to the support server as well as inviting the bot to your server'),
  name: 'invite',
  description: 'responds with invite to bot and support server',
  async execute(interaction, Discord, client, con, arguments) {

    
    discordLink = arguments.discordLink;
    invLink = arguments.invLink;

    const row = new MessageActionRow()
  .addComponents(
    new MessageButton()
    .setLabel('Support Server')
    .setURL(discordLink)
    .setStyle('LINK'),
    new MessageButton()
    .setLabel('Invite the Bot')
    .setURL(invLink)
    .setStyle('LINK')
  )

    let inviteEmbed = new Discord.MessageEmbed()
    .setTitle('Invite Links')
    .setColor(0xBF66E3)
    .setDescription("These link will allow you to invite the bot to your own server or join the support server!")
    .setFooter({text: 'Requested by ' + interaction.user.tag})
    ;

    await interaction.reply({embeds: [inviteEmbed], components: [row]});
    return;
  }
};
