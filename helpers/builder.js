import { EmbedBuilder } from "discord.js";
const author = {
	name: "PhaseII eAmusement Network",
	iconURL: "https://phaseii.network/static/favicon.png",
	url: "https://phaseii.network",
};

export function buildArcadeEmbed(arcadeData) {
	const arcadeSettings = [
		["paseli", "PASELI"],
		["infinitePaseli", "Infinite PASELI"],
		["maintenance", "Maintenance Mode"],
		["betas", "Betas"],
		["incognito", "Incognito Mode"],
	];

	const machineSettings = [
		["cabinet", "Cabinet Mode"],
		["ota", "OTA Updates"],
	];

	const lines = [`## ${arcadeData.name}`, `*${arcadeData.description}*`, "```"];

	for (const [key, label] of arcadeSettings) {
		lines.push(
			arcadeData[key] ? `✅ ${label} Enabled` : `❌ ${label} Disabled`,
		);
	}

	lines.push("```\n## Machine List");

	for (const machine of arcadeData.machineList) {
		lines.push(`### ${machine.name}\n\`\`${machine.PCBID}\`\`\n\`\`\``);
		for (const [key, label] of machineSettings) {
			lines.push(machine[key] ? `✅ ${label} Enabled` : `❌ ${label} Disabled`);
		}
		lines.push("```");
	}

	return lines;
}

export function buildIIDXEmbed(scorecard) {
	const now = new Date().toLocaleString();

	return new EmbedBuilder()
		.setTitle(`${scorecard.song_title} - ${scorecard.artist}`)
		.setDescription("Login to view the whole score.")
		.setAuthor(author)
		.addFields(
			{ name: "DJ Name", value: scorecard.username },
			{
				name: "Difficulty",
				value: `${scorecard.difficulty}`,
				inline: true,
			},
			{
				name: "Target EXScore",
				value: `${scorecard.target_exscore}`,
				inline: true,
			},
			{
				name: "Your EXScore",
				value: `${scorecard.exscore}`,
				inline: true,
			},
			{ name: "Best Status", value: scorecard.target_rank, inline: true },
			{ name: "Clear Status", value: scorecard.rank, inline: true },
			{
				name: "Perfect Greats",
				value: `${scorecard.pgreat}`,
				inline: true,
			},
			{ name: "Greats", value: `${scorecard.great}`, inline: true },
			{ name: "Goods", value: `${scorecard.good}`, inline: true },
			{ name: "Bads", value: `${scorecard.bad}`, inline: true },
			{ name: "Poors", value: `${scorecard.poor}`, inline: true },
			{ name: "Combo Breaks", value: `${scorecard.combo}`, inline: true },
			{ name: "Fasts", value: `${scorecard.fast}`, inline: true },
			{ name: "Slows", value: `${scorecard.slow}`, inline: true },
		)
		.setFooter({ text: `Recorded on: ${now}` });
}

export function buildDDREmbed(scorecard, ace = false) {
	const now = new Date().toLocaleString();

	const ranks = [
		"<:Grade_AAAM:990824397268975616>",
		"<:Grade_AAA:990824396035858492>",
		"<:Grade_AA:990824394957942825>",
		"<:Grade_A:990824393280204840>",
		"<:Grade_B:990824397944262707>",
		"<:Grade_C:990824399470993428>",
		"<:Grade_D:990824402201489428>",
		"<:Grade_E:990824403124232223>",
	];

	const halos = [
		"No Halo!",
		"<:FC:990825883155693608> (Full Combo!)",
		"<:PFC:990826055222837268> (Perfect Full Combo!)",
		"<:MFC:990825977418510366> (Marvelous Full Combo!)",
		"<:GFC:990825927040700416> (Good Full Combo!)",
	];

	const aceRanks = {
		0: "<:Grade_AAA:990824396035858492>",
		1: "<:Grade_AA:990824394957942825>**+**",
		2: "<:Grade_AA:990824394957942825>",
		3: "<:Grade_AA:990824394957942825>**-**",
		4: "<:Grade_A:990824393280204840>**+**",
		5: "<:Grade_A:990824393280204840>",
		6: "<:Grade_A:990824393280204840>**-**",
		7: "<:Grade_B:990824397944262707>**+**",
		8: "<:Grade_B:990824397944262707>",
		9: "<:Grade_B:990824397944262707>**-**",
		10: "<:Grade_C:990824399470993428>**+**",
		11: "<:Grade_C:990824399470993428>",
		12: "<:Grade_C:990824399470993428>**-**",
		13: "<:Grade_D:990824402201489428>**+**",
		14: "<:Grade_D:990824402201489428>",
		15: "<:Grade_E:990824403124232223>",
		16: "<:Grade_AAAM:990824397268975616>",
	};

	const aceHalos = {
		0: "No Halo!",
		1: "No Halo!",
		2: "No Halo!",
		3: "No Halo!",
		4: "No Halo!",
		5: "No Halo!",
		6: "No Halo!",
		7: "<:GFC:990825927040700416> (Good Full Combo!)",
		8: "<:FC:990825883155693608> (Full Combo!)",
		9: "<:PFC:990826055222837268> (Perfect Full Combo!)",
		10: "<:MFC:990825977418510366> (Marvelous Full Combo!)",
	};

	var embed = new EmbedBuilder()
		.setTitle(`${scorecard.song_title} - ${scorecard.artist}`)
		.setDescription("Login to view the whole score.")
		.setAuthor(author)
		.addFields(
			{ name: "Dancer Name", value: scorecard.username },
			{ name: "Chart", value: scorecard.chart, inline: true },
			{
				name: "Difficulty",
				value: `${scorecard.difficulty}`,
				inline: true,
			},
			{ name: "Score", value: `${scorecard.score}`, inline: true },
			{
				name: "Rank",
				value:
					(!ace ? ranks[scorecard.rank] : aceRanks[scorecard.rank]) ||
					"Unknown",
				inline: true,
			},
			{
				name: "Halo",
				value:
					(!ace ? halos[scorecard.halo] : aceHalos[scorecard.halo]) ||
					"Unknown",
				inline: true,
			},
			{ name: "Stats", value: "How'd ya do?" },
			{ name: "Marvelous", value: `${scorecard.marv}`, inline: true },
			{ name: "Perfect", value: `${scorecard.perf}`, inline: true },
			{ name: "Great", value: `${scorecard.great}`, inline: true },
			{ name: "Good", value: `${scorecard.good}`, inline: true },
			{ name: "Miss", value: `${scorecard.miss}`, inline: true },
			{ name: "OK", value: `${scorecard.ok}`, inline: true },
			{ name: "Max Combos", value: `${scorecard.combo}`, inline: true },
		)
		.setFooter({ text: `Recorded on: ${now}` });

	if (ace) {
		embed.addFields(
			{
				name: "EXScore",
				value: scorecard.exscore.toString(),
				inline: true,
			},
			{ name: "Fast", value: scorecard.fast.toString(), inline: true },
			{ name: "Slow", value: scorecard.slow.toString(), inline: true },
		);
	}

	return embed;
}

export function buildPNMEmbed(scorecard) {
	const now = new Date().toLocaleString();

	const charts = {
		0: "Easy",
		1: "Normal",
		2: "Hyper",
		3: "EX",
	};

	const clearmedal = {
		1: "🔴 (Circle FAILED)",
		2: "♦️ (Diamond FAILED)",
		3: "⭐FAIL (Star FAILED)",
		4: "Easy CLEARED",
		5: "🔵 (Circle CLEARED)",
		6: "🔷 (Diamond CLEARED)",
		7: "✨ (Star CLEARED)",
		8: "🟢 (Circle FULL COMBO)",
		9: "💎 (Diamond FULL COMBO)",
		10: "🌟 (Star FULL COMBO)",
		11: "👌 (PERFECT!)",
	};

	const ranks = {
		1: "E",
		2: "D",
		3: "C",
		4: "B",
		5: "A",
		6: "AA",
		7: "AAA",
		8: "S",
	};

	return new EmbedBuilder()
		.setTitle(`${scorecard.song_title} - ${scorecard.artist}`)
		.setDescription("Login to view the whole score.")
		.setAuthor(author)
		.addFields(
			{ name: "Player", value: scorecard.username, inline: false },
			{ name: "Chart", value: charts[scorecard.chart], inline: true },
			{
				name: "Difficulty",
				value: scorecard.difficulty.toString(),
				inline: true,
			},
			{
				name: "Points",
				value: scorecard.points.toString(),
				inline: true,
			},
			{
				name: "Rank",
				value: ranks[scorecard.clear_rank] || "Unknown",
				inline: true,
			},
			{
				name: "Medal",
				value: clearmedal[scorecard.clearmedal] || "Unknown",
				inline: true,
			},
			{ name: "Stats", value: "How'd ya do?", inline: false },
			{ name: "Cools", value: scorecard.cool.toString(), inline: true },
			{ name: "Greats", value: scorecard.great.toString(), inline: true },
			{ name: "Goods", value: scorecard.good.toString(), inline: true },
			{ name: "Bads", value: scorecard.bad.toString(), inline: true },
			{ name: "Combos", value: scorecard.combo.toString(), inline: true },
		)
		.setFooter({ text: `Recorded on: ${now}` });
}

export function buildExceptionEmbed(exceptionData) {
	const author = {
		name: "PhaseII Event Logger",
		iconURL: "https://phaseii.network/static/favicon.png",
		url: "https://phaseii.network/admin/events",
	};
	const now = new Date().toLocaleString();

	var embed = new EmbedBuilder()
		.setTitle(`Service Exception!`)
		.setDescription("View the event log for more information.")
		.setAuthor(author)
		.addFields(
			{ name: "Service", value: exceptionData.service, inline: false }
		)
		.setFooter({ text: `Recorded on: ${now}` });

	if (exceptionData.service === "xrpc") {
		embed.addFields(
			{ name: "Model", value: `\`\`\`fix\n${exceptionData.model}\`\`\``, inline: false },
			{ name: "Request", value: `\`\`\`fix\n${exceptionData.request}\`\`\``, inline: true },
			{ name: "Method", value: `\`\`\`fix\n${exceptionData.method}\`\`\``, inline: true },
			{ name: "PCBID", value: `\`\`\`fix\n${exceptionData.PCBID}\`\`\``, inline: false },
		)
	} else {
		embed.addFields({ name: "Request", value: `\`\`\`xml\n${exceptionData.request}\`\`\``, inline: true })
	}

	embed.addFields({ name: "Traceback", value: `\`\`\`py\n${exceptionData.traceback}\`\`\``, inline: false })
	return embed
}
