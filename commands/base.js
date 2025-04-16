import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("bm")
	.setDescription("Enter completely darkness.");

export async function execute(interaction, BMConfig = {}) {
	await interaction.reply(
		"BadManiac is open source!\nhttps://github.com/PhaseII-eAmusement-Network/BadManiac\n\nhttps://youtu.be/JXeFeOTqxWc",
	);
}
