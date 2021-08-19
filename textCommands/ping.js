const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {

  data: new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Gets the latency for the bot'),
  async execute(message, Discord, client, con) {
    await message.channel.send(`🏓Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  }
};
