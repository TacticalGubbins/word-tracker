const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()
  .setName("vote")
  .setDescription("Gives the user the link for voting the bot on top.gg"),
  async execute(message, Discord, client, con, arguments) {

    voteLink = arguments.voteLink;

    let row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setURL(voteLink)
      .setLabel('Vote')
      .setStyle('LINK')
    )
    let embed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .addField('Vote for the bot', 'You can vote for the bot [here](' + voteLink + ')');

    await message.channel.send({embeds: [embed], components: [row]});
  }
};
