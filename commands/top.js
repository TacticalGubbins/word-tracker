module.exports = {
  name: 'top',
  description: 'gets top sending user',
  execute(message, Discord, client) {
    con.query('SELECT id, SUM(words) AS words FROM users GROUP BY id ORDER BY words DESC', (err, rows) => {
      for(let i in rows) {
        try {
          let embed = new MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription('Top User')
          .setFooter('Requested by ' + message.author.tag)
          .setThumbnail('https://cdn.discordapp.com/avatars/' + rows[i].id + '/' + client.users.cache.get(rows[i].id).avatar + '.png')
          .addField(client.users.cache.get(rows[i].id).username, '__**' + rows[i].words + '**__ sent');

          message.channel.send(embed);
          break;
        }
        catch(err) {

        }
      }

    });
    return;
  }
};
