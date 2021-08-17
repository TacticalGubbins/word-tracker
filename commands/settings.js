const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Displays the current settings for the server'),
  async execute(interaction, Discord, client, con) {
      //this will get the current setting for the server and display it in a message
      con.query('SELECT cooldown, strings FROM servers WHERE id = ' + interaction.guild.id , (err, response) => {
        let cooldown;
        let strings;
        //if there is no entry for the server it will just dispaly the default settings
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
        .setDescription("Use:\n**/cooldown** to change the cooldown\n**/triggers** to change the trigger words")
        .setThumbnail(interaction.guild.iconURL())
        .addField('Cooldown Time', + cooldown + " seconds", true)
        .addField('Trigger Words', strings)
        .setFooter('Requested by ' + interaction.user.tag);
        interaction.reply({embeds: [embed]});

      });

      return;

  }
};
