const { SlashCommandBuilder } = require("@discordjs/builders");
const logging = require("../custom objects/logging");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('check')
  .setDescription('Checks the amount of words you have sent')
  .addUserOption(option => option.setName('specified-user').setDescription('You may specify a user to see how many words they have sent')),
  name: 'check',
  description: 'checks the amount of words the specified user sent',
  async execute(interaction, Discord, client, con, arguments) {

    args = arguments.args;
    data = arguments.data;

    date = new Date();
    date = Date.now();

      let user = interaction.user.id;
      try {
        let specifiedUser = interaction.option.getUser('specified-user');
        user = specifiedUser.id;
      }
      catch (err) {}

      //check to see if the value inputted is a user

      if(user == client.user.id) {
        con.query('SELECT SUM(words) AS words FROM users', async (err, total) => {
          let embed = new Discord.MessageEmbed()
          .setTitle('')
          .setColor(0xBF66E3)
          .setDescription("Bruhg I've counted **__" + total[0].words + "__** words")
          .setFooter({text: 'Requested by ' + interaction.user.tag});
          //interaction.reply("Bruhg I've sent the n-word **__" + totalN + "__** times");
          await interaction.reply({embeds: [embed]});
        });

        return;
      }

      //if(args[1].slice(0,1) == '0' || args[1].slice(0,1) == '1' || args[1].slice(0,1) == '2' || args[1].slice(0,1) == '3' || args[1].slice(0,1) == '4' || args[1].slice(0,1) == '5' || args[1].slice(0,1) == '6' || args[1].slice(0,1) == '7' || args[1].slice(0,1) == '8' || args[1].slice(0,1) == '9') {
      if(client.users.cache.get(user.toString()) !== undefined) {
        con.query('SELECT words FROM users WHERE id = ' + user + ' AND server_id = ' + interaction.guild.id, async (err, localwords) => {
          con.query("SELECT SUM(words) AS words FROM users WHERE id = " + user, async (err, globalwords) => {
            user = client.users.cache.get(user);
            avatarURL = 'https://cdn.discordapp.com/avatars/'+ user.id +'/'+ user.avatar +'.png?size=128'
            let embed = new Discord.MessageEmbed()
            .setAuthor({name: user.username + "#" + user.discriminator, iconURL: avatarURL})
            .setColor(0xBF66E3)

            //checks to see if the user is in the database
            if(!(globalwords[0].words > 0)){
              embed.setDescription("That user hasn't sent any countable words!")
              .setTitle('')
            }
            else {
              let words;

              if(localwords[0] === undefined)
              {
                words = 0;
              }
              else {
                words = localwords[0].words;
              }
              embed.addField("Words Tracked (this server)", words.toString(), true)
              .addField("Words Tracked (all servers)", globalwords[0].words.toString(), true)
              //.addField("​","`Cooldown:` " + parseInt(date) - parseInt(globalwords[0].cooldown))
              //console.log(globalwords[0].cooldown);
              //.setTitle("Achievements: " + emoji("760541771632738345"))

            }

            let ogs = new Set();
            for(var i = 0; i < data.ogs.length; i++) {
              ogs.add(data.ogs[i]);
            }

            if(ogs.has(user.id)) {
              embed.setColor(0xFFA417);
            }
            //custom colors for pog people
            if(user.id === '445668261338677248') {
              embed.setColor(0xFF1CC5);
            }
            if(user.id === '448269007800238080') {
              embed.setColor(0x17FF1B);
            }
            if(user.id === '656755471847260170') {
              embed.setColor(0x17D1FF);
            }


            await interaction.reply({embeds: [embed]})
          });
        });


        //say that the argument is not a user
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription("That's not a person!");
        //interaction.reply("That's not a person!")
        await interaction.reply({embeds: [embed]});

      }
      return;

  }
};
