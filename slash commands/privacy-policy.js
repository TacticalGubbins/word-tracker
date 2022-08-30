const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('privacy-policy')
  .setDescription('Denotes our privacy policy'),
  async execute(interaction, Discord, client, con, arguments) {
    const embed = new MessageEmbed()
    .setTitle('Privacy Policy')
    .setDescription("All User message data is not stored in any capacity; messages are read and scanned for certain key words set by a guild's owner or its moderators. User IDs are stored for identification and synchronization purposes. By using this bot users agree to allow other users to view their discord name, regardless if said users share any server with one another. \n \nAll users who have shared a guild with Word Tracker at any point in time permit storage of their user ID. All messages which are readable to Word Tracker are scanned to obtain word usage information. Users can request this data to be deleted and can opt out of having their messages scanned.")
    .setColor(0xBF66E3);
    interaction.reply({embeds: [embed], ephemeral: true});
  }
};
