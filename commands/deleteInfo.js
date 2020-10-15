module.exports = {
  name: 'deleteInfo',
  description: 'deletes user info from database',
  execute(message, Discord, client) {
    let deleteEmbed = new MessageEmbed()
    .setTitle('Data Deletion')
    .setColor(0xBF66E3)
    .setDescription('Are you sure all of your data on this server? *this is non-recoverable*\n\n Type:')
    .addField('**' + message.author.username + '** (your username)', 'to delete your data')
    .addField("**Cancel**", 'to cancel')
    .setFooter('Requested by ' + message.author.tag)
    ;
    message.channel.send(deleteEmbed);

    //create a message collector that checks for cancel or username
    let collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
    collector.on('collect', message => {

      //delete user info
      if (message.content === message.author.username) {
        //deleteUserInfo(data, message);
        con.query('DELETE FROM users WHERE id = ' + message.author.id, (err) => {});
        con.query('DELETE FROM achievements WHERE id = ' + message.author.id);
        let deleteEmbed2 = new MessageEmbed()
        .setTitle('')
        .setColor()
        .setColor(0xFF0000)
        .setDescription('Your data has been deleted, sorry to see you go :<')
        ;
        message.channel.send(deleteEmbed2);
        collector.stop();

        //cancel the collector, do not delete
      } else if (message.content.toLowerCase() === "cancel") {
        let saveEmbed = new MessageEmbed()
        .setTitle('')
        .setColor()
        .setColor(0x00FF00)
        .setDescription('Glad to see you made the right choice :)')
        ;
        message.channel.send(saveEmbed);
        collector.stop();

        //stop multiple instances from running
      } else if(message.content.toLowerCase().startsWith('ndelete')) {
        collector.stop();

        //check for incorrect responses
      } else {
        let wrongEmbed = new MessageEmbed()
        .setTitle('')
        .setColor()
        .setColor(0xFF0000)
        .setDescription('Not an input')
        ;
        message.channel.send(wrongEmbed);
      }
    });
    return;
  }
};
