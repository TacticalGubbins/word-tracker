module.exports = {
  name: 'prefix',
  description: 'sets server prefix',
  async execute(message, Discord, client, con, arguments) {

    prefix = arguments.prefix;
    args = arguments.args;

    if(message.member.hasPermission(16) || message.member.hasPermission(32)) {
      if(args[1] === undefined) {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('Please include a prefix after the command!');
        await message.channel.send(embed);
        return;
      }
      if(args[1].length <= 5) {
        //data.servers[server].prefix = args[1].toLowerCase();
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        con.query("UPDATE IGNORE servers SET prefix = '" + args[1].toLowerCase() + "' WHERE id = " + message.guild.id, async (err, response) => {
          if(err === null) {
            embed.setColor(0xBF66E3)
            .setDescription("Prefix has been changed to **" + args[1] + "**")
          }
          else {
            embed.setColor(0xFF0000)
            .setDescription("Unable to set prefix. Try using a different character.")
          }
          await message.channel.send(embed);
        });
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('Please make the prefix less than 5 characters!');
        await message.channel.send(embed);
        return;
      }
    } else {
      let embed = new Discord.MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('You must be an Administrator to use this command!');
      await message.channel.send(embed);
      return;
    }
    return;
  }
};
