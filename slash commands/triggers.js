const { SlashCommandBuilder } = require("@discordjs/builders");
const {logging} = require("../custom objects/logging");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('triggers')
  .setDescription('Allows the admin to change the triggers for the server'),
  name: 'triggers',
  description: 'allows the admin to change the triggers for the server',
  async execute(interaction, Discord, client, con) {

      //the if statement checks if the user has the manage server or manage channels permissions
      if(interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD) || interaction.member.permissions.has(Discord.FLAGS.MANAGE_MESSAGES)) {
        let embed = new Discord.MessageEmbed()
        .setTitle('Trigger Setup')
        .setColor(0xBF66E3)
        .setDescription('Please type out any words you would like to be counted. Seperate each word by a space. All punctuation will be ignored')
        .addField('Example', 'bots nice!', true)
        .addField('Cancel', 'Type "CANCEL" to cancel', true)
        .setFooter({text: 'Requested by ' + interaction.user.tag});
        await interaction.reply({embeds: [embed]});

        //interaction collector listens for a interaction sent by the users who called the command.
        //once the collector has recieved a interaction it will parse it and create a string of the tracked words that will be stored in the database
        let collector = new Discord.MessageCollector(interaction.channel, m => m.author.id === interaction.user.id, { time: 20000 });
        collector.on('collect', async interaction => {
          logging.debug(interaction)
          if (interaction.author.id === client.user.id) return;
          if(interaction.content === "CANCEL") {
            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('Trigger Setup Canceled');
            await interaction.reply({embeds: [embed]});
            collector.stop();
            return false;

          } else {
            //removes any backslashes so that sql injection will not be possible
            let content = interaction.content.replaceAll('\\', '');
            //escapes the ' " and ` characters so that they don't mess up the sql
            content = content.replaceAll('\'', '\\\'');
            content = content.replaceAll('`', '\\\`');
            content = content.replaceAll('"', '\\\"');
            
            
            logging.debug(content);

            let strings = content.toLowerCase().split(" ");
            logging.debug(strings);
            strings = strings.filter(item => !!item);
            strings = strings.filter((item, index) => strings.indexOf(item) === index);
            strings = strings.join(', ');
            //data.servers[server].strings = strings;
            logging.debug("UPDATE servers SET strings = '" + strings + "' WHERE id = " + interaction.guild.id);
            con.query("UPDATE servers SET strings = '" + strings + "' WHERE id = " + interaction.guild.id);

            let embed = new Discord.MessageEmbed()
            .setTitle('')
            .setColor(0xBF66E3)
            .setDescription('**Trigger Setup Complete**\n\n Triggers added:\n' + strings);
            await interaction.reply({embeds: [embed]});

            collector.stop();
            return true;
          }
        });
      } else {
        let embed = new Discord.MessageEmbed()
        .setTitle('')
        .setColor(0xFF0000)
        .setDescription('You must be an Administrator to use this command!');
        await interaction.reply({embeds: [embed]});
        return false;
      }

  }
};
