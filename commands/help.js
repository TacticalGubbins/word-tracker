module.exports = {
  name: 'help',
  description: 'dms the user the help file',
  async execute(message, Discord, client, con, arguments) {

    prefix = arguments.prefix;
    discordLink = arguments.discordLink;
    invLink = arguments.invLink;
    args = arguments.args;

    if(args[1] === undefined) {

      let dmEmbed = new Discord.MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Check your dms :>")
      ;
      await message.channel.send(dmEmbed);

      //let help = fs.readFileSync('help.txt')
      let helpEmbed = new Discord.MessageEmbed()
      .setTitle('All Commands')
      .setColor(0xBF66E3)
      .setDescription('')
      .setFooter('For private server:\n\ngetverify: retrieves current verify code')
      .addField('Donations','If you like the bot and would like to donate you can here: https://www.patreon.com/Cyakat')
      .addField(prefix + 'help', 'Gives you this message', true)
      .addField('Support Server', 'You can join the support server [here](' + discordLink + ')', true)
      .addField('Commands', '----')
      .addField(prefix + 'check', 'Checks the # of words sent by a user', true)
      .addField(prefix + 'total', 'Retrieves the total amount of words recorded', true)
      .addField(prefix + 'top', 'Gives info about top-sending user', true)
      .addField(prefix + 'leaderboard', 'Retrieves the top 10 users in a server', true)
      .addField(prefix + 'global', 'Retrieves the top 10 sending users world-wide', true)
      .addField(prefix + 'delete', '**Permanently** deletes all data regarding words counted in a server', true)
      .addField(prefix + 'info', 'Gives info about the bot', true)
      .addField(prefix + 'invite', 'Gives you [this link](' + invLink + ')', true)
      //.addField(prefix + 'transferData', '(transfer) Transfer your data from the original N-Word (Only works in __one__ server, this is non-reversible)', true)
      .addField(prefix + 'changelog', 'Shows the changelog for the specified version and if no version is specified the lastest changelog will be shown', true)
      // .addField(prefix + 'achievements', '(ach) Shows which achievements you or the specified person have earned. The bot will DM you if you check yourself', true)
      .addField("Server Setup", "----")
      .addField(prefix + "settings", "View all current server settings", true)
      .addField(prefix + 'triggers', 'Starts setup in order to change countable words', true)
      .addField(prefix + 'cooldown', 'Change the server cooldown for counted words', true)
      .addField(prefix + 'prefix', '(prefix) Changes the prefix for the server', true)
      ;
      //message.author.send(`${help}`);
      await message.author.send(helpEmbed);
      return;
    }
      await message.channel.send(infoEmbed);
    }
  };
