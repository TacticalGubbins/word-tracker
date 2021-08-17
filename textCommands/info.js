const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('info')
  .setDescription('Gets the info of the bot'),
  async execute(interaction, Discord, client, con, arguments) {

    args = arguments.args;
    version = arguments.version;
    voteLink = arguments.voteLink;

    var v = args[1];
    if(v == null) {v = 'please help me';}
    //gets the current uptime
    let seconds = parseInt(client.uptime/1000);
    let minutes = 0;
    let hours = 0;
    let days = 0;

    while(seconds >= 60) {
      minutes++;
      seconds -= 60;
    }

    while(minutes >= 60) {
      hours++;
      minutes -= 60;
    }

    while(hours >= 24) {
      days++;
      hours -= 24;
    }

    uptime = days + 'd ' + hours + 'hr ' + minutes + 'm ' + seconds + 's';
      //query gets the total tracked words and the rest of the embed has more info about the bot
      con.query("SELECT SUM(words) AS words FROM users", (err, total) => {
        let embed = new Discord.MessageEmbed()
        .setTitle(client.user.tag)
        .setColor(0xBF66E3)
        .setDescription(`Counting Words... *${v}*`)
        .setThumbnail(client.user.avatarURL())
        .addField('Authors', '`TacticalGubbins#0900`\n`Cyakat#5061`', true)
        .addField('Version', version, true)
        .addField('Uptime', uptime, true)
        .addField('Total Words Tracked', total[0].words.toString(), true)
        .addField('Server Count', client.guilds.cache.size.toString(), true)
        .addField('Library', '[discord.js](' + 'https://discord.js.org/#/' + ')', true)
        .addField('Vote for the bot', 'Vote for the bot [here](' + voteLink + ')', true)
        .setFooter('Requested by ' + interaction.author.tag);
        interaction.channel.send({embeds: [embed]});
        //stopTimer(timer);
      });
      return;

  }
};
