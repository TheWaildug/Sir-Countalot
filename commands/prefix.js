const Discord = require("discord.js")
const prefix = require("../prefix.js")
const prefixModel = require("../prefix.js")
module.exports = {
    name: "prefix",
    description: "Settings for the guild's prefix.",
    permissions: "MANAGE_SERVER",
    async execute(message,args){
      if(!message.member.permissions.has("MANAGE_GUILD")){
        console.log(`${message.member.id} tried to run prefix in the guild ${message.guild.id}.`)
        return message.delete()
      }
        console.log("prefix ",message.guild.id)
        console.log('prefix ',message.member.id)
      const data = await prefixModel.findOne({
          guildID: message.guild.id
      })  
      message.reply(`Do you want to \`reset\`, \`change\` or \`see\` prefix?`)
      const filter = m => m.author.id == message.author.id && [m.content.toLowerCase() == "reset" || m.content.toLowerCase() == "change" || m.content.toLowerCase() == "see"]
      const collector = message.channel.createMessageCollector(filter,{time: 20000});
      collector.on("end", (collected,reason) => {
        console.log(reason)
        if(reason == "time"){
          return message.channel.send(`Timed out after 20 seconds.`)
        }
      })
      
          collector.on("collect", async m => {
        console.log(`Collected ${m.content}`)
        if(m.content.toLowerCase() == "reset"){
          console.log(`${message.member.id} reset the prefix in ${message.guild.id}`)
          collector.stop(`Answered to reset`)
          message.channel.send(`Done!`)
           prefixModel.deleteMany({guildID: message.guild.id}).then(() => {
             console.log(`Done!`)
           })
            const newpre = new prefixModel({guildID: message.guild.id, prefix: "c!"})
            newpre.save()
         
        }else if(m.content.toLowerCase() == "change"){
          collector.stop("Answered to change")
          message.reply(`What do you want the prefix changed to?`)
          const filter2 = m => m.author.id == message.member.id
          const collector2 = message.channel.createMessageCollector(filter2,{time: 20000})
          collector2.on("end", (collected,reason) => {
            console.log(reason)
            if(reason == "time"){
              return message.channel.send(`Timed out after 20 seconds.`)
            }
          })
          collector2.on("collect", async m => {
            console.log(`Collected ${m.content}`)
            collector2.stop(`Answered ${m.content}`)
            message.channel.send(`I'm changing the prefix to \`${m.content}\`.`)
            prefixModel.deleteMany({guildID: message.guild.id}).then(() => {
              console.log(`Done.`)
            })
            let newprefix = new prefixModel({guildID: message.guild.id, prefix: m.content})
            console.log(newprefix)
            newprefix.save()
            console.log(`${message.member.id} changed prefix to ${m.content} in the guild ${message.guild.id}`)
            
          })
        }else if(m.content.toLowerCase() == "see"){
          console.log(`Collected ${m.content}`)
          collector.stop(`Answered to ${m.content}`)
          let pre = await prefixModel.findOne({guildID: message.guild.id})
          console.log(pre)
          return message.channel.send(`Your current prefix is \`${pre.prefix}\`.`)
        }
      })
    }

}
