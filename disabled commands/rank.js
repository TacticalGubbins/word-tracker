module.exports = {
  name: 'rank',
  description: 'shows the rank of the user or specified user',
  execute(message, data, args, Discord, client, con) {

    //this command was ment to display your global ranking but i never finished it
    let embed = new Discord.MessageEmbed()
    .setColor(0xBF66E3)
    .setTitle('User Global Rank')
    .setDescription('Loading rank')
    .setFooter('Requested by ' + message.author.tag);
    async function loading(message, embed) {
      let msg = await message.channel.send(embed);
      setTimeout(() => {
        msg.edit(embed);
      }, 1);
    }
    loading(message, embed);

    let user;

    //check to see if the value inputted is a user
    if(args[1] === undefined) {

      user = message.author.id;
    } else {
      user = args[1].replace(/D/g,'');
      user = user.replace("<@!","");
      user = user.replace(">","");
    }

    con.query("SELECT id, SUM(words) AS 'words' FROM users GROUP BY id ORDER BY words DESC;", (err, response) => {

      for(let i = 0; i < response.length; i++) {
        try{
          let userCheck = client.users.cache.get(response[i].id.toString());
          //get user and server
          i = parseInt(i);
          filler = userCheck.username
          o++;
          //add user positions, max of 10, from json object
          if(userCheck.id === user) {
            embed.addField('#' + (o) + ' `' + message.author.username + '`', response[i].words);
          } else {
            if(o < 2) {
              embed.addField('#' + (o) + ' ' + userCheck.username, response[i].words);
            }
          }
        }
        catch(err) {}

      }
    });
  }
}
