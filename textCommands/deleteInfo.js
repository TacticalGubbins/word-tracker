const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('delete-info')
  .setDescription('Prompts the user to confirm that they would indeed like to remove their data from the bot'),
  async execute(message, Discord, client, con) {

    //different buttons for each outcome
    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('yes')
      .setLabel('Yes')
      .setStyle('PRIMARY'),
      new MessageButton()
      .setCustomId('no')
      .setLabel('No')
      .setStyle('PRIMARY')
    );
    const row2 = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('sure')
      .setLabel('Are you sure?')
      .setStyle('DANGER'),
      new MessageButton()
      .setCustomId('no2')
      .setLabel('No')
      .setStyle('PRIMARY')
    );
    const rowDeleteSuccess = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('delete-success')
      .setLabel('Deleted')
      .setStyle('SUCCESS')
      .setDisabled(true)
    );
    const rowSaveSuccess = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('save-succes')
      .setLabel('Data Saved')
      .setStyle('SUCCESS')
      .setDisabled(true)
    )

      //tells the user they are about to delete all of their data
      let deleteEmbed = new Discord.MessageEmbed()
      .setTitle('Data Deletion')
      .setColor(0xBF66E3)
      .setDescription('Are you sure all of your data ever? *this is non-recoverable*')
      .setFooter('Requested by ' + message.author.tag)
      ;
      message.channel.send({embeds: [deleteEmbed], components: [row]});

      const filter = i => (i.customId === 'yes' || i.customId === 'no') && i.user.id === message.author.id;
      const filter2 = o => (o.customId === 'sure' || o.customId === 'no2') && o.user.id === message.author.id;

      const collector = message.channel.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async i => {
        //if the yes button is pressed it will transform it into the "are you sure?" button
      	if (i.customId === 'yes') {
      		await i.update({components: [row2] });

          const collector2 = message.channel.createMessageComponentCollector({filter2, time: 15000});

          collector2.on('collect', async o => {
            //deletes the data if the "are you sure?" button is pressed
            if(o.customId === 'sure') {

              con.query('DELETE FROM users WHERE id = ' + message.author.id, (err) => {});
              con.query('DELETE FROM achievements WHERE id = ' + message.author.id);
              let deleteEmbed2 = new Discord.MessageEmbed()
              .setTitle('')
              .setColor()
              .setColor(0xFF0000)
              .setDescription('Your data has been deleted, sorry to see you go :<')
              ;
              o.update({embeds: [deleteEmbed2], components: [rowDeleteSuccess]})
              collector2.stop();
              collector.stop();

            }
            //if statement handles the collection if no is pressed on the second
            if(o.customId === 'no2') {
              let saveEmbed = new Discord.MessageEmbed()
              .setTitle('')
              .setColor()
              .setColor(0x00FF00)
              .setDescription('Glad to see you made the right choice :)')
              ;
              o.update({embeds: [saveEmbed], components: [rowSaveSuccess]})
              collector2.stop();
              collector.stop();
            }
          })
      	}
        //if statement handles the collection if no is pressed the first time
        if(i.customId === 'no') {
          let saveEmbed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor()
          .setColor(0x00FF00)
          .setDescription('Glad to see you made the right choice :)')
          ;
          i.update({embeds: [saveEmbed], components: [rowSaveSuccess]})
          collector.stop();
        }
      });

      collector.on('end', collected => console.log(`Collected ${collected.size} items`));


      return;

  }
};
