const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('prefix')
  .setDescription('sets server prefix'),
  async execute(message, Discord, client, con, arguments) {

    prefix = arguments.prefix;
    args = arguments.args;
    //checks if the user has suffcient permissions
    if(message.member.permissions.has(16) || message.member.permissions.has(32)) {
      if(args[1] === undefined) {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('Please include a prefix after the command!');
        await message.channel.send({embeds: [embed]});
        return;
      }
      //checks to see if the prefix specified is less than 5 characters
      if(args[1].length <= 5) {
        //data.servers[server].prefix = args[1].toLowerCase();
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        con.query("UPDATE IGNORE servers SET prefix = '" + args[1].toLowerCase() + "' WHERE id = " + message.guild.id, (err, response) => {
          if(err === null) {
            embed.setColor(0xBF66E3)
            .setDescription("Prefix has been changed to **" + args[1] + "**")
          }
          else {
            embed.setColor(0xFF0000)
            .setDescription("Unable to set prefix. Try using a different character.")
          }
          await message.channel.send({embeds: [embed]});
        });
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('Please make the prefix less than 5 characters!');
        await message.channel.send({embeds: [embed]});
        return;
      }
    } else {
      let embed = new Discord.MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('You must be an Administrator to use this command!');
      await message.channel.send({embeds: [embed]});
      return;
    }
    return;
  }
};
