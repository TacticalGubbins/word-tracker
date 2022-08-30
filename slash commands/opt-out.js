const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('opt-out')
  .setDescription('Allows you to opt-out of message tracking'),
  async execute(interaction, Discord, client, con) {

    const filter = i => (i.customId === 'yes' || i.customId === 'no') && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('yes')
            .setStyle('SUCCESS')
            .setLabel('Yes'),
            new MessageButton()
            .setCustomId('no')
            .setStyle('DANGER')
            .setLabel('No')
        );
    const rowDeleteSuccess = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('delete-success')
            .setLabel('Opted Out')
            .setStyle('SUCCESS')
            .setDisabled(true)
        );
    const rowSaveSuccess = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('save-succes')
            .setLabel('Tracking retained')
            .setStyle('SUCCESS')
            .setDisabled(true)
        );
    let embed = new MessageEmbed()
    .setTitle('Opt-out')
    .setDescription('Are you sure you want to opt-out of tracking?')
    .setColor(0xBF66E3)
    .setFooter({text: 'Requested by ' + interaction.user.tag});

    interaction.reply({ embeds: [embed], components: [row]});


    //collector will wait 15 seconds for the user to press a button
    //upon pressing a button the user will either have opted out or not
    collector.on('collect', async i => {
        //sends a message informing the user that they have opted out of message scanning
        if(i.customId === 'yes') {

            con.query('INSERT IGNORE INTO opt (id) VALUES (' + interaction.user.id + ');')
            let optEmbed2 = new MessageEmbed()
            .setTitle('')
            .setColor()
            .setColor(0xFF0000)
            .setDescription('You have opted out of message scanning, sorry to see you go :<')
            ;
            i.update({embeds: [optEmbed2], components: [rowDeleteSuccess]})
            collector.stop();

        }

        //sends a message informing the user that their messages will still be scanned
        if(i.customId === 'no') {
            let saveEmbed = new MessageEmbed()
            .setTitle('')
            .setColor()
            .setColor(0x00FF00)
            .setDescription('Glad to see you made the right choice :)')
            ;
            i.update({embeds: [saveEmbed], components: [rowSaveSuccess]})
            collector.stop();
        }
    })
  }
};
