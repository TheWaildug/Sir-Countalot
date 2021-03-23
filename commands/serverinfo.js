const Discord = require("discord.js")
const EmbedColor = require("../embedmongo")
const ms = require("ms")
module.exports = {
    name: "serverinfo",
    description: "Shows information about current guild.",
    permissions: "None",
   async execute(message,args,client){
        let perms = message.guild.me.permissionsIn(message.channel).toArray()
        if(!perms.includes("EMBED_LINKS")){
          return message.channel.send(`I cannot send embeds in this channel. Please make sure I have the \`EMBED_LINKS\` permission.`).catch(error => {
            console.log(`Guild ${message.guild.id} Error ${error}`)
          })
        }
        if(!perms.includes("USE_EXTERNAL_EMOJIS")){
            return message.channel.send(`I cannot send external emojis in this channel. Please make sure I have the \`USE_EXTERNAL_EMOJIS\` permission.`).catch(error => {
                console.log(`Guild ${message.guild.id} Error ${error}`)
              })
        }
        let embedcolor = await EmbedColor.findOne({guildID: message.guild.id})
        
        if(embedcolor == null){
          let embedcolor = new EmbedColor({guildID: message.guild.id, color: `RANDOM`})
          embedcolor.save()
        }
        console.log(`bot info`)
    const emoji = client.emojis.cache.get("823687592679309362")
    const embed = new Discord.MessageEmbed()
    const {name,owner,members,partnered,premiumTier,premiumSubscriptionCount,region,roles,verified,} = message.guild

    .setAuthor(`Information about ${name}.`,message.guild.iconURL())
    .addField(`Guild Owner`,owner.user.tag)
    .addField(`User Count`,members.cache.size)
    .addField(``)
.setColor(embedcolor.color)

message.channel.send(embed)
return;
    }
}