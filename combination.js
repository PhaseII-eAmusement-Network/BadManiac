const https = require('https')
var express = require('express');
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

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
   client.login("OTI4NTUwMzY5ODU5MTA4OTA0.YdaZ6w.cj2GQ95nGK3IHX31RfnQAO0bGp4")
})