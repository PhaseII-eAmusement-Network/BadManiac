const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('BM')
		.setDescription('Enter completely darkness.'),
	async execute(interaction) {
		await interaction.reply('https://youtu.be/0WqzvPS_bDg');
	},
};