module.exports = {
  name: 'changelog',
  description: 'gets the changelog specified',
  async execute(message, Discord, client, con, arguments) {

    args = arguments.args;
    version = arguments.version;
    changelog = arguments.changelog;

    let achievement = false;

      //if the user specified a version number it will use that if it is good. otherwise it will use the current version's changelog
      if(args[1] === undefined) {
        args[1] = version;
      }
      let versionNumbers = args[1].split(".");
      //console.log(JSON.stringify(changelog, 2, null));
      try {
        let changes = changelog.versions[versionNumbers[0]][versionNumbers[1]][versionNumbers[2]];
        let embed = new Discord.MessageEmbed()
        .setTitle(args[1] + " Changelog")
        .setColor(0xBF66E3)
        .setDescription('You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A)')
        ;

        for(var i = 0; i < changes.length; i++) {
          embed.addField(i+1, changes[i]);
        }
        await message.channel.send(embed);
      }
      //this little bit is for an achievement just a bit of fun that we had
      catch(err) {
        if(args[1] === "stupid" || args[1] === "idiot" || args[1] === "dumb") {
          let embed = new Discord.MessageEmbed()
          .setTitle("jesus christ your dumn")
          .setColor(0xFF7777)
          .setDescription("stupid idiot")
          .setFooter("try " + prefix + "changelog 3.6.4");

          await message.channel.send(embed);

          achievement = true;
          //giveAchievements(message.author, data, "changelog");
        }
        else {
          let embed = new Discord.MessageEmbed()
          .setTitle("Version not found")
          .setColor(0xFF0000)
          //.addField('You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A)', '​')
          .setDescription("You can view past, present, and future changes at our [Trello board](https://trello.com/b/zzbbKL9A) \n\n**The version specified could not be found. The oldest changelog is for 3.6.4**")
          .setFooter("try " + prefix + "changelog 3.6.4");

          await message.channel.send(embed);
        }
      }
      return achievement;

  }
};
