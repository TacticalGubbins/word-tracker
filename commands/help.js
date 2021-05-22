module.exports = {
  name: 'help',
  description: 'dms the user the help file',
  execute(message, prefix, discordLink, invLink, args, Discord, client, con) {
    if(args[1] === undefined) {

      let dmEmbed = new Discord.MessageEmbed()
      .setTitle('')
      .setColor(0xBF66E3)
      .setDescription("Check your dms :>")
      ;
      message.channel.send(dmEmbed);

      //creates the help embed
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
      .addField(prefix + 'count', 'Same as **ncheck**', true)
      .addField(prefix + 'total', 'Retrieves the total amount of words recorded', true)
      .addField(prefix + 'top', 'Gives info about top-sending user', true)
      .addField(prefix + 'leaderboard', '(lead) Retrieves the top 10 users in a server', true)
      .addField(prefix + 'globalLeaderboard', '(global) Retrieves the top 10 sending users world-wide', true)
      .addField(prefix + 'delete', '**Permanently** deletes all data regarding words counted in a server', true)
      .addField(prefix + 'info', 'Gives info about the bot', true)
      .addField(prefix + 'invite', 'Gives you [this link](' + invLink + ')', true)
      //.addField(prefix + 'transferData', '(transfer) Transfer your data from the original N-Word (Only works in __one__ server, this is non-reversible)', true)
      .addField(prefix + 'changelog', 'Shows the changelog for the specified version and if no version is specified the lastest changelog will be shown', true)
      .addField(prefix + 'achievements', '(ach) Shows which achievements you or the specified person have earned. The bot will DM you if you check yourself', true)
      .addField("Server Setup", "----")
      .addField(prefix + "settings", "View all current server settings", true)
      .addField(prefix + 'triggers', 'Starts setup in order to change countable words', true)
      .addField(prefix + 'cooldown', 'Change the server cooldown for counted words', true)
      .addField(prefix + 'setPrefix', '(prefix) Changes the prefix for the server', true)
      ;
      message.author.send(helpEmbed);
      return;
    }
    else {
      let infoEmbed = new Discord.MessageEmbed()
      .setTitle('More Info')
      .setColor(0xBF66E3)
      .setDescription('')
      switch (args[1]) {
        case 'triggers':
            infoEmbed.addField(prefix + 'triggers', 'You can change the tracked words by running this command. The default tracked words are \'bruh, nice, bots, cow\'. This command can only be run by those with the ManageChannels or ManageServer perms.');
          break;
        case ('check' || 'count'):
          infoEmbed.addField(prefix + 'check/count', 'This command allows you to see how many words you or someone else has sent. You can see how many words someone else has sent by sending n!check @Cyakat');
          break;
        case 'total':
          infoEmbed.addField(prefix + 'total', 'This command will show the total amount of words sent by everyone. This can also be seen in the bot\'s status sometimes and also with n!check @Word Tracker');
          break;
        case 'top':
          infoEmbed.addField(prefix + 'top', 'This command will show the top user aka the user who has sent the most tracked words');
          break;
        case ('leaderboard' || 'lead'):
          infoEmbed.addField(prefix + 'leaderboard/lead', 'This command will display a leaderboard ranking each user based on how many words were sent in the server. This leaderboard is local and will only show a list containing people in the server the command was used in');
          break;
        case ('globalLeaderboard' || 'global'):
          infoEmbed.addField(prefix + 'globalLeaderboard/global', 'This command will display a leaderboard ranking everyone based on how many words they have sent overall');
          break;
        case 'delete':
          infoEmbed.addField(prefix + 'delete', 'This command will delete all of your data from every server the bot permanently.');
          break;
        case 'info':
          infoEmbed.addField(prefix + 'info', 'This command will show some information about the bot');
          break;
        case 'invite':
          infoEmbed.addField(prefix + 'info', 'This command will give an invite code to the support server and also a link to invite the bot to your own server.');
          break;
        case 'changelog':
          infoEmbed.addField(prefix + 'changelog', 'This command will show the most recent changes made to the bot or you can specify a version. n!changelog 3.9.0');
          break;
        case ('ach' || 'achievements'):
          infoEmbed.addField(prefix + 'ach/achievements', 'This command will dm you your own achievements. If you specify a user, the bot will show their achievements. n!ach @Cyakat');
          break;
        case 'settings':
          infoEmbed.addField(prefix + 'settings', 'This command will show the current server\'s settings including the current triggers, cooldown, and prefix. This command can be run by anyone.');
          break;
        case 'cooldown':
          infoEmbed.addField(prefix + 'cooldown', 'This command allows you to change the cooldown for the server. The cooldown will activate after 5 or more tracked words were sent. While cooldown is applied, any tracked words sent by a user will not be tracked. This settings can only be changed by those with the ManageServer or ManageChannels perms. n!cooldown 5');
          break;
        case ('setPrefix' || 'prefix'):
          infoEmbed.addField(prefix + 'setPrefix/prefix', 'This command allows you to change the prefix for the server. This setting can only be changed by those with ManageServer or ManageChannels perms.');
          break;
        case 'help':
          infoEmbed.addField(prefix + 'help', 'This command will dm you the help file giving you all of the commands.');
          break;
        default:
          infoEmbed.setColor(0xFF0000)
          .setDescription('Command not found');
      }
      message.channel.send(infoEmbed);
    }
  }
};
