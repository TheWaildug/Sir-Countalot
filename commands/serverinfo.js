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
        console.log(`server info`)
    const emoji = client.emojis.cache.get("823687592679309362")
    let {name, owner, channels, members, emojis, partnered, premiumTier, premiumSubscriptionCount, region, roles, verified,} = message.guild
     members = await members.fetch()
    let bots  = members.filter(user => user.user.bot).size
    let notbots = members.filter(user => !user.user.bot).size
    console.log(bots)
    console.log(notbots)
  
    const embed = new Discord.MessageEmbed()
    .setDescription(`**Guild Owner** - ${message.guild.owner.user.tag} - ${message.guild.owner.id} \n**User Count** - ${members.size} (${notbots} members and ${bots} bots.) \n**Channels** - ${channels.cache.size} \n**Emojis** - ${emojis.cache.size}\n**Roles** - ${roles.cache.size} (Highest Role: ${roles.highest}) \n**Nitro Boosts** - ${premiumSubscriptionCount} (Nitro Boost Level - ${premiumTier}) \n**Region** - ${region}`)
    .setAuthor(`Information about ${name}.`,message.guild.iconURL())
  
.setColor(embedcolor.color)

message.channel.send(embed)
return;
    }
}