const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Shows the current latency'),
  name: 'ping',
  description: 'shows the achievements of the specified person',
  async execute(interaction, Discord, client, con) {
    await interaction.reply('Ping?');
    interaction.editReply(
      `Pong! Latency is ${interaction.createdTimestamp - Date.now()
      }ms. API Latency is ${Math.round(client.ws.ping)} ms`,
    );
    return;
  }
};
