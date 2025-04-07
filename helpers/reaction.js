import { Database } from "../db/index.js";

export async function handleReaction(reaction, user, add = true) {
	try {
		const message = reaction.message;
		const guild = message.guild;
		if (!guild) return;

		const member = await guild.members.fetch(user.id);
		if (member.bot) return;

		const db = Database.data;
		const reactionRoles = db.reactionRoles || [];

		const reactionRole = reactionRoles.find(
			(rr) =>
				rr.messageId === message.id &&
				rr.channelId === message.channel.id &&
				(rr.emote === reaction.emoji.id || rr.emote === reaction.emoji.name),
		);

		if (reactionRole) {
			if (add) {
				await member.roles.add(reactionRole.roleId);
			} else {
				await member.roles.remove(reactionRole.roleId);
			}
		}
	} catch (error) {
		console.error(`Failed to ${add ? "add" : "remove"} role:`, error);
	}
}
