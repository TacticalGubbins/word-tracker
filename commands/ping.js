module.exports = {
  name: 'ping',
  description: 'shows the achievements of the specified person',
  async execute(message, Discord, client, con) {
    const m = await message.channel.send('Ping?');
    m.edit(
      `Pong! Latency is ${m.createdTimestamp - message.createdTimestamp
      }ms. API Latency is ${Math.round(client.ws.ping)} ms`,
    );
  }
};
