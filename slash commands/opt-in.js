const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('opt-in')
  .setDescription('Allows you to opt-in to message tracking'),
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
    const rowOptInSuccess = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('delete-success')
            .setLabel('Opted In')
            .setStyle('SUCCESS')
            .setDisabled(true)
        );
    const rowCringeSuccess = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('save-succes')
            .setLabel('Still gone ;<')
            .setStyle('SUCCESS')
            .setDisabled(true)
        );
    let embed = new MessageEmbed()
    .setTitle('Opt-out')
    .setDescription('Are you sure you want to opt into tracking?')
    .setColor(0xBF66E3)
    .setFooter({text: 'Requested by ' + interaction.user.tag});

    interaction.reply({ embeds: [embed], components: [row]});


    //collector will wait 15 seconds for the user to press a button
    //upon pressing a button the user will either have opted in or not
    collector.on('collect', async i => {
        //sends a message informing the user that they have opted into message scanning
        if(i.customId === 'yes') {

            con.query('DELETE FROM opt WHERE id = ' + interaction.user.id);
            let optEmbed2 = new MessageEmbed()
            .setTitle('')
            .setColor()
            .setColor(0xFF0000)
            .setDescription('You have opted in to message scanning, glad to see you back :>')
            ;
            i.update({embeds: [optEmbed2], components: [rowOptInSuccess]})
            collector.stop();

        }

        //sends a message informing the user that their messages will still be scanned
        if(i.customId === 'no') {
        let saveEmbed = new MessageEmbed()
        .setTitle('')
        .setColor()
        .setColor(0x00FF00)
        .setDescription('Come back when you want to :)')
        ;
        i.update({embeds: [saveEmbed], components: [rowCringeSuccess]})
        collector.stop();
        }
    })
  }
};
