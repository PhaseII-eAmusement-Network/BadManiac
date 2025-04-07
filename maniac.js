import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "url";
import express from "express";
import multer from "multer";
import {
	Client,
	Events,
	GatewayIntentBits,
	Collection,
	ActivityType,
} from "discord.js";
import {
	buildArcadeEmbed,
	buildIIDXEmbed,
	buildDDREmbed,
	buildPNMEmbed,
} from "./helpers/builder.js";
import JSONConfig from "./config.json" with { type: "json" };
import { Database } from "./db/index.js";

var app = express();
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, JSONConfig.uploadPath); // Specify the destination folder
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname); // Use the original file name
	},
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({ storage: storage });
app.use(express.json());

const authenticateAPIKey = async (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
        return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'API key is required in X-API-Key header' 
        });
    }

    try {
        const db = await Database.data;
        const validKey = db.keys.find(keyObj => keyObj.key === apiKey);
        
        if (!validKey) {
            return res.status(403).json({ 
                error: 'Forbidden',
                message: 'Invalid API key' 
            });
        }
        
        // Optionally attach the member info to the request
        req.authenticatedMember = validKey.member;
        next();
    } catch (error) {
        console.error('Error validating API key:', error);
        res.status(500).json({ 
            error: 'Server Error',
            message: 'Error validating API key' 
        });
    }
};
app.use(authenticateAPIKey);

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

// Import commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	try {
		const command = await import(pathToFileURL(filePath).href);
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	} catch (error) {
		console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
	}
}

client.once(Events.ClientReady, (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, JSONConfig);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true,
			});
		}
	}
});

client.on("messageCreate", (msg) => {
	if (msg.content.toLowerCase().includes("now who dat is")) {
		msg.reply("My baby mama!\n https://youtu.be/6aqFYo-9L_M");
	}
});

client.on("guildMemberAdd", (member) => {
	const channel = member.guild.channels.cache.get("798960457733898281");
	channel.send(
		`Welcome to ${"`PhaseII`"} <:phaseii:845485429587050496>, <@!${member.id}>!\n` +
			"Please read <#798960393761325087> and <#813147987759988756>,\n" +
			"and come here when done!",
	);
});

app.get("/member/:id", async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await client.users.fetch(userId);

		if (user) {
			res.json({
				username: user.username,
				displayName: user.displayName,
				avatar: user.displayAvatarURL({ dynamic: true, size: 1024 }),
			});
		} else {
			res.status(404).send("User not found");
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Error fetching user");
	}
});

app.post("/onboardArcade", (req, res) => {
	const requestData = req.body;
	const arcadeData = requestData.arcade;

	if (arcadeData === undefined) {
		res.end();
		throw new Error("No arcade data");
	}

	var onboardingMessage = buildArcadeEmbed(arcadeData);

	onboardingMessage.push(
		"## Server URLs\n" +
			"Service URL: `http://xrpc.phaseii.network`\n" +
			"WebUI URL: https://phaseii.network\n" +
			"New (beta) WebUI URL: https://web3.phaseii.network\n" +
			"### DNS not working?\n" +
			"The direct server IP is `10.5.7.3`\n" +
			"## Need Help?\n" +
			"Please refer to https://discord.com/channels/798959764394344449/813147987759988756\n" +
			"You can always ask for help here --> https://discord.com/channels/798959764394344449/908224208130166805\n" +
			"If you need to make an adjustment to your arcade, please contact a Community Manager or a SysOp. Thanks!",
	);

	client.users.fetch(requestData.discordId).then((user) => {
		try {
			user.send("Welcome to your new arcade!");
			user.send(onboardingMessage.join("\n"));
		} catch (err) {
			console.log(err);
		}
	});
	res.end();
});

app.post("/uploadComplete", (req, res) => {
	const requestData = req.body;
	const videoData = requestData.video;

	if (videoData === undefined) {
		res.end();
		throw new Error("No video data");
	}

	client.users.fetch(requestData.discordId).then((user) => {
		try {
			user.send(
				`Your latest play video has finished uploading!\n${videoData.url}`,
			);
		} catch (err) {
			console.log(err);
		}
	});
	res.end();
});

app.post("/successfulLink", (req, res) => {
	const requestData = req.body;

	client.users.fetch(requestData.discordId).then((user) => {
		try {
			user.send(
				`## Congratulations!\nYou've successfully paired your Discord account to PhaseII. Now what?\n- You have a profile picture in the WebUI\n- Scorecards are now enabled and will be sent as embeds via this DM.\n- You'll be notified when your play video uploads complete.\n- You'll be notified about OTA update releases and statuses.\n- You'll be notified if you have any game configuration issues.\nEnjoy!\n\nYou can disable this service by unlinking Discord at https://web3.phaseii.network/#/profile/integrate.`,
			);
		} catch (err) {
			console.log(err);
		}
	});
	res.end();
});

app.post("/sendVPNProfile/:id", upload.single("vpnFile"), async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await client.users.fetch(userId);

		if (user) {
			const file = req.file;

			if (file) {
				// Send the file to the user
				await user.send({
					content:
						"## OpenVPN Profile\n" +
						"Use OpenVPN Community or a GL.iNet Router to connect.\n",
					files: [path.join(JSONConfig.uploadPath, file.originalname)],
				});

				// Remove the file after sending
				fs.unlinkSync(path.join(JSONConfig.uploadPath, file.originalname));

				res.status(200).send("VPN profile sent successfully.");
			} else {
				res.status(400).send("No file uploaded.");
			}
		} else {
			res.status(404).send("User not found.");
		}
	} catch (error) {
		console.error(error);
		res.status(500).send("Error sending VPN profile.");
	}
});

app.get("/sendCardInfo", function (req, res) {
	client.users.fetch(req.header("id")).then((user) => {
		try {
			user.send(`A card was scanned!\n ${req.query["card"]}`);
		} catch (err) {
			console.log(err);
		}
	});
	res.end();
});

app.get("/sendBadHex", function (req, res) {
	client.users.fetch(req.header("id")).then((user) => {
		try {
			user.send(
				"# Warning!\n" +
					"Your `" +
					req.query["dll"] +
					"` is configured improperly.\n\n" +
					"You need to use the updated Premium Free hex edits or disable the Premium Free hex edit for scores to properly save.\n" +
					"Thank you.",
			);
		} catch (err) {
			console.log(err);
		}
	});
	res.end();
});

app.post("/sendScorecardPM", async function (req, res) {
	const game = req.header("game");
	const discord_id = req.header("discord_id");
	const arcade = req.header("arcade");
	const scorecard = JSON.parse(req.query["scorecard"]);

	if (!discord_id || !arcade || !scorecard || !game) {
		return res.status(400).send("Missing required headers or parameters.");
	}

	var embedCard;
	try {
		switch (game) {
			case "iidx":
				embedCard = buildIIDXEmbed(scorecard);
				break;

			case "ddr": {
				embedCard = buildDDREmbed(scorecard, false);
				break;
			}

			case "ddr_ark": {
				embedCard = buildDDREmbed(scorecard, true);
				break;
			}

			case "pnm": {
				embedCard = buildPNMEmbed(scorecard);
				break;
			}

			default:
				return res.status(400).send("Unsupported game type.");
		}

		const user = await client.users.fetch(discord_id);
		await user.send(`From your game of ${scorecard.game} at ${arcade}`);
		await user.send({ embeds: [embedCard] });
		res.status(200).send("Scorecard sent.");
	} catch (error) {
		console.error("Error sending PM:", error);
		res.status(500).send("Failed to send scorecard.");
	}
});

client.login(JSONConfig.discordToken).then(() => {
	client.user.setPresence({
		activities: [{ name: "to die.", type: ActivityType.Playing }],
		status: "online",
	});

	app.listen(JSONConfig.port, () => {
		console.log(`Server is listening on port ${JSONConfig.port}`);
	});
});
