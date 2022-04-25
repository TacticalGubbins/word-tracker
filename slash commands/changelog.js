const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('changelog')
  .setDescription('gets the changelog specified')
  .addStringOption(option => option.setName('version').setDescription('Specify the version you would like a changelog of')),
  name: 'changelog',
  description: 'gets the changelog specified',
  async execute(interaction, Discord, client, con, arguments) {

    //takes the needed values out of the arguments object
    args = arguments.args;
    botVersion = arguments.version;
    changelog = arguments.changelog;

    //let achievement = false;

    //sets the version that the command will use by default in case the user didn't specify a version
    let version = botVersion;

    //if the user specified a version it will use that. otherwise the command will use the bots current version as the argument.
    try {
        version = interaction.options.getString('version');
        if (version === null) {
          version = botVersion;
        }
    }
    catch (err) {
    }
    let versionNumbers = version.split(".");
    //console.log(JSON.stringify(changelog, 2, null));
    try {
      let changes = changelog.versions[versionNumbers[0]][versionNumbers[1]][versionNumbers[2]];
      let embed = new Discord.MessageEmbed()
      .setTitle(version + " Changelog")
      .setColor(0xBF66E3)
      .setDescription('You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A)')
      ;

      for(var i = 0; i < changes.length; i++) {
        //the embed titles have to be strings so I added
        //                    V this little bit here so it converts it to a string
        embed.addField(i+1 + "", changes[i]);
      }
      await interaction.reply({embeds: [embed]});
    }
    //this little bit is for an achievement just a bit of fun that we had
    catch(err) {
      if(version === "stupid" || version === "idiot" || version === "dumb") {
        let embed = new Discord.MessageEmbed()
        .setTitle("jesus christ your dumn")
        .setColor(0xFF7777)
        .setDescription("stupid idiot")
        .setFooter({text: "try /changelog 3.6.4"});

        await interaction.reply({embeds: [embed]});

        //achievement = true;
        //giveAchievements(interaction.author, data, "changelog");
      }
      else {
        let embed = new Discord.MessageEmbed()
        .setTitle("Version not found")
        .setColor(0xFF0000)
        //.addField('You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A)', '​')
        .setDescription("You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A) \n\n**The version specified could not be found. The oldest changelog is for 3.6.4**")
        .setFooter({text: "try /changelog 3.6.4"});

        await interaction.reply({embeds: [embed]});
      }
    }
    //return achievement;

  }
};
