const {SlashCommandBuilder} = require('@discordjs/builders');
const fs = require('fs');
const colors = require('colors');
const math = require('math');
const mysql = require('mysql');
const {REST} = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('reload')
  .setDescription('Reloads the commands so they are updated'),
  async execute(interaction, Discord, client, con) {
  const commands = [];
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


  // Place your client and guild ids here
  const clientId = '664652964962631680';
  const guildId = '637740070648021000';

  for (const file of commandFiles) {
  	const command = require(`./commands/${file}`);
  	commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '9' }).setToken(config.token);

  (async () => {
  	try {
  		console.log('Started refreshing application (/) commands.');

  		await rest.put(
  			Routes.applicationGuildCommands(clientId, guildId),
  			{ body: commands },
  		);

  		console.log('Successfully reloaded application (/) commands.');
  	} catch (error) {
  		console.error(error);
  	}
  })();

  client.commands = new Discord.Collection();

  const commandFilesHandler = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  for (const file of commandFilesHandler) {
  	const commandHandler = require(`./commands/${file}`);
  	// set a new item in the Collection
  	// with the key as the command name and the value as the exported module
  	client.commands.set(commandHandler.data.name, commandHandler);
  }

  client.commandsText = new Discord.Collection();

  const commandFilesHandlerText = fs.readdirSync('./textCommands').filter(fileText => fileText.endsWith('.js'));

  for (const fileText of commandFilesHandlerText) {
  	const commandHandlerText = require(`./textCommands/${fileText}`);
  	// set a new item in the Collection
  	// with the key as the command name and the value as the exported module
  	client.commandsText.set(commandHandlerText.data.name, commandHandlerText);
  }
}
};
