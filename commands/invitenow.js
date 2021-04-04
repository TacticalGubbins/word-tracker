
module.exports = {
  name: 'invitenow',
  description: 'creates an invite for the server it was called in',
  execute(message) {
    message.channel.createInvite({maxAge: 0})
    .then(invite => message.channel.send("*FUCK YOU SEB :)* https://discord.gg/" + invite.code))
    .catch(console.error);

    //console.log(`nCreated an invite in: ` + message.channel.guild.name + `, ` + message.channel.name);
    return;
  }
};
