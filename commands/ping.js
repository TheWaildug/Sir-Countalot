const Discord = require("discord.js")
const EmbedColor = require("../embedmongo.js")

module.exports = {
    name: 'ping',
    description: 'Shows current ping of bot.',
    permissions: `None.`,
   async execute(message,args,client){
        console.log('ping ',message.guild.id)
        console.log('ping ',message.member.id)
        let perms = message.guild.me.permissionsIn(message.channel).toArray()
        if(!perms.includes("EMBED_LINKS")){
          return message.channel.send(`I cannot send embeds in this channel. Please make sure I have the \`EMBED_LINKS\` permission.`).catch(error => {
            console.log(`Guild ${message.guild.id} Error ${error}`)
          })
        }
        let yourping = Date.now() - message.createdTimestamp
        let botping = Math.round(client.ws.ping)
        let embedcolor = await EmbedColor.findOne({guildID: message.guild.id})
        
        if(embedcolor == null){
          embedcolor = new EmbedColor({guildID: message.guild.id, color: `RANDOM`})
          embedcolor.save()
        }
        console.log(embedcolor)
        const embed = new Discord.MessageEmbed()
        .setTitle(`Pong!`)
        .setDescription(`Message Ping: ${yourping}\nAPI Ping: ${botping}`)
        .setColor(embedcolor.color)
        message.channel.send(embed)
    }
}
