const { ShardingManager } = require('discord.js');
const config = require('../config.json');

const manager = new ShardingManager('./bot.js', {token: config.token, totalShards: 'auto'});

const topggAutoposter = require('topgg-autoposter');

try {
  const topgg = topggAutoposter.AutoPoster(config.topToken, manager);
  topgg.on('posted', () => {
       console.log('Posted stats to top.gg');
  });
}
catch {
  console.log("no token present");
}
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.on("shardCreate", shard => {
    // Listeing for the ready event on shard.
    shard.on("ready", () => {
        console.log(`[DEBUG/SHARD] Shard ${shard.id} connected to Discord's Gateway.`)
        // Sending the data to the shard.
        shard.send({type: "shardId", data: {shardId: shard.id}});
    });
});

manager.spawn();
