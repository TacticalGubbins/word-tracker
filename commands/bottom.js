module.exports = {
  name: 'bottom',
  description: 'Gets the bottom',
<<<<<<< HEAD
  execute(message, Discord, client) {
    let bottomEmbed = new Discord.MessageEmbed()
=======
  execute(message) {
    let bottomEmbed = new MessageEmbed()
>>>>>>> 4289dbefeebf2eb7b605aa16a27a6017c3d074a3
    .setTitle('')
    .setColor(0xBF66E3)
    .setDescription("Bottom User")
    .setFooter('Requested by ' + message.author.tag)
    .setThumbnail('https://cdn.discordapp.com/avatars/445668261338677248/' + client.users.cache.get('445668261338677248').avatar + '.png?size=128')
    .addField('Darwen', '__**-69420**__ sent')
    message.channel.send(bottomEmbed);
    return;
<<<<<<< HEAD
  }
=======
  },
>>>>>>> 4289dbefeebf2eb7b605aa16a27a6017c3d074a3
};
