const {SlashCommandBuilder} = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('global')
  .setDescription('Gets the global leaderboard'),
  async execute(interaction, Discord, client, con) {

    const buttonRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId('left')
      .setLabel('⬅️')
      .setStyle('PRIMARY'),
      new MessageButton()
      .setCustomId('right')
      .setLabel('➡️')
      .setStyle('PRIMARY')
    );

    let currentDate = Date.now()

    //if(nextUpdateTime < currentDate) {
      let nextUpdateTime = Date.now() + 1200000;


      //displays that the leaderboard is loading because sometimes the query can take a bit
      let embed = new Discord.MessageEmbed()
      .setColor(0xBF66E3)
      .setTitle('Global Leaderboard')
      //.setDescription('Loading leaderboard')
      .setFooter('Requested by ' + interaction.user.tag);
      //let reply = interaction.reply({embeds: [embed]})





        //gets the entire users database and sorts through it
        con.query("SELECT id, SUM(words) AS 'words' FROM users GROUP BY id ORDER BY words DESC;", async (err, response) => {

          let inTop = false;
          let pos = 1;
          let o = 0;

          for(let i = 0; i < response.length; i++)
          {
            row = response[i];
            try{
              let user = client.users.cache.get(row.id);

              //console.log(user);

              let userExists = (user === undefined);

              if(!userExists)
              {
                o++;
              }
              if(user.id === interaction.user.id) {
                embed.addField ('#' + o.toString() + '`' + interaction.user.username + '`', row.words.toString());
                inTop = true;
              }
              else {
                if(o < 11 && o > 0) {
                  embed.addField('#' + o.toString() + ' ' + user.username, row.words.toString())
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

          await interaction.reply({embeds: [embed]});



        });

        //getGlobalTop(message);
        return;
    //  }
      //else {

    //  }
  }
};
