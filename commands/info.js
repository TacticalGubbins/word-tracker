module.exports = {
  name: 'info',
  description: 'gets the info of the bot',
  async execute(message, Discord, client, con, arguments) {

    voteLink = arguments.voteLink;
    version = arguments.version;
    shardId = arguments.shardId;

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

    //this section is terrible looking but it works so ¯\_(ツ)_/¯
    const promises = [
    	client.shard.fetchClientValues('guilds.cache.size'),
    	client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
    ];

    Promise.all(promises)
     .then(results => {
    		const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
    		const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
        con.query("SELECT SUM(words) AS words FROM users", async (err, total) => {
          //let timer = startTimer();
          let embed = new Discord.MessageEmbed()
          .setTitle(client.user.tag)
          .setColor(0xBF66E3)
          .setDescription('Counting Words... *please help me*')
          .setThumbnail(client.user.avatarURL())
          .addField('Version', version, true)
          .addField('Uptime', uptime, true)
          .addField('Shard#', shardId, true)
          .addField('Total Words Tracked', total[0].words, true)
          .addField('Server Count', totalGuilds, true)
          .addField('Library', '[discord.js](' + 'https://discord.js.org/#/' + ')', true)
          .addField('Vote for the bot', 'Vote for the bot [here](' + voteLink + ')', true)
          .addField('Authors', '`TacticalGubbins#0900`\n`Cyakat#5061`', true)
          .setFooter('Requested by ' + message.author.tag);
          await message.channel.send(embed);
          //stopTimer(timer);
        });
    	})
    	.catch(console.error);


      return;

  }
};
