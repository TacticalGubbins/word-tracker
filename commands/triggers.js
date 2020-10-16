module.exports = {
  name: 'triggers',
  description: 'allows the admin to change the triggers for the server',
  execute(message, Discord, client, con) {

      if(message.member.hasPermission('ADMINISTRATOR')) {
        let embed = new Discord.MessageEmbed()
        .setTitle('Trigger Setup')
        .setColor(0xBF66E3)
        .setDescription('Please type out any words you would like to be counted. Seperate each word by a space. All punctuation will be ignored')
        .addField('Example', 'bots nice!', true)
        .addField('Cancel', 'Type "CANCEL" to cancel', true)
        .setFooter('Requested by ' + message.author.tag);
        message.channel.send(embed);

        let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 20000 });
        collector.on('collect', message => {
          if(message.content === "CANCEL") {
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('Trigger Setup Canceled');
            message.channel.send(embed);
            collector.stop();

          } else {
            let strings = message.content.toLowerCase().split(/[s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
            strings = strings.filter(item => !!item);
            strings = strings.filter((item, index) => strings.indexOf(item) === index);
            strings = strings.join(', ');
            //data.servers[server].strings = strings;
            con.query("UPDATE servers SET strings = '" + strings + "' WHERE id = " + message.guild.id);

            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('**Trigger Setup Complete**nn Triggers added:n' + strings);
            message.channel.send(embed);

            collector.stop();
          }
        });
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must be an Administrator to use this command!');
        message.channel.send(embed);
        return;
      }

  }
};
