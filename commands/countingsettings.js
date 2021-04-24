const Discord = require("discord.js")
const EmbedColor = require("../embedmongo.js")
const CountingEnabled = require("../countingenabled.js");
const fs = require("fs")
let counting = require("../counting")
const CountingSettings = require("../countingsettings.js")
module.exports = {
    name: `counting`,
    description: `Settings for counting.`,
    permissions: `MANAGE_SERVER`,
    async execute(message,args){
        if(!message.member.permissions.has("MANAGE_GUILD")){
            return message.delete();
        }
        let embedcolor = await EmbedColor.findOne({guildID: message.guild.id})
      
      if(embedcolor == null){
         embedcolor = new EmbedColor({guildID: message.guild.id, color: `RANDOM`})
        embedcolor.save()
      }
        let perms = message.guild.me.permissionsIn(message.channel).toArray()
        if(!perms.includes("EMBED_LINKS")){
          return message.channel.send(`I cannot send embeds in this channel. Please make sure I have the \`EMBED_LINKS\` permission.`).catch(error => {
            console.log(`Guild ${message.guild.id} Error ${error}`)
          })
        }
        const embed = new Discord.MessageEmbed()
        .setTitle(`Counting Settings`)
        .setDescription(`On - Turn on Counting.\nOff - Turn off counting.\nNew Number - Change the next counting number.\nCurrent Number - Show the next counting number.\nChannel - Change channel in which counting takes place.\nRuin - Resets count if user ruins it. \n(COMING SOON) Repeat - Whether users can count without someone else.\n(COMING SOON) Webhook - Whether a webhook will replace the user's message.\nCancel - Cancel this prompt.`)
        .setColor(embedcolor.color) 
        message.channel.send(`${message.member} Please select one of the following...`,embed)
        const filter = m => m.author.id == message.member.id && [m.content.toLowerCase() == "on" || m.content.toLowerCase()  == "new number" || m.content.toLowerCase()  == "current number" || m.content.toLowerCase()  == "cancel" || m.content.toLowerCase() == "off" || m.content.toLowerCase() == "channel" || m.content.toLowerCase() == "repeat" || m.content.toLowerCase() == "webhook"]
        const collector = message.channel.createMessageCollector(filter,{time: 20000})
        collector.on("end", (collected,reason) => {
            console.log(reason)
            if(reason == "time"){
              return message.channel.send(`Timed out after 20 seconds.`)
            }
          })
          collector.on("collect", async m => {
              console.log(`Collected ${m.content}`)
              if(m.content.toLowerCase() == "on"){
                collector.stop(`Answered to on.`)
                await CountingEnabled.deleteMany({guildID: message.guild.id})
                const enable = new CountingEnabled({guildID: message.guild.id, enabled: true})
                
                enable.save()
                message.channel.send(`I have enabled counting for this guild.`)
              }else if(m.content.toLowerCase() == "repeat"){
                collector.stop(`Answered to repeat.`)
                if(message.member.id != "432345618028036097"){
                  return message.reply(`This setting has not been created yet.`);
                }
              
              }else if(m.content.toLowerCase() == "new number"){
                collector.stop(`Answered to new number.`)
                
                  
                 
                   
                message.channel.send(`Please reply with a new number.`)
                const filter2 = m => m.author.id == message.member.id && [m.content.toLowerCase() != "cancel" || m.content.toLowerCase() == "cancel"]
        const collector2 = message.channel.createMessageCollector(filter2,{time: 20000})
        collector2.on("end", async (collected,reason) => {
            console.log(reason)
            if(reason == "time"){
              return message.channel.send(`Timed out after 20 seconds.`)
            }
          })
          let newnum
          collector2.on("collect",async m => {
            console.log(`Collected ${m.content}`)
            if(m.content.toLowerCase() == "cancel"){
              collector2.stop(`Answered to cancel.`)
              message.channel.send(`Cancelled`)
            }else{
              collector2.stop(`Answered to ${m.content}`)
              newnum = m.content
              console.log(newnum)
              if(isNaN(newnum)){
                return message.reply(`This is not a number!`);
              }
              await counting.deleteMany({guild: message.guild.id});
              let countingObject = new counting({guild: message.guild.id, currentnumber: String(newnum), lastuser: "826517160951676958"})
              console.log(countingObject)
              await countingObject.save().then(() => {
                message.reply(`Done!`)
              })
            }
            
          })
         
              
              }else if(m.content.toLowerCase() == "current number"){
                collector.stop(`Answered to current number.`)
                let countingObject = await counting.findOne({guild: message.guild.id});
                console.log(countingObject)
                if(countingObject.currentnumber == null){
                  return message.channel.send(`There is no number I can find.`)
                }
                message.channel.send(`The next number is ${countingObject.currnetnumber}`)
              }else if(m.content.toLowerCase() == "channel"){
                collector.stop(`Answered to channel.`)
                const filter2 = m => m.author.id == message.member.id && [m.mentions.channels.first() || m.content.toLowerCase() == "cancel"]
        const collector2 = message.channel.createMessageCollector(filter,{time: 20000})
        collector2.on("end", async (collected,reason) => {
            console.log(reason)
            if(reason == "time"){
              return message.channel.send(`Timed out after 20 seconds.`)
            }
          })
          message.channel.send(`${message.member}, please tag the channel you want counting to take place in. EX: \#counting`)
          collector2.on("collect", async (m) => {
            console.log(`Collected ${m.content}`)
            if(m.content.toLowerCase() == "cancel"){
              collector2.stop(`Answered to cancel`)
              message.channel.send(`Cancelled`)
            }else if(m.mentions.channels.first()){
              let ishere = await CountingSettings.findOne({guildID: message.guild.id})
              if(ishere == null){
                ishere = new CountingSettings({guildID: message.guild.id})
               await ishere.save()
              }
              collector2.stop(`Tagged a channel`)
              const query = { "guildID": message.guild.id };
              const update = {
                "$set": {
                  "channel": m.mentions.channels.first()
                }
              };
              const options = { returnNewDocument: true };
               ishere = await CountingSettings.findOneAndUpdate(query, update, options)
              console.log(ishere)
              
              message.channel.send(`I have changed the counting channel to ${m.mentions.channels.first()}`)
            }
          })
              }else if(m.content.toLowerCase() == "ruin"){
                collector.stop(`Answered to ruined`)
                let curset = await CountingSettings.findOne({guildID: message.guild.id})
                console.log(curset)
                if(curset == null){
                  curset = new CountingSettings({guildID: message.guild.id, reset: true})
                 curset.save()
                  message.channel.send(`I have enabled the ruin feature.`)
                }else if(curset.reset == false || curset.reset == null){
                 
                  const query = { "guildID": message.guild.id };
              const update = {
                "$set": {
                  "reset": true
                }
              };
              const options = { returnNewDocument: true };
              let newset = await CountingSettings.findOneAndUpdate(query, update, options)
             
                  message.channel.send(`I have enabled the ruin feature.`)
                }else if(curset.reset == true){
                  const query = { "guildID": message.guild.id };
                  const update = {
                    "$set": {
                      "reset": false
                    }
                  };
                  const options = { returnNewDocument: true };
                  let newset = await CountingSettings.findOneAndUpdate(query, update, options)
         
                      message.channel.send(`I have disabled the ruin feature.`)
                }
              }else if(m.content.toLowerCase() == "cancel"){
                collector.stop(`Answered to cancel.`)
                message.channel.send(`Cancelled.`)
              }else if(m.content.toLowerCase() == "off"){
                collector.stop(`Answered to off.`)
                CountingEnabled.deleteMany({guildID: message.guild.id})
                const disable = new CountingEnabled({guildID: message.guild.id, enabled: false})
                disable.save()
                message.channel.send(`I have disabled counting for this guild.`)
              }
          })
    }
}