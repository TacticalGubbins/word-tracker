module.exports = {
  name: 'global',
  description: 'gets the global leaderboard',
  execute(message, Discord, client) {

      con.query("SELECT server_id, id, SUM(words) AS 'words' FROM users GROUP BY id ORDER BY words DESC;", (err, response) => {
        let embed = new MessageEmbed()
        .setColor(0xBF66E3)
        .setTitle('Global Leaderboard')
        .setDescription('The top-sending users world-widenThis uses a collection of all messages these users have sent')
        .setFooter('Requested by ' + message.author.tag);

        getTop(message, response, embed);
      });
      //getGlobalTop(message);
      return;

  }
};
