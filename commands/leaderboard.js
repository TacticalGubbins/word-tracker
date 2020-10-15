module.exports = {
  name: 'leaderboard',
  description: 'gets leaderboard stuffs',
  execute(message, Discord, client, con) {
    //quieres stuff
    con.query("SELECT * FROM users WHERE server_id =  '" + message.guild.id + "' ORDER BY words DESC", (err, response) => {
      let embed = new Discord.MessageEmbed()
      .setColor(0xBF66E3)
      .setTitle(message.guild.name + ' Leaderboard')
      .setDescription("This is the server's local leaderboard")
      .setFooter('Requested by ' + message.author.tag);

      getTop(message, response, embed);
    });
    return;
  }
};
