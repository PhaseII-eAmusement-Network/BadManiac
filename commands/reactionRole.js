import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { Database } from "../db/index.js";

export const data = new SlashCommandBuilder()
	.setName("reaction-role")
	.setDescription("Sets up a reaction role (Admin only)")
	.addStringOption((option) =>
		option
			.setName("message-id")
			.setDescription("The ID of the message to add reaction role to")
			.setRequired(true),
	)
	.addRoleOption((option) =>
		option
			.setName("role")
			.setDescription("The role to be applied/removed")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("emote")
			.setDescription("The emote to react with (emoji or custom emote ID)")
			.setRequired(true),
	);

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

	const messageId = interaction.options.getString("message-id");
	const role = interaction.options.getRole("role");
	const emote = interaction.options.getString("emote");

	try {
		const channel = interaction.channel;
		const message = await channel.messages.fetch(messageId);

		const emoteRegex = /(?:<:[a-zA-Z0-9]+:)?(\d+)>?/;
		const match = emote.match(emoteRegex);
		const reactionEmote = match ? match[1] || emote : emote;

		await message.react(reactionEmote);

		await Database.update(({ reactionRoles }) =>
			reactionRoles.push({
				messageId: messageId,
				channelId: channel.id,
				roleId: role.id,
				emote: reactionEmote,
			}),
		);

		const successEmbed = new EmbedBuilder()
			.setColor("#00ff00")
			.setTitle("Reaction Role Created")
			.setDescription("Reaction role has been successfully set up!")
			.addFields(
				{ name: "Message ID", value: messageId },
				{ name: "Role", value: `<@&${role.id}>` },
				{ name: "Emote", value: emote },
			)
			.setTimestamp();

		await interaction.reply({
			embeds: [successEmbed],
			flags: MessageFlags.Ephemeral,
		});
	} catch (error) {
		console.error("Error setting up reaction role:", error);
		await interaction.reply({
			content:
				"Failed to set up reaction role. Make sure the message ID is valid and I have permission to react!",
			flags: MessageFlags.Ephemeral,
		});
	}
}
