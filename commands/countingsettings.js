const Discord = require("discord.js")
const EmbedColor = require("../embedmongo.js")
const CountingEnabled = require("../countingenabled.js");
const countingenabled = require("../countingenabled.js");
module.exports = {
    name: `counting`,
    description: `Settings for counting.`,
    permissions: `MANAGE_SERVER`,
    async execute(message,args){
        if(!message.member.permissions.has("MANAGE_SERVER")){
            return message.delete();
        }
        let embedcolor = await EmbedColor.findOne({guildID: message.guild.id})
        console.log(embedcolor)
        if(embedcolor == null){
          let embedcolor = new EmbedColor({guildID: message.guild.id, color: `RANDOM`})
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
        .setDescription(`On - Turn on Counting.\nOff - Turn off counting.\nChannel - Change channel in which counting takes place.\nRepeat - Whether users can count without someone else.\nWebhook - Whether a webhook will replace the user's message.\nCancel - Cancel this prompt.`)
        .setColor(embedcolor.color) 
        message.channel.send(`${message.member} Please select one of the following...`,embed)
        const filter = m => m.author.id == message.member.id && [m.content.toLowerCase() == "on" || m.content.toLowerCase()  == "cancel" || m.content.toLowerCase() == "off" || m.content.toLowerCase() == "channel" || m.content.toLowerCase() == "repeat" || m.content.toLowerCase() == "webhook"]
        const collector = message.channel.createMessageCollector(filter,{time: 20000})
        collector.on("end", (collected,reason) => {
            console.log(reason)
            if(reason == "time"){
              return message.channel.send(`Timed out after 20 seconds.`)
            }
          })
          collector.on("collect", m => {
              console.log(`Collected ${m.content}`)
              if(m.content.toLowerCase() == "on"){
                collector.stop(`Answered to on.`)
                CountingEnabled.deleteMany({guildID: message.guild.id})
                const enable = new CountingEnabled({guildID: message.guild.id, enabled: true})
                enable.save()
                message.channel.send(`I have enabled counting for this guild.`)
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