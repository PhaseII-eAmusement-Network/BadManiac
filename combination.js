const https = require('https')
var express = require('express');
const bottomify = require('bottomify');
const Discord = require("discord.js");
const { MessageEmbed } = require('discord.js');
var app = express();
var fs = require("fs");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "DIRECT_MESSAGES"]})

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity("to die.");
  })

client.on("messageCreate", msg => {
  if (msg.content.includes("69") && msg.content.length <= 5) {
    msg.reply("nice lol");
  }

  if (msg.content === "ping") {
    msg.reply("pong");
  }

  if (msg.content.toLowerCase() === "now who dat is?") {
    msg.reply("My baby mama!\n https://youtu.be/6aqFYo-9L_M");
  }

  // Actual bot commands now lol
  if (msg.content == 'BM! news') {
    const options = new URL('https://restfulsleep.phaseii.network/getlatestnews');
    
    const req = https.request(options, res => {
        res.on('data', d => {
            var news = JSON.parse(d)
            for (let post = 0; post < news.news.length; post++) {
                let cleanbody = news.news[post].body.replace('<br>', "").replace('</br>', "")
                const exampleEmbed = new MessageEmbed()
                    .setTitle('Latest News')
                    .setAuthor({ name: 'PhaseII eAmusement Network', iconURL: 'https://media1.giphy.com/media/3ov9jU4ycPvfrPTsly/giphy-downsized-large.gif', url: 'https://phaseii.network' })
                    .addFields(
                        { name: 'Title', value: news.news[post].title, inline: false },
                        { name: 'Body', value: cleanbody, inline: true },
                    )
                    //.setImage('https://i.imgur.com/AfFp7pu.png')
                    .setFooter({ text: 'Posted on: ' + news.news[post].timestamp});

                    msg.reply({ embeds: [exampleEmbed] })
            }
        })
    })
    
    req.on('error', error => {
        console.error(error)
    })
    
    req.end()
  }
  else if (msg.content.slice(0,11) == 'BM! profile') {
    const options = new URL('https://restfulsleep.phaseii.network/v1/user/getProfile');
    let stats = false

    if (msg.content.slice(12,17) == 'stats') {
      msg.reply('ligma balls')
    }
    
    const req = https.request(options, res => {
        res.on('data', d => {
            var news = JSON.parse(d)
            for (let post = 0; post < news.news.length; post++) {
                let cleanbody = news.news[post].body.replace('<br>', "").replace('</br>', "")
                const exampleEmbed = new MessageEmbed()
                    .setTitle('Latest News')
                    .setAuthor({ name: 'PhaseII eAmusement Network', iconURL: 'https://media1.giphy.com/media/3ov9jU4ycPvfrPTsly/giphy-downsized-large.gif', url: 'https://phaseii.network' })
                    .addFields(
                        { name: 'Title', value: news.news[post].title, inline: false },
                        { name: 'Body', value: cleanbody, inline: true },
                    )
                    //.setImage('https://i.imgur.com/AfFp7pu.png')
                    .setFooter({ text: 'Posted on: ' + news.news[post].timestamp});

                    msg.reply({ embeds: [exampleEmbed] })
            }
        })
    })
    
    req.on('status', error => {
        console.error(error)
    })
      
      req.end()
  } 
  else if (msg.content == 'BM! help') {
    msg.reply(
        "```"+
        "BadManiac is the bot designed for the PhaseII eAmusement Network. \n"+
        "Used for DMing people their scorecards and other dumb shit. \n"+
        "\n"+
        "BadManiac commands: \n"+
        "BM! help: Returns this help message. \n"+
        "BM! news: Returns the latest news post. \n"+
        "BM! to_bottom: Encodes any text after your message to bottom format. \n"+
        "BM! from_bottom: Decodes your bottom message to string. \n"+
        "BM!: Sends YouTube link to Bad Maniacs. \n"+
        "```"
    )
  } else if (msg.content == 'BM!') {
    msg.reply("https://youtu.be/0WqzvPS_bDg")
  }
})

client.on('guildMemberAdd', (member) => {
    const channel = member.guild.channels.cache.get("798960457733898281");
    let welcome = (
        "Welcome to `PhaseII`, " + `<@!${member.id}>` + "! \n"+
        "Please read <#798960393761325087> and <#813147987759988756>, \n"+
        "and come here when done! <:phaseii:845485429587050496>"
    )
    channel.send(welcome)
})

app.get('/sendDM', function (req, res) {
    client.users.fetch(req.query['id']).then((user) => {
        try {
            user.send("/tts Right, I'll tell you what, you fat little cunt. You're boring, you don't sound Nigerian at all, so go fuck yourself. Go fucking die in a dank little hole where you fucking come from.");	
        } catch (err){
            console.log("err")
        }
    })
    res.end()
})

app.post('/sendScorecardPM', function (req, res) {
  game = req.header("game")
  discordid = req.header('discord_id')
  arcade = req.header('arcade')
  scorecard = JSON.parse(req.query['scorecard'])

  if(discordid == undefined) {
    throw 'no discord id'
  } else if(arcade == undefined) {
    throw 'no arcade'
  } else if(scorecard == undefined) {
    throw 'no scorecard'
  } else if(game == undefined) {
    throw 'no game'
  }

  author = { name: 'PhaseII eAmusement Network', iconURL: 'https://media1.giphy.com/media/3ov9jU4ycPvfrPTsly/giphy-downsized-large.gif', url: 'https://phaseii.network' }

  /*
  {
    game: 'Beatmania IIDX PENDUAL',
    username: 'TRMAZI',
    song_title: 'Bad Maniacs',
    artist: 'kors k as teranoid',
    difficulty: 7,
    target_rank: 'NO PLAY',
    rank: 'FAILED',
    target_exscore: 890,
    exscore: 0,
    pgreat: 0,
    great: 0,
    good: 0,
    bad: 0,
    poor: 50,
    combo: 50,
    fast: 0,
    slow: 0
  }
  */

  if(game == "iidx"){
    embedCard = new MessageEmbed()
      .setTitle(scorecard.song_title + " - "+scorecard.artist)
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
      .setFooter({ text: 'Recorded on: ' + Date().toLocaleString()});
  } else if(game == 'ddr'){
    var ranks = {
      0: '<:Grade_AAAM:990824397268975616>',
      1: '<:Grade_AAA:990824396035858492>',
      2: '<:Grade_AA:990824394957942825>',
      3: '<:Grade_A:990824393280204840>',
      4: '<:Grade_B:990824397944262707>',
      5: '<:Grade_C:990824399470993428>',
      6: '<:Grade_D:990824402201489428>',
      7: '<:Grade_E:990824403124232223>'
    }

    var halos = {
      0: 'No Halo!',
      1: '<:FC:990825883155693608> (Full Combo!)',
      2: '<:PFC:990826055222837268> (Perfect Full Combo!)',
      3: '<:MFC:990825977418510366> (Marvelous Full Combo!)',
      4: '<:GFC:990825927040700416> (Good Full Combo!)'
    }

    var rank = scorecard.rank
    var halo = scorecard.halo

    embedCard = new MessageEmbed()
      .setTitle(scorecard.song_title + " - "+scorecard.artist)
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
      .setFooter({ text: 'Recorded on: ' + Date().toLocaleString()});
  } else if(game == 'ddr_ark'){
    var ranks = {
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

    var halos = {
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

    var rank = scorecard.rank
    var halo = scorecard.halo

    embedCard = new MessageEmbed()
      .setTitle(scorecard.song_title + " - "+scorecard.artist)
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
      .setFooter({ text: 'Recorded on: ' + Date().toLocaleString()});
  } else if(game == 'pnm'){
    var charts = {
      0: 'Easy',
      1: 'Normal',
      2: 'Hyper',
      3: "EX"
    }

    var clearmedal = {
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

    var ranks = {
      1: 'E',
      2: 'D',
      3: 'C',
      4: 'B',
      5: 'A',
      6: 'AA',
      7: 'AAA',
      8: 'S'
    }

    var chart = scorecard.chart
    var rank = scorecard.clear_rank
    var medal = scorecard.clearmedal

    embedCard = new MessageEmbed()
      .setTitle(scorecard.song_title + " - "+scorecard.artist)
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
      .setFooter({ text: 'Recorded on: ' + Date().toLocaleString()});
  } else if(game == 'sdvx'){
    //do sdvx things
  }

  client.users.fetch(discordid).then((user) => {
      try {
          user.send('From your game of '+scorecard.game+' at '+arcade);
          user.send({ embeds: [embedCard] });	
      } catch (err){
          console.log("err")
      }
  })
  res.end()
})

var server = app.listen(8017, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
   client.login("OTI4NTUwMzY5ODU5MTA4OTA0.YdaZ6w.cj2GQ95nGK3IHX31RfnQAO0bGp4")
})