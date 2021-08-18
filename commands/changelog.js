const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('changelog')
  .setDescription('Gets the changelog specified')
  .addStringOption(option => option.setName('version').setDescription('Specify the version you would like to know the changelog for')),
  async execute(interaction, Discord, client, con, arguments) {

    version = arguments.version;
    changelog = arguments.changelog;

    let achievement = false;

      //if the user specified a version number it will use that if it is good. otherwise it will use the current version's changelog
      let versionString = interaction.options.getString('version');

      if(versionString == null)
      {
        versionString = version;
      }
      let versionNumbers = versionString.split(".");
      //console.log(JSON.stringify(changelog, 2, null));
      try {
        let changes = changelog.versions[versionNumbers[0]][versionNumbers[1]][versionNumbers[2]];
        let embed = new Discord.MessageEmbed()
        .setTitle(versionString + " Changelog")
        .setColor(0xBF66E3)
        .setDescription('You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A)')
        ;

        for(var i = 0; i < changes.length; i++) {
          embed.addField((i+1).toString(), changes[i]);
        }
        await interaction.reply({embeds: [embed]});
      }
      //this little bit is for an achievement just a bit of fun that we had
      catch(err) {
        if(versionString === "stupid" || versionString === "idiot" || versionString === "dumb") {
          let embed = new Discord.MessageEmbed()
          .setTitle("jesus christ your dumn")
          .setColor(0xFF7777)
          .setDescription("stupid idiot")
          .setFooter("try /changelog 3.6.4");

          await interaction.reply({embeds: [embed]});

          achievement = true;
          //giveAchievements(message.author, data, "changelog");
        }
        else {
          let embed = new Discord.MessageEmbed()
          .setTitle("Version not found")
          .setColor(0xFF0000)
          //.addField('You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A)', '​')
          .setDescription("You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A) \n\n**The version specified could not be found. The oldest changelog is for 3.6.4**")
          .setFooter("try /changelog 3.6.4");

          await interaction.reply({embeds: [embed]});
        }
      }
      return achievement;

  }
};
