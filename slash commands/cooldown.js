const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('cooldown')
  .setDescription('Allows the Administrator to set up the cooldown time for a server')
  .addNumberOption(option => option.setName('cooldown-time').setDescription('Please specify a cooldown time for the server').setRequired(true)),
  name: 'cooldown',
  description: 'Allows the Administrators set up the cooldown time for the server',
  async execute(interaction, Discord, client, con, arguments) {

    cooldownTime = interaction.options.getNumber('cooldown-time')

      //checks to see if the user has suffcient permissions
      if(interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD) || interaction.member.permissions.Discord.FLAGS.MANAGE_MESSAGES) {

        if(cooldownTime === undefined) {
          let embed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor(0xFF0000)
          .setDescription('Please include a time (in seconds) after the command!');
          await interaction.reply({embeds: [embed]});
          return false;
        }
        //checks to see if there even is a number provided
        if(cooldownTime <= 1000) {
          //if the user provides none, off, or 0 as an argument it will remove the cooldown
          if(cooldownTime === 0) {
            con.query("UPDATE servers SET cooldown = 0 WHERE id = " + interaction.guild.id);
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('**Removed cooldown time!**\n\n*active cooldowns will not be cleared*')
            .setFooter({text: 'Requested by ' + interaction.user.tag});
            await interaction.reply({embeds: [embed]});
            return true;
          }
          //if the argument is not a number it will tell them to provide a number next time
/*          if(isNaN(cooldownTime)) {
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xFF0000)
            .setDescription('Please include a time (in seconds) after the command!');
            await interaction.reply({embeds: [embed]});
            return;
          }*/
          //if the user provides a correct number it will update the database with that number
          else if(cooldownTime > 0 && cooldownTime < 1000) {
            con.query("UPDATE servers SET cooldown = " + cooldownTime + " WHERE id = " + interaction.guild.id);
            //data.servers[server].cooldown = parseInt(cooldownTime);
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('Changed cooldown time to **__' + cooldownTime + '__** seconds\n\n*active cooldowns will not be cleared*')
            .setFooter({text: 'Requested by ' + interaction.user.tag});
            await interaction.reply({embeds: [embed]});
            return true;
          }
          //if the user sets a number above 1000 it will stop them from doing so
        } else {
          let embed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor(0xFF0000)
          .setDescription('The max cooldown time is 1000!')
          await interaction.reply({embeds: [embed]});
          return false;
        }
        //if the user doesn't have suffcient permissions it will inform them so
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must be an Administrator to use this command!');
        await interaction.reply({embeds: [embed]});
        return false;
      }

  }
};
