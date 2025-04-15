import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { Database } from "../db/index.js";

export const data = new SlashCommandBuilder()
	.setName("submit-greeting")
	.setDescription("Submit the secret key and gain the @Player role.")
	.addIntegerOption((option) =>
		option
			.setName("secret-key")
			.setDescription("It's hidden in the guides somewhere.")
			.setRequired(true),
	);

export async function execute(interaction, BMConfig = {}) {
	const member = interaction.member;

	if (member.roles.cache.has(BMConfig.playerRole)) {
		return await interaction.reply({
			content: "You're already verified!",
			flags: MessageFlags.Ephemeral,
		});
	}

	try {
		await Database.read();
		if (
			interaction.options.getInteger("secret-key") ===
			(Database.data["greetingKey"] ?? null)
		) {
			await interaction.reply({
				content: "Access granted.",
				flags: MessageFlags.Ephemeral,
			});

			await member.roles.add(BMConfig.playerRole);
			const channel = member.guild.channels.cache.get(BMConfig.generalChannel);
			await channel.send(`Welcome, <@!${member.id}>!`);
		} else {
			await interaction.reply({
				content: "Incorrect secret key!",
				flags: MessageFlags.Ephemeral,
			});
		}
	} catch (error) {
		console.error(error);
	}
}
