module.exports = {
  name: 'userInfo',
  description: 'retrieves basic info on a user',
  execute(message, Discord, client) {
    if(args[1] === undefined) {
      let embed = new Discord.MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription('You must include an @!');
      message.channel.send(embed);
      return;
    }
    else if(client.users.cache.get(args[1].toString()) !== undefined) {
      userInf = client.users.cache.get(args[1].toString());
      let embed = new Discord.MessageEmbed()
      .setTitle(userInf.tag)
      .setColor(0x00FF00)
      .setDescription('<@!' + userInf.id + '>')
      .setThumbnail(userInf.avatarURL())
      .setTimestamp()
      .addField('Registered', userInf.createdAt)
      ;

      message.channel.send(embed);
    } else {
      let embed = new Discord.MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)
      .setDescription("That's not a person!");
      message.channel.send(embed);
    }
    return;
  }
};
