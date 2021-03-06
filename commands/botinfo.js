const Discord = require("discord.js")
const EmbedColor = require("../embedmongo")
const ms = require("ms")
const jsonfile = require("../package.json")
async function getUsers(client) {
  let guilds = await client.guilds.cache.array();
let membersize = 0
  for (let i = 0; i < guilds.length; i++) {
   await client.guilds.cache.get(guilds[i].id).members.fetch().then(r => {
      r.array().forEach(r => {
        membersize++
      });
    });
  }
  return membersize
}

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
         embedcolor = new EmbedColor({guildID: message.guild.id, color: `RANDOM`})
        embedcolor.save()
      }
        console.log(`bot info`)
        let platform = process.platform;
    if(platform == "linux"){
      platform = "Linux"
    }else if(platform == "win32"){
      platform = "Windows (Running on Visual Studio Code)"
    }
    const emoji = client.emojis.cache.get("810267394999058432")
    const allguilds = client.guilds.cache.size
    const allusers = await getUsers(client)
    console.log(allusers)
    const cacheusers = client.users.cache.size;
    const embed = new Discord.MessageEmbed()
    .setAuthor(`Information about ${client.user.username}.`,client.user.displayAvatarURL())
    .setDescription(`**Bot** - ${client.user.tag} - ${client.user.id}\n**Created with** ${emoji}\n**Operating System** -  ${platform}\n**Guilds** - ${allguilds}\n**Users** -  ${allusers} (${cacheusers} cached.)\n**Sir Countalot Version** - ${jsonfile.version}\n**Node JS Version** - ${process.version}\n**Time since last start** - ${ms(client.uptime,{long: true})}`)
.setColor(embedcolor.color)
message.channel.send(embed)
return;
    }
}