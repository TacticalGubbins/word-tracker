const Discord = require("discord.js");

module.exports  = {
  joinEmbed: new Discord.MessageEmbed()
  .setColor(0xBF66E3)
  .setThumbnail("https://cdn.discordapp.com/avatars/730199839199199315/3a86a5442372b5450a40a00ce674960e.webp?size=128")
  .setTitle("Thank you for inviting me!")
  .setDescription("Here are some things you can do to setup the bot on your server!")
  .addField("You can use:", "**n!prefix** to change the prefix for this server\n\n**n!triggers** to change what words are tracked\n\n**n!cooldown** to change how long a user will have to wait after sending more than 5 tracked words")
  .addField("Settings", "Use **n!settings** to see the settings for this server")
}
