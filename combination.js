var express = require('express');
const Discord = require("discord.js")
var app = express();
var fs = require("fs");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "DIRECT_MESSAGES"]})

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity("to die.");
  })

client.on("messageCreate", msg => {
  if (msg.content === "ping") {
    msg.reply("pong");
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