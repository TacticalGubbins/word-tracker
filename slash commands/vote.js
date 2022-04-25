const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('vote')
  .setDescription('Gives you the link for voting for the bot on top.gg'),
  name: "vote",
  description: "gives the user the link for voting the bot on top.gg",
  async execute(interaction, Discord, client, con, arguments) {

    voteLink = arguments.voteLink;

    let embed = new Discord.MessageEmbed()
    .setTitle('')
    .setColor(0xBF66E3)
    .addField('Vote for the bot', 'You can vote for the bot [here](' + voteLink + ')');

    await interaction.reply({embeds: [embed]});
  }
};
