const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('triggers')
  .setDescription('Allows the admin to change the triggers for the server')
  .addStringOption(option => option.setName('triggers').setDescription('Enter your words seperated by spaces')),
  async execute(message, Discord, client, con, arguments) {

    let strings = "";

    args = arguments.args;
    args = args.splice(1);

    for(var i = 0; i < args.length; i++){
      strings = strings + args[i] + " "
    }

    let row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('yes')
      .setLabel('Yes')
      .setStyle('SUCCESS'),
      new MessageButton()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle('DANGER')
    );
    let rowCancelled = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('cancelled')
      .setLabel('Cancelled')
      .setStyle('DANGER')
      .setDisabled(true)
    );
    let rowAdded = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('success')
      .setLabel('Success')
      .setStyle('SUCCESS')
      .setDisabled(true)
    );
    let rowPerms = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('perms')
      .setLabel('Insufficient Permmissions')
      .setStyle('DANGER')
      .setDisabled(true)
    )

    if(strings === undefined){
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must specify which words you want!')
        .addField('Example','Try doing /tiggers bots nice!',true);
        await message.channel.send({embeds: [embed]});
        return;
    }

      //the if statement checks if the user has the manage server or manage channels permissions
      if(message.member.permissions.has(16) || message.member.permissions.has(32)) {
        let embed = new Discord.MessageEmbed()
        .setTitle('Trigger Setup')
        .setColor(0xBF66E3)
        .setDescription('Would you like these to be your triggers: ' + strings + ' ?')
        .addField('Example', 'bots nice!', true)
        .setFooter('Requested by ' + message.author.tag);
        await message.channel.send({embeds: [embed], components: [row]})

        //message collector listens for a message sent by the users who called the command.
        //once the collector has recieved a message it will parse it and create a string of the tracked words that will be stored in the database

        let filter = i => (i.user.id === message.author.id);



        const collector = message.channel.createMessageComponentCollector({ filter, time: 15000 });
        collector.on('collect', i => {
          if(i.customId === 'cancel') {
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('Trigger Setup Canceled');
            await i.update({embeds: [embed], components: [rowCancelled]});
            collector.stop();

          } else if(i.customId === 'yes'){
            strings = strings.toLowerCase().split(/[s ? ! @ < > , . ; : ' " ` ~ * ^ & # % $ - ( ) + | ]/);
            strings = strings.filter(item => !!item);
            strings = strings.filter((item, index) => strings.indexOf(item) === index);
            strings = strings.join(', ');
            //data.servers[server].strings = strings;
            con.query("UPDATE servers SET strings = '" + strings + "' WHERE id = " + message.guild.id);

            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('**Trigger Setup Complete**\n\n Triggers added:\n' + strings);
            await i.update({embeds: [embed], components: [rowAdded]});

            collector.stop();
          }
        });
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must be an Administrator to use this command!');
        await message.channel.send({embeds: [embed], components: [rowPerms]});
        return;
      }

  }
};
