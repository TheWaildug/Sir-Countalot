const Discord = require("discord.js")
const EmbedColor = require("../embedmongo")
const ms = require("ms")
module.exports = {
    name: "botinfo",
    description: "Shows information about Sir Countalot",
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
    const emoji = client.emojis.cache.get("810267394999058432")
    const owner = await client.users.fetch("432345618028036097")
    const embed = new Discord.MessageEmbed()
    
    .setAuthor(`Information about ${client.user.username}.`,client.user.displayAvatarURL())
    .setDescription(`**Bot** - ${client.user.tag} - ${client.user.id}\n**Created with** ${emoji}\n**Node JS Version** - ${process.version}\n**Time since last start** - ${ms(client.uptime,{long: true})}`)
.setColor(embedcolor.color)
message.channel.send(embed)
return;
    }
}