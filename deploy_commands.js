import { REST, Routes } from "discord.js";
import JSONConfig from "./config.json" with { type: "json" };
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load command files
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

const guildCommands = [];
const adminCommands = [];

for (const file of commandFiles) {
	const filePath = pathToFileURL(path.join(commandsPath, file)).href;
	const command = await import(filePath);

	if ("data" in command && typeof command.data.toJSON === "function") {
		const json = command.data.toJSON();
		const isAdmin = command.meta?.adminOnly === true;

		if (isAdmin) {
			adminCommands.push(json);
		} else {
			guildCommands.push(json);
		}
	} else {
		console.warn(
			`[WARNING] The command at ${file} is missing a "data" property or toJSON method.`,
		);
	}
}

// Register commands with Discord
const rest = new REST({ version: "10" }).setToken(JSONConfig.discordToken);

try {
	console.log(
		`Started refreshing ${guildCommands.length} guild commands and ${adminCommands.length} admin commands.`,
	);

	const guildResult = await rest.put(
		Routes.applicationGuildCommands(JSONConfig.clientId, JSONConfig.guildId),
		{ body: guildCommands },
	);

	const adminResult = await rest.put(
		Routes.applicationGuildCommands(
			JSONConfig.clientId,
			JSONConfig.adminGuildId,
		),
		{ body: adminCommands },
	);

	console.log(`Successfully reloaded ${guildResult.length} guild commands.`);
	console.log(`Successfully reloaded ${adminResult.length} admin commands.`);
} catch (error) {
	console.error(error);
}
