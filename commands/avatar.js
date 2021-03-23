const Discord = require("discord.js")
const EmbedColor = require("../embedmongo.js")
module.exports = {
    name: "avatar",
    description: "Shows avatar of mentioned user or yourself.",
    permissions: "None.",
   async execute(message,args,client){
        let mentionmember
        if(message.mentions.members.first()){
            mentionmember = await client.users.fetch(message.mentions.members.first().toString().replace("<@","").replace(">","").replace("!","")).catch(error => {
                console.log(`${message.guild.id}-Avatar Error ${error}`)
            })
        }else if(!message.mentions.members.first()){
            mentionmember = await client.users.fetch(args[0]).catch(error => {
                console.log(`${message.guild.id}-Avatar Error ${error}`)
            })
        }
        console.log(args[0])
        console.log(mentionmember)
        if(!mentionmember){
            mentionmember = message.author
        }
        console.log(mentionmember.id)
        const image = mentionmember.avatarURL({format: "jpg", dynamic: true, size: 512}) || mentionmember.defaultAvatarURL
    console.log(image)
    let perms = message.guild.me.permissionsIn(message.channel).toArray()
  
    if(!perms.includes("EMBED_LINKS")){
      return message.channel.send(`I cannot send embeds in this channel. Please make sure I have the \`EMBED_LINKS\` permission.`).catch(error => {
        console.log(`Guild ${message.guild.id} Error ${error}`)
      })
    }
    let embedcolor = await EmbedColor.findOne({guildID: message.guild.id})
        
    if(embedcolor == null){
      let embedcolor = new EmbedColor({guildID: message.guild.id, color: `RANDOM`})
      embedcolor.save()
    }
    let embed = new Discord.MessageEmbed()
      .setTitle(mentionmember.tag + "'s Profile Picture")
    .setColor(embedcolor.color)
      .setImage(image);
    message.channel.send(embed);
    }
}