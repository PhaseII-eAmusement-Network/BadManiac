import fetch from "node-fetch";
import {
	SlashCommandBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
	ButtonStyle,
	TextInputBuilder,
	TextInputStyle,
	ModalBuilder,
	ComponentType,
	MessageFlags,
} from "discord.js";
import { GameOptions } from "../constants/index.js";
import { Database } from "../db/index.js";
import { toBuffer } from "../helpers/buffers.js";

export const data = new SlashCommandBuilder()
	.setName("pcbid-request")
	.setDescription("Register your arcade/setup with PhaseII.")
	.addIntegerOption((option) =>
		option
			.setName("secret-key")
			.setDescription("It's hidden in the guides somewhere.")
			.setRequired(true),
	);

export async function execute(interaction, BMConfig = {}) {
	const secretKey = interaction.options.getInteger("secret-key");
	await Database.read();
	try {
		if (secretKey !== (Database.data["greetingKey"] ?? null)) {
			await interaction.reply({
				content: "Incorrect secret key.",
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
	} catch (error) {
		console.error(error);
	}

	const collectedData = {
		userId: interaction.user.id,
	};

	await interaction.reply({
		content: "What are you registering?",
		components: [
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId("arcade")
					.setLabel("Arcade / Setup")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId("controller")
					.setLabel("Controller")
					.setStyle(ButtonStyle.Secondary),
			),
		],
		flags: MessageFlags.Ephemeral,
	});

	const buttonReply = await interaction.channel.awaitMessageComponent({
		componentType: ComponentType.Button,
		time: 60_000,
	});

	const type = buttonReply.customId;
	collectedData.type = type;

	const modal = new ModalBuilder()
		.setCustomId("arcadeNameModal")
		.setTitle("Arcade Name")
		.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId("arcadeNameInput")
					.setLabel("Desired arcade name")
					.setStyle(TextInputStyle.Short)
					.setRequired(true),
			),
		);

	await buttonReply.showModal(modal);

	const modalSubmit = await buttonReply.awaitModalSubmit({
		time: 60_000,
		filter: (i) => i.customId === "arcadeNameModal",
	});

	collectedData.arcadeName =
		modalSubmit.fields.getTextInputValue("arcadeNameInput");
	await modalSubmit.reply({
		content: `Name saved: ${collectedData.arcadeName}`,
		flags: MessageFlags.Ephemeral,
	});

	if (type === "arcade") {
		var cabinetCount = null;
		var attempts = 0;

		while (cabinetCount === null && attempts < 3) {
			attempts++;

			await modalSubmit.followUp({
				content:
					"How many cabinets/setups? (Please enter a number between 1 and 10)",
				ephemeral: true,
			});

			const numberMessage = await interaction.channel.awaitMessages({
				filter: (m) => m.author.id === interaction.user.id,
				max: 1,
				time: 30_000,
			});

			const input = numberMessage.first()?.content.trim();
			const parsed = parseInt(input || "", 10);
			await numberMessage.first().delete();

			if (!isNaN(parsed) && parsed > 0 && parsed <= 10) {
				cabinetCount = parsed;
			} else {
				await interaction.followUp({
					content: "⚠️ Please enter a valid number between 1 and 10.",
					ephemeral: true,
				});
			}
		}

		if (cabinetCount === null) {
			await interaction.followUp({
				content: "❌ Too many invalid attempts. Please run the command again.",
				ephemeral: true,
			});
			return;
		}

		collectedData.cabinetCount = cabinetCount;

		await modalSubmit.followUp({
			content: "Games in arcade (Select one or more)",
			components: [
				new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId("gameSelect")
						.setPlaceholder("Select game(s)")
						.setMinValues(1)
						.setMaxValues(10)
						.addOptions(GameOptions),
				),
			],
			flags: MessageFlags.Ephemeral,
		});

		const select = await interaction.channel.awaitMessageComponent({
			componentType: ComponentType.StringSelect,
			time: 60_000,
		});

		collectedData.games = select.values;
		await select.update({
			content: `Games selected: ${collectedData.games.join(", ")}`,
			components: [],
			flags: MessageFlags.Ephemeral,
		});
	} else if (type === "controller") {
		collectedData.cabinetCount = 1;
		collectedData.games = ["main"];
	}

	await interaction.followUp({
		content:
			"Please upload an image of your arcade/setup or controller. (PNG, JPG, or JPEG only)",
		ephemeral: true,
	});

	const imageMessage = await interaction.channel.awaitMessages({
		filter: (m) =>
			m.author.id === interaction.user.id && m.attachments.size > 0,
		max: 1,
		time: 60_000,
	});

	if (!imageMessage.size) {
		await interaction.followUp({
			content:
				"❌ No image received within 60 seconds. Please run the command again.",
			ephemeral: true,
		});
		return;
	}

	const attachment = imageMessage.first().attachments.first();
	const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];

	if (!attachment || !validImageTypes.includes(attachment.contentType)) {
		await interaction.followUp({
			content:
				"⚠️ Please upload a valid image (PNG, JPG, or JPEG). Run the command again.",
			ephemeral: true,
		});
		return;
	}

	var imageBuffer;
	try {
		const response = await fetch(attachment.url);
		if (!response.ok) throw new Error("Failed to download image");
		imageBuffer = toBuffer(await response.arrayBuffer());
	} catch (error) {
		console.error("Error downloading image:", error);
		await interaction.followUp({
			content: "❌ Failed to process the image. Please try again.",
			ephemeral: true,
		});
		return;
	}

	await imageMessage.first().delete();

	const channel = interaction.guild.channels.cache.get(BMConfig.adminChannel);
	await channel.send({
		content: `<@&${BMConfig.PCBIDRole ?? ""}>\nA new PCBID Request has been submitted!\nNow automated!`,
	});

	const buffer = Buffer.from(JSON.stringify(collectedData)).toString('base64')
	const baseUrl = BMConfig.onboardingUrl ?? ""
	await channel.send({
		content: `${baseUrl}/${buffer}`,
		files: [
			{
				attachment: imageBuffer,
				name: attachment.name,
			},
		],
	});

	await interaction.followUp({
		content: `✅ Your PCBID request has been submitted!\nPlease wait for a moderator or BadManiac (me!) to contact you.`,
		flags: MessageFlags.Ephemeral,
	});
}
