module.exports = {
  name: 'invitenow',
  description: 'creates an invite for the server it was called in',
  execute(message, Discord, client) {
  }
};
con.query('SELECT server_id, id, SUM(words) AS \'words\' FROM users GROUP BY id ORDER BY words DESC;', (err, response) => {
  let embed = new MessageEmbed()
  .setColor(0xBF66E3)
  .setTitle('Global Leaderboard')
  .setDescription('The top-sending users world-wide\nThis uses a collection of all messages these users have sent')
  .setFooter('Requested by ' + message.author.tag);

  getTop(message, response, embed);
});
//getGlobalTop(message);
return;
