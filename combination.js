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

  if (msg.content.toLowerCase().includes('akeno')) {
    msg.reply("we stan Rias in this household thank you very much. \n" +
    "https://i.imgur.com/VpSmGlr.gif")
  } else if (msg.content.toLowerCase().includes('rias')) {
    msg.reply("thank you for following the rules. \n"+
    "https://thumbs.gfycat.com/ColossalCreamyArrowworm-max-1mb.gif")
  }

  if (msg.content.slice(0, 13) == "BM! to_bottom") {
    msg.reply(bottomify.encode(msg.content.slice(14)))
  } else if (msg.content.slice(0, 15) == "BM! from_bottom") {
    msg.reply(bottomify.decode(msg.content.slice(16)))
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
  } else if (msg.content == 'BM! help') {
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
    //do ddr things
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
      10: '🌟(Star FULL COMBO)',
      11: '👌(PERFECT!)'
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