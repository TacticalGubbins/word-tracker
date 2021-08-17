const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Gets the leaderboard for this server'),
  async execute(interaction, Discord, client, con) {
    //query gets the leaderboard for the current server
    con.query("SELECT * FROM users WHERE server_id =  '" + interaction.guild.id + "' ORDER BY words DESC", (err, response) => {
      let embed = new Discord.MessageEmbed()
      .setColor(0xBF66E3)
      .setTitle(interaction.guild.name + ' Leaderboard')
      .setDescription("This is the server's local leaderboard")
      .setFooter('Requested by ' + interaction.user.tag);


      let inTop = false;
      let pos = 1;
      let o = 0;

      for(let i = 0; i < response.length; i++)
      {
        row = response[i];
        try{
          let user = client.users.cache.get(row.id);

          let userExists = !(user === undefined);

          if(userExists)
          {
            o++;
          }
          if(user.id === interaction.user.id) {
            embed.addField ('#' + o.toString() + '`' + interaction.user.username + '`', row.words.toString());
            inTop = true;
          }
          else {
            if(o < 11 && o > 0) {
              embed.addField('#' + o.toString() + ' ' + user.username, row.words.toString());
            }
          }

          if(inTop == false && user.id === interaction.user.id){
            embed.addField ('#' + o.toString() + '`' + interaction.user.username + '`', row.words.toString(), true);
            break;
          }

      }
       catch(err){

        }
      }

      interaction.reply({embeds: [embed]});

    });
    return;
  }
};
