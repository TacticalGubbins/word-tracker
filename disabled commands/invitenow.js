
module.exports = {
  name: 'invitenow',
  description: 'creates an invite for the server it was called in',
  execute(message) {
    //this was made by my friend louie because his friend wouldn't give him an invite code. This also give an achievement
    message.channel.createInvite({maxAge: 0})
    .then(invite => message.channel.send("*SCREW YOU SEB :)* https://discord.gg/" + invite.code))
    .catch(console.error);

    return;
  }
};
