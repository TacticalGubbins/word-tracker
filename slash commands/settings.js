const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Displays the current settings for this server'),
  name: 'settings',
  description: 'displays the current settings for the server',
  async execute(interaction, Discord, client, con) {

      con.query('SELECT cooldown, strings, prefix FROM servers WHERE id = ' + interaction.guild.id , async (err, response) => {
        let cooldown;
        let strings;
        console.log(err)
        if(response[0] != undefined) {
          cooldown = response[0].cooldown;
          strings = response[0].strings;
          prefix = response[0].prefix;
        }
        else {
          cooldown = 5;
          strings = 'bruh, nice, bots, cow';
          prefix = 'n!';
        }

        if (strings.length > 700){
          strings = strings.substring(0, 700) + "...";
        }

        if (strings === undefined || strings === "") {
          strings = 'bruh, nice, bots, cow';
        }
        //console.log(strings);
        let embed = new Discord.MessageEmbed()
        .setTitle(interaction.guild.name + " Settings")
        .setColor(0xBF66E3)
        .setDescription("Use:\n**/cooldown** to change the cooldown\n**/triggers** to change the trigger words\n**/prefix** to change the server prefix")
        .setThumbnail(interaction.guild.iconURL())
        .addField('Prefix', prefix + " is the prefix \n**but slash commands are strongly encouraged**", true)
        .addField('Cooldown Time', + cooldown + " seconds", true)
        .addField('Trigger Words', strings)
        .addField('Slash Commands', 'If you do not have slash commands enabled on this server then use the invite link in the bot\'s profile to allow them')
        .setFooter({text: 'Requested by ' + interaction.user.tag});
        await interaction.reply({embeds: [embed]});

      });

      return;

  }
};
