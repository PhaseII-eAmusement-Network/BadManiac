import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { Database } from "../db/index.js";

export const data = new SlashCommandBuilder()
	.setName("generate-greeting-key")
	.setDescription("Generates a key for the greetings channel (Admin only)");

export const meta = {
	adminOnly: true,
};

export async function execute(interaction, BMConfig = {}) {
	const member = interaction.member;

	if (!member.roles.cache.has(BMConfig.adminRole)) {
		return await interaction.reply({
			content: "You need the Admin role to use this command!",
			flags: MessageFlags.Ephemeral,
		});
	}

	const newKey = Math.floor(1000 + Math.random() * 9000);
	await Database.read();
	Database.data["greetingKey"] = newKey;
	await Database.write();

	const apiKeyEmbed = new EmbedBuilder()
		.setColor("#00ff00")
		.setTitle("Greeting key updated")
		.setDescription("A new Greeting key has been generated.")
		.addFields(
			{ name: "Key", value: "```" + newKey + "```" }
		)
		.setTimestamp()
		.setFooter({
			text: `Generated by ${interaction.user.username}`,
			iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
		});

	await interaction.reply({
		embeds: [apiKeyEmbed],
	});
}
