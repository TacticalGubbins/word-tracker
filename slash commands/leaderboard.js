const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('lead')
  .setDescription('Gets the local leaderboard'),
  name: 'leaderboard',
  description: 'gets leaderboard stuffs',
  async execute(interaction, Discord, client, con) {
    //quieres stuff
    con.query("SELECT * FROM users WHERE server_id =  '" + interaction.guild.id + "' ORDER BY words DESC", async (err, response) => {
      let embed = new Discord.MessageEmbed()
      .setColor(0xBF66E3)
      .setTitle(interaction.guild.name + ' Leaderboard')
      .setDescription("This is the server's local leaderboard")
      .setFooter({text: 'Requested by ' + interaction.user.tag});

      //getTop(interaction, response, embed);


        let inTop = false;
        let pos = 1;
        let o = 0;

        for(let i = 0; i < response.length; i++) {
          try{
            let user = client.users.cache.get(response[i].id.toString());
            //get user and server
            i = parseInt(i);

            o++;
            //add user positions, max of 10, from json object
            if(user.id === interaction.user.id) {
              embed.addField('#' + (pos) + ' `' + interaction.user.username + '`', response[i].words);
              inTop = true;
            } else {
              if(o < 11) {
                embed.addField('#' + (pos) + ' ' + user.username, response[i].words);
              }
            }

            if(inTop === false && user.id === interaction.user.id) {
              embed.addField('#' + (i+1) + ' `' + interaction.user.username + '`', response[i].words, true);
              break;
            } else if(inTop === true && pos === 10) {
              break;
            }
            pos++;
          }
          catch(err) {}

        }
        await interaction.reply({embeds: [embed]});

    });
    return;
  }
};
