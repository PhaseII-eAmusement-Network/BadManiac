import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("bm")
	.setDescription("Enter completely darkness.");

export async function execute(interaction) {
	await interaction.reply("https://youtu.be/JXeFeOTqxWc");
}
