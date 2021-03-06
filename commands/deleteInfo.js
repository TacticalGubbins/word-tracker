module.exports = {
  name: 'deleteInfo',
  description: 'prompts the user to confirm that they would indeed like to remove their data from the bot',
  execute(message, Discord, client, con) {

      //tells the user they are about to delete all of their data
      let deleteEmbed = new Discord.MessageEmbed()
      .setTitle('Data Deletion')
      .setColor(0xBF66E3)
      .setDescription('Are you sure all of your data on this server? *this is non-recoverable*\n\n Type:')
      .addField('**' + message.author.username + '** (your username)', 'to delete your data')
      .addField("**Cancel**", 'to cancel')
      .setFooter('Requested by ' + message.author.tag)
      ;
      message.channel.send(deleteEmbed);

      //create a message collector that checks for cancel or username
      let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
      collector.on('collect', message => {

        //delete user info
        if (message.content === message.author.username) {
          con.query('DELETE FROM users WHERE id = ' + message.author.id, (err) => {});
          con.query('DELETE FROM achievements WHERE id = ' + message.author.id);
          let deleteEmbed2 = new Discord.MessageEmbed()
          .setTitle('')
          .setColor()
          .setColor(0xFF0000)
          .setDescription('Your data has been deleted, sorry to see you go :<')
          ;
          message.channel.send(deleteEmbed2);
          collector.stop();

          //cancel the collector, do not delete
        } else if (message.content.toLowerCase() === "cancel") {
          let saveEmbed = new Discord.MessageEmbed()
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
          let wrongEmbed = new Discord.MessageEmbed()
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
