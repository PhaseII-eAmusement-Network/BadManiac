const https = require('https')
var express = require('express');
const Discord = require("discord.js");
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
        console.log(`statusCode: ${res.statusCode}`)
    
        res.on('data', d => {
            process.stdout.write(d)
        })
    })
    
    req.on('error', error => {
        console.error(error)
    })
    
    req.end()

    msg.reply("")
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

app.get('/sendDM', function (req, res) {
    client.users.fetch("372530806628941824").then((user) => {
        try {
            user.send("txt");	
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