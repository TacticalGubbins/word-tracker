const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('cooldown')
  .setDescription('Allows the Administrators set up the cooldown time for the server')
  .addIntegerOption(option => option.setName('cooldown-time').setDescription('Please provide a time in seconds for the cooldown')),
  async execute(interaction, Discord, client, con) {

    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('primary')
      .setLabel('Primary')
      .setStyle('PRIMARY'),
    );

      let cooldownTime = interaction.options.getInteger('cooldown-time');
      //checks to see if the user has suffcient permissions
      if(interaction.member.permissions.has(16) || interaction.member.permissions.has(32)) {
        //checks to see if there even is a number provided
        if(cooldownTime <= 1000) {
          if(cooldownTime === null) {
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xFF0000)
            .setDescription('Please include a time (in seconds) after the command!');
            interaction.reply({embeds: [embed]});

            client.on('interactionCreate', interaction => {
            	if (!interaction.isButton()) return;
            	console.log(interaction);
            });
            return;
          }
          //if the user provides none, off, or 0 as an argument it will remove the cooldown
          if(cooldownTime === 0) {
            con.query("UPDATE servers SET cooldown = 0 WHERE id = " + interaction.guild.id);
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('**Removed cooldown time!**\n\n*active cooldowns will not be cleared*')
            .setFooter('Requested by ' + interaction.user.tag);
            interaction.reply({embeds: [embed]});
            return;
          }
          //if the user provides a correct number it will update the database with that number
          if(!isNaN(cooldownTime)) {
            con.query("UPDATE servers SET cooldown = " + cooldownTime.toString() + " WHERE id = " + interaction.guild.id);
            //data.servers[server].cooldown = parseInt(cooldownTime);
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('Changed cooldown time to **__' + cooldownTime.toString() + '__** seconds\n\n*active cooldowns will not be cleared*')
            .setFooter('Requested by ' + interaction.user.tag);
            interaction.reply({embeds: [embed]});
            return;
          }
          //if the user sets a number above 1000 it will stop them from doing so
        } else {
          let embed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor(0xFF0000)
          .setDescription('The max cooldown time is 1000!')
          interaction.reply({embeds: [embed]});
          return;
        }
        //if the user doesn't have suffcient permissions it will inform them so
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must have either ManageServer or ManageChannels permissions to use this command!');
        interaction.reply({embeds: [embed]});
        return;
      }

  }
};
