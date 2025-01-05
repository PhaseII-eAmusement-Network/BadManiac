const express = require('express');
const multer = require('multer');
const { Client, Events, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const { discordToken, maniacToken, uploadPath, port } = require('./config.json');

const author = {
  name: 'PhaseII eAmusement Network',
  iconURL: 'https://phaseii.network/static/favicon.png',
  url: 'https://phaseii.network'
}

var app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  }
});

const upload = multer({ storage: storage });
app.use(express.json());

// Set up command stuff
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client(
	{ 
		intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
	});

// Import commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on("messageCreate", msg => {
  if (msg.content.toLowerCase().includes("now who dat is")) {
    msg.reply("My baby mama!\n https://youtu.be/6aqFYo-9L_M");
  }
})

client.on('guildMemberAdd', (member) => {
    const channel = member.guild.channels.cache.get("798960457733898281");
    channel.send((
      `Welcome to ${'`PhaseII`'} <:phaseii:845485429587050496>, <@!${member.id}>!\n`+
      "Please read <#798960393761325087> and <#813147987759988756>,\n"+
      "and come here when done!"
    ))
})

app.get('/member/:id', async (req, res) => {
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
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user');
  }
});

app.post('/onboardArcade', (req, res) => {
  const requestData = req.body
  const arcadeData = requestData.arcade

  if (arcadeData === undefined) {
    res.end()
    throw new Error('No arcade data')
  }

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

  var onboardingMessage = [
      `## ${arcadeData.name}`,
      `*${arcadeData.description}*`,
      "```"
  ];
  for (const [key, label] of arcadeSettings) {
      onboardingMessage.push(
          arcadeData[key] ? 
          `✅ ${label} Enabled` : 
          `❌ ${label} Disabled`
      );
  }
  onboardingMessage.push(
    (
      "```\n" +
      "## Machine List"
    )
  )

  for (machine of arcadeData.machineList) {
    onboardingMessage.push((
      `### ${machine.name}\n`+
      "``" + machine.PCBID + "``\n"+
      "```"
    ))

    for (const [key, label] of machineSettings) {
      onboardingMessage.push(
          machine[key] ? 
          `✅ ${label} Enabled` : 
          `❌ ${label} Disabled`
      );
    }
    onboardingMessage.push("```")
  }

  onboardingMessage.push((
    "## Server URLs\n"+
    "Service URL: `http://xrpc.phaseii.network`\n"+
    "WebUI URL: https://phaseii.network\n"+
    "### DNS not working?\n"+
    "The direct server IP is `10.5.7.3`\n"+
    "## Need Help?\n"+
    "Please refer to https://discord.com/channels/798959764394344449/813147987759988756\n"+
    "You can always ask for help here --> https://discord.com/channels/798959764394344449/908224208130166805\n"+
    "If you need to make an adjustment to your arcade, please contact a Community Manager or a SysOp. Thanks!"
  ))


  client.users.fetch(requestData.discordId).then((user) => {
    try {
        user.send("Welcome to your new arcade!");
        user.send(onboardingMessage.join('\n'));
    } catch (err){
        console.log(err)
    }
  })
  res.end()
});

app.post('/uploadComplete', (req, res) => {
  const requestData = req.body
  const videoData = requestData.video

  if (videoData === undefined) {
    res.end()
    throw new Error('No video data')
  }

  client.users.fetch(requestData.discordId).then((user) => {
    try {
        user.send(`Your latest play video has finished uploading!\n${videoData.url}`);
    } catch (err){
        console.log(err)
    }
  })
  res.end()
});

app.post('/successfulLink', (req, res) => {
  const requestData = req.body

  client.users.fetch(requestData.discordId).then((user) => {
    try {
        user.send(`## Congratulations!\nYou've successfully paired your Discord account to PhaseII. Now what?\n- You have a profile picture in the WebUI\n- Scorecards are now enabled and will be sent as embeds via this DM.\n- You'll be notified when your play video uploads complete.\n- You'll be notified about OTA update releases and statuses.\n- You'll be notified if you have any game configuration issues.\nEnjoy!\n\nYou can disable this service by unlinking Discord at https://web3.phaseii.network/#/profile/integrate.`);
    } catch (err){
        console.log(err)
    }
  })
  res.end()
});

app.post('/sendVPNProfile/:id', upload.single('vpnFile'), async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await client.users.fetch(userId);

    if (user) {
      const file = req.file;

      if (file) {
        // Send the file to the user
        await user.send({
          content: (
            "## OpenVPN Profile\n"+
            "Use OpenVPN Community or a GL.iNet Router to connect.\n"
          ),
          files: [path.join(__dirname, uploadPath, file.originalname)]
        });

        // Remove the file after sending
        fs.unlinkSync(path.join(__dirname, uploadPath, file.originalname));

        res.status(200).send('VPN profile sent successfully.');
      } else {
        res.status(400).send('No file uploaded.');
      }
    } else {
      res.status(404).send('User not found.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending VPN profile.');
  }
});

app.get('/sendCardInfo', function (req, res) {
    client.users.fetch(req.header('id')).then((user) => {
        try {
            user.send(`A card was scanned!\n ${req.query['card']}`);	
        } catch (err){
            console.log(err)
        }
    })
    res.end()
})

app.get('/sendBadHex', function (req, res) {
  client.users.fetch(req.header('id')).then((user) => {
      try {
          user.send((
            "# Warning!\n" +
            "Your `" + req.query['dll'] + "` is configured improperly.\n\n" +
            "You need to use the updated Premium Free hex edits or disable the Premium Free hex edit for scores to properly save.\n" +
            "Thank you."
          ));	
      } catch (err){
          console.log(err)
      }
  })
  res.end()
})

app.post('/sendScorecardPM', function (req, res) {
  const game = req.header("game")
  const discord_id = req.header('discord_id')
  const arcade = req.header('arcade')
  var scorecard = JSON.parse(req.query['scorecard'])

  if(discord_id == undefined) {
    throw 'no discord id'
  }

  if(arcade == undefined) {
    throw 'no arcade'
  }

  if(scorecard == undefined) {
    throw 'no scorecard'
  }

  if(game == undefined) {
    throw 'no game'
  }

  if(game == "iidx"){
    var embedCard = new EmbedBuilder()
      .setTitle(`${scorecard.song_title} - ${scorecard.artist}`)
      .setDescription("Login to view the whole score.")
      .setAuthor(author)
      .addFields(
          { name: 'DJ Name', value: scorecard.username, inline: false },
          { name: 'Difficulty', value: scorecard.difficulty.toString(), inline: true },
          { name: 'Target EXScore', value: scorecard.target_exscore.toString(), inline: true },
          { name: 'Your EXScore', value: scorecard.exscore.toString(), inline: true },
          { name: 'Best Status', value: scorecard.target_rank, inline: true },
          { name: 'Clear Status', value: scorecard.rank, inline: true },
          { name: 'Perfect Greats', value: scorecard.pgreat.toString(), inline: true },
          { name: 'Greats', value: scorecard.great.toString(), inline: true },
          { name: 'Goods', value: scorecard.good.toString(), inline: true },
          { name: 'Bads', value: scorecard.bad.toString(), inline: true },
          { name: 'Poors', value: scorecard.poor.toString(), inline: true },
          { name: 'Combo Breaks', value: scorecard.combo.toString(), inline: true },
          { name: 'Fasts', value: scorecard.fast.toString(), inline: true },
          { name: 'Slows', value: scorecard.slow.toString(), inline: true },
      )
      .setFooter({ text: `Recorded on: ${Date().toLocaleString()}`});
  } else if(game == 'ddr'){
    const ranks = {
      0: '<:Grade_AAAM:990824397268975616>',
      1: '<:Grade_AAA:990824396035858492>',
      2: '<:Grade_AA:990824394957942825>',
      3: '<:Grade_A:990824393280204840>',
      4: '<:Grade_B:990824397944262707>',
      5: '<:Grade_C:990824399470993428>',
      6: '<:Grade_D:990824402201489428>',
      7: '<:Grade_E:990824403124232223>'
    }

    const halos = {
      0: 'No Halo!',
      1: '<:FC:990825883155693608> (Full Combo!)',
      2: '<:PFC:990826055222837268> (Perfect Full Combo!)',
      3: '<:MFC:990825977418510366> (Marvelous Full Combo!)',
      4: '<:GFC:990825927040700416> (Good Full Combo!)'
    }

    const rank = scorecard.rank
    const halo = scorecard.halo

    var embedCard = new EmbedBuilder()
      .setTitle(`${scorecard.song_title} - ${scorecard.artist}`)
      .setDescription("Login to view the whole score.")
      .setAuthor(author)
      .addFields(
          { name: 'Dancer Name', value: scorecard.username, inline: false },
          { name: 'Chart', value: scorecard.chart, inline: true },
          { name: 'Difficulty', value: scorecard.difficulty.toString(), inline: true },
          { name: 'Score', value: scorecard.score.toString(), inline: true },
          { name: 'Rank', value: ranks[rank], inline: true },
          { name: 'Halo', value: halos[halo], inline: true },
          { name: 'Stats', value: "How'd ya do?", inline: false },
          { name: 'Marvelous', value: scorecard.marv.toString(), inline: true },
          { name: 'Perfect', value: scorecard.perf.toString(), inline: true },
          { name: 'Great', value: scorecard.great.toString(), inline: true },
          { name: 'Good', value: scorecard.good.toString(), inline: true },
          { name: 'Miss', value: scorecard.miss.toString(), inline: true },
          { name: 'OK', value: scorecard.ok.toString(), inline: true },
          { name: 'Max Combos', value: scorecard.combo.toString(), inline: true },
      )
      .setFooter({ text: `Recorded on: ${Date().toLocaleString()}`});
  } else if(game == 'ddr_ark'){
    const ranks = {
      0: '<:Grade_AAA:990824396035858492>',
      1: '<:Grade_AA:990824394957942825>**+**',
      2: '<:Grade_AA:990824394957942825>',
      3: '<:Grade_AA:990824394957942825>**-**',
      4: '<:Grade_A:990824393280204840>**+**',
      5: '<:Grade_A:990824393280204840>',
      6: '<:Grade_A:990824393280204840>**-**',
      7: '<:Grade_B:990824397944262707>**+**',
      8: '<:Grade_B:990824397944262707>',
      9: '<:Grade_B:990824397944262707>**-**',
      10: '<:Grade_C:990824399470993428>**+**',
      11: '<:Grade_C:990824399470993428>',
      12: '<:Grade_C:990824399470993428>**-**',
      13: '<:Grade_D:990824402201489428>**+**',
      14: '<:Grade_D:990824402201489428>',
      15: '<:Grade_E:990824403124232223>',
      16: '<:Grade_AAAM:990824397268975616>',
    }

    const halos = {
      0: 'No Halo!',
      1: 'No Halo!',
      2: 'No Halo!',
      3: 'No Halo!',
      4: 'No Halo!',
      5: 'No Halo!',
      6: 'No Halo!',
      7: '<:GFC:990825927040700416> (Good Full Combo!)',
      8: '<:FC:990825883155693608> (Full Combo!)',
      9: '<:PFC:990826055222837268> (Perfect Full Combo!)',
      10: '<:MFC:990825977418510366> (Marvelous Full Combo!)',
    }

    const rank = scorecard.rank
    const halo = scorecard.halo

    var embedCard = new EmbedBuilder()
      .setTitle(`${scorecard.song_title} - ${scorecard.artist}`)
      .setDescription("Login to view the whole score.")
      .setAuthor(author)
      .addFields(
          { name: 'Dancer Name', value: scorecard.username, inline: false },
          { name: 'Chart', value: scorecard.chart, inline: true },
          { name: 'Difficulty', value: scorecard.difficulty.toString(), inline: true },
          { name: 'Score', value: scorecard.score.toString(), inline: true },
          { name: 'EXScore', value: scorecard.exscore.toString(), inline: true },
          { name: 'Rank', value: ranks[rank], inline: true },
          { name: 'Halo', value: halos[halo], inline: true },
          { name: 'Stats', value: "How'd ya do?", inline: false },
          { name: 'Marvelous', value: scorecard.marv.toString(), inline: true },
          { name: 'Perfect', value: scorecard.perf.toString(), inline: true },
          { name: 'Great', value: scorecard.great.toString(), inline: true },
          { name: 'Good', value: scorecard.good.toString(), inline: true },
          { name: 'Miss', value: scorecard.miss.toString(), inline: true },
          { name: 'OK', value: scorecard.ok.toString(), inline: true },
          { name: 'Fast', value: scorecard.fast.toString(), inline: true },
          { name: 'Slow', value: scorecard.slow.toString(), inline: true },
          { name: 'Max Combos', value: scorecard.combo.toString(), inline: true },
      )
      .setFooter({ text: `Recorded on: ${Date().toLocaleString()}`});
  } else if(game == 'pnm'){
    const charts = {
      0: 'Easy',
      1: 'Normal',
      2: 'Hyper',
      3: "EX"
    }

    const clearmedal = {
      1: '🔴 (Circle FAILED)',
      2: '♦️ (Diamond FAILED)',
      3: '⭐FAIL (Star FAILED)',
      4: 'Easy CLEARED',
      5: '🔵 (Circle CLEARED)',
      6: '🔷 (Diamond CLEARED)',
      7: '✨ (Star CLEARED)',
      8: '🟢 (Circle FULL COMBO)',
      9: '💎 (Diamond FULL COMBO)',
      10: '🌟 (Star FULL COMBO)',
      11: '👌 (PERFECT!)'
    }

    const ranks = {
      1: 'E',
      2: 'D',
      3: 'C',
      4: 'B',
      5: 'A',
      6: 'AA',
      7: 'AAA',
      8: 'S'
    }

    const chart = scorecard.chart
    const rank = scorecard.clear_rank
    const medal = scorecard.clearmedal

    var embedCard = new EmbedBuilder()
      .setTitle(`${scorecard.song_title} - ${scorecard.artist}`)
      .setDescription("Login to view the whole score.")
      .setAuthor(author)
      .addFields(
          { name: 'Player', value: scorecard.username, inline: false },
          { name: 'Chart', value: charts[chart], inline: true },
          { name: 'Difficulty', value: scorecard.difficulty.toString(), inline: true },
          { name: 'Points', value: scorecard.points.toString(), inline: true },
          { name: 'Medal', value: clearmedal[medal], inline: true },
          { name: 'Rank', value: ranks[rank], inline: true },
          { name: 'Stats', value: "How'd ya do?", inline: false },
          { name: 'Cools', value: scorecard.cool.toString(), inline: true },
          { name: 'Greats', value: scorecard.great.toString(), inline: true },
          { name: 'Goods', value: scorecard.good.toString(), inline: true },
          { name: 'Bads', value: scorecard.bad.toString(), inline: true },
          { name: 'Combos', value: scorecard.combo.toString(), inline: true },
      )
      .setFooter({ text: `Recorded on: ${Date().toLocaleString()}`});
  }

  client.users.fetch(discord_id).then((user) => {
      try {
          user.send(`From your game of ${scorecard.game} at ${arcade}`);
          user.send({ embeds: [embedCard] });	
      } catch (err){
          console.log(err)
      }
  })
  res.end()
})

client.login(discordToken).then(() => {
  client.user.setPresence({
    activities: [{name: 'to die.', type: ActivityType.Playing}],
    status: 'online',
  });

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});
