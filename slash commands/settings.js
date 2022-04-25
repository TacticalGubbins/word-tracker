const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Displays the current settings for this server'),
  name: 'settings',
  description: 'displays the current settings for the server',
  async execute(interaction, Discord, client, con) {

      con.query('SELECT cooldown, strings FROM servers WHERE id = ' + interaction.guild.id , async (err, response) => {
        let cooldown;
        let strings;
        if(response[0] != undefined) {
          cooldown = response[0].cooldown;
          strings = response[0].strings;
        }
        else {
          cooldown = 5;
          strings = 'bruh, nice, bots, cow';
        }


        if(strings === undefined || strings === "") {
          strings = 'bruh, nice, bots, cow';
        }
        //console.log(strings);
        let embed = new Discord.MessageEmbed()
        .setTitle(interaction.guild.name + " Settings")
        .setColor(0xBF66E3)
        .setDescription("Use:\n**" + prefix + "cooldown** to change the cooldown\n**" + prefix + "triggers** to change the trigger words\n**" + prefix + "setPrefix** to change the server prefix")
        .setThumbnail(interaction.guild.iconURL())
        .addField('Prefix', prefix, true)
        .addField('Cooldown Time', + cooldown + " seconds", true)
        .addField('Trigger Words', strings)
        .setFooter({text: 'Requested by ' + interaction.user.tag});
        await interaction.reply({embeds: [embed]});

      });

      return;

  }
};
