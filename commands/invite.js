const EmbedColor = require("../embedmongo.js")
const Discord = require("discord.js")
module.exports = {
    name: "invite",
    description: "Shows the invite for Sir Countalot.",
    permissions: "None.",
    async execute(message,args){
      let embedcolor = await EmbedColor.findOne({guildID: message.guild.id})
        console.log(embedcolor)
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
        .setTitle(`Click the link to invite Sir Countalot!`)
        .setDescription(`Click [here](https://discord.com/oauth2/authorize?client_id=791760755195904020&scope=bot&permissions=8) to invite the bot with Administrator Permissions\n Click [here](https://discord.com/oauth2/authorize?client_id=791760755195904020&scope=bot&permissions=2080762993) to invite this bot with Required Perms`)
        .setColor(embedcolor.color)
        message.channel.send(embed)
    }
}