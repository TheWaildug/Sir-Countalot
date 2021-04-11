const Discord = require("discord.js")
const EmbedColor = require("../embedmongo.js")
module.exports = {
    name: "commands",
    description: "Shows all commands for Sir Countalot.",
    permissions: "None.",
    async execute(message,args,commandclient,prefix){
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
        .setTitle(`All commands for Sir Countalot`)
        .setColor(embedcolor.color)
        commandclient.forEach(command => {
            embed.addField(`${prefix}${command.name}`,`${command.description}\nPermissions: ${command.permissions}`)
        })
        message.channel.send(embed)
    }
}