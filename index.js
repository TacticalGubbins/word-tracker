const { ShardingManager } = require('discord.js');
const {token} = require('../config.json');

const manager = new ShardingManager('./bot.js', {token: token, totalShards: 'auto'});

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
