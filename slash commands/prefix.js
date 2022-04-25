const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('prefix')
  .setDescription('Sets the server prefix')
  .addStringOption(option => option.setName('prefix-string').setDescription('The prefix that the bot will use for chat commands').setRequired(true)),
  name: 'prefix',
  description: 'sets server prefix',
  async execute(interaction, Discord, client, con, arguments) {

    prefix = arguments.prefix;
    prefixString = interaction.options.getString('prefix-string');

    if(interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD) || interaction.member.permissions.Discord.FLAGS.MANAGE_MESSAGES) {
      if(prefixString === undefined) {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('Please include a prefix after the command!');
        await interaction.reply({embeds: [embed]});
        return;
      }
      if(prefixString.length <= 5) {
        //data.servers[server].prefix = prefixString.toLowerCase();
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        con.query("UPDATE IGNORE servers SET prefix = '" + prefixString.toLowerCase() + "' WHERE id = " + interaction.guild.id, async (err, response) => {
          if(err === null) {
            embed.setColor(0xBF66E3)
            .setDescription("Prefix has been changed to **" + prefixString + "**")
          }
          else {
            embed.setColor(0xFF0000)
            .setDescription("Unable to set prefix. Try using a different character.")
          }
          await interaction.reply({embeds: [embed]});
        });
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('Please make the prefix less than 5 characters!');
        await interaction.reply({embeds: [embed]});
        return;
      }
    } else {
      let embed = new Discord.MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('You must be an Administrator to use this command!');
      await interaction.reply({embeds: [embed]});
      return;
    }
    return;
  }
};
