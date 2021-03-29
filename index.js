const Discord = require("discord.js")
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"]})
const prefixModel = require('./prefix.js')
const fs = require("fs")
const EmbedColor = require("./embedmongo")
const ms = require("ms")
const DevMongo = require("./devlist")
const express = require("express")
const CountingSetting = require("./countingsettings")
const ServerBlacklist = require("./serverbl")

const CountingEnabled = require("./countingenabled")
const mongoose = require("mongoose")
const CommandBlacklist = require("./commandbl")
const { count } = require("./prefix.js")
require("dotenv").config()
mongoose.connect(process.env.mongourl,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
});
client.Commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.Commands.set(command.name, command);
}
client.on("guildCreate", async guild => {
  console.log(`New guild ${guild.id}, ${guild.name}`)
        let channels = guild.channels.cache.filter(channel => channel.type == "text")
        let channel = channels.first()
    
        console.log(channel)
        channel.send(`Thanks for inviting Sir Countalot! I am undergoing a rennovation so I will not respond in this server. If you want to get updated with my development, please follow this channel in my support server. https://discord.gg/wkegcJeenz`).catch(error => {
            console.log(`Guild-${guild.id} Error ${error}`)
        })
 
})
client.on("ready", async () => {
    console.log("Sir Countalot is ready!")

        client.user.setPresence({ activity: { name: "people count.", type: `WATCHING` }, status: 'dnd' })

})
 async function isdev(id){
    const dev = await DevMongo.findOne({memberID: id})

    if(dev == null){
        return false
    }else if(dev != null){
        return true
    }
}
client.on("error", (error) => { console.log(error); client.login(process.env.token) });
let roles = ["792942766979022858","792102531408986142","793940805207326820"]
async function isbypass(user){
    let con = false
    roles.forEach(role => {
        if(con == true){
            return;
        }
        if(user.roles.cache.has(role)){
            con = true
            return true;
        }
    })
    return false;
}
///Counting
client.on("message",async message => {
    if(message.author.bot){
        return;
    }
    if(message.channel.type == "dm"){
        return;
    }
    if(message.guild.id != "791760625243652127" && message.member.id != "432345618028036097"){
        return;
    }
    let countingenabled = CountingEnabled.findOne({guildID: message.guild.id})
    if(!countingenabled || countingenabled.enabled == false){
        return;
    }
    const serverbl = await ServerBlacklist.findOne({guildID: message.guild.id})
    if(serverbl != null){
        return console.log(`This guild is blacklisted. SMH`)
    }
    const countingon = await CountingEnabled.findOne({guildID: message.guild.id})
   
    if(countingon == null || countingon.enabled == false){
        return;
    }
    const countingsettings = await CountingSetting.findOne({guildID: message.guild.id})
    if(countingsettings == null || countingsettings.channel == null){
        return;
    }
    let countingchannel = message.guild.channels.cache.get(countingsettings.channel)
    console.log(countingchannel.name)
    if(message.channel != countingchannel){
        return;
    }
    let countingFile = fs.readFileSync("counting.json")
    let countingObject = JSON.parse(countingFile)
    if(countingObject.hasOwnProperty(message.guild.id)){
        let guildObject = countingObject[message.guild.id]
        let curnum = guildObject["currentnumber"]
        let lastuser = guildObject["lastcounter"]
        console.log(curnum)
        console.log(lastuser)
        let guildlast = await message.guild.members.fetch(lastuser)
        if(message.content != curnum){
            if(countingsettings.reset == true){
                countingObject[message.guild.id]
                ["currentnumber"] = 1;
                countingObject[message.guild.id]
                ["lastcounter"] = message.member.id;
                await fs.writeFileSync("counting.json", JSON.stringify(countingObject))
            }
        }else if(message.content == curnum){
            console.log(`${message.member.id} counted correctly`)
            countingObject[message.guild.id]
                ["currentnumber"] = Number(curnum) + 1;
                countingObject[message.guild.id]
                ["lastcounter"] = message.member.id;
                await fs.writeFileSync("counting.json", JSON.stringify(countingObject))
   
        }
    }
})
client.on("message", async message => {   
    if(message.author.bot) return;

    if(message.channel.type == "dm") return;
    if(message.guild.id != "791760625243652127" && message.guild.id != "806897037777174570" && message.member.id != "432345618028036097"){
        return;
    }
    
    const data = await prefixModel.findOne({
        guildID: message.guild.id
    })
   
    let prefix
    if(data){
        prefix = data.prefix
    }else if(!data){
        prefix = "c!"
        let preee = new prefixModel({guildID: message.guild.id, prefix: `c!`})
    preee.save()
    }
    if(message.mentions.members.has("791760755195904020")){
        return message.channel.send(`Your current prefix is \`${prefix}\`.`)
    }
    if(!message.content.startsWith(prefix)) return;
    const serverbl = await ServerBlacklist.findOne({guildID: message.guild.id})
    if(serverbl != null){
        return console.log(`This guild is blacklisted. SMH`)
    }
    const commandbl = await CommandBlacklist.findOne({memberID: message.member.id})
        
        if(commandbl != null){
            return console.log(`${message.member.id} is blacklisted. SMH`);
        }
    const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();
    if(command == "prefix"){
     client.Commands.get("prefix").execute(message,args)
    }else if(command == "avatar"){
        client.Commands.get("avatar").execute(message,args,client)
    }else if(command == "lock"){
        if(message.guild.id != "791760625243652127"){
            return;
        }
        let canrun = await isbypass(message.member)
        console.log(canrun)
        if(canrun == false){
            return message.delete();
        }

    }else if(command == "counting"){
        client.Commands.get("counting").execute(message,args)
    }else if(command == "ping"){    
        client.Commands.get('ping').execute(message,args,client)
    }else if(command == "dothefunny"){
        client.Commands.get("dothefunny").execute(message,args)
    }else if(command == "serverinfo"){
        client.Commands.get("serverinfo").execute(message,args,client)
    }else if(command == "eval"){
       let dev = await isdev(message.member.id)
       console.log(dev)
       if(dev == false){
           return message.delete();
       }
        let code = message.content.split(" ").slice(1).join(" ")
     console.log(`Eval ${code}`)
    
        console.log(`Evaluate ${message.author.id}`)
        if(code == ""){
            return message.channel.send(`I need some code dude.`)
        }
        let evaluated
         
      try {
        evaluated = await eval(`(async () => {  ${code}})()`);
        console.log(evaluated)
        const evaltype = typeof evaluated;
        const embed = new Discord.MessageEmbed()
              .setTitle(`Evaluation`)
              .setColor("RANDOM")
              .setDescription(`Evaluated in *${Date.now() - message.createdTimestamp + " ms"}.*`)
              .addField(`Input`,"```js\n" + code + "```")
              .addField(`Output`,"```\n" + evaluated + "```")
              .addField("Output Type", "`" + evaltype.toUpperCase() + "`")
              .setTimestamp()
               message.channel.send(`<@${message.author.id}>`,embed)
              
      } catch (e) {
        console.log(e)
            const embed = new Discord.MessageEmbed()
            .setTitle(`Evaluation`)
                .setColor("RANDOM")
            .setDescription(`Error`)
            .addField(`Input`,"```js\n" + code + "```")
            .addField(`Error`,"```" + e + "```")
            .setTimestamp()
             message.channel.send(`<@${message.author.id}>`,embed)
      }
  
          
    }else if(command == "trello"){
        let perms = message.guild.me.permissionsIn(message.channel).toArray()
        
        if(!perms.includes("EMBED_LINKS")){
          return message.channel.send(`I cannot send links in this channel. Please make sure I have the \`EMBED_LINKS\` permission.`).catch(error => {
            console.log(`Guild ${message.guild.id} Error ${error}`)
          })
        }
        message.channel.send("Here is the Trello for SirCountalot. Any suggestions will show up here. https://trello.com/b/BhHm03dC/sir-countalot-development")
        
    }else if(command == "rickrollme"){
        let perms = message.guild.me.permissionsIn(message.channel).toArray()
        
        if(!perms.includes("EMBED_LINKS")){
          return message.channel.send(`I cannot send links in this channel. Please make sure I have the \`EMBED_LINKS\` permission.`).catch(error => {
            console.log(`Guild ${message.guild.id} Error ${error}`)
          })
        }
        message.channel.send("https://www.youtube.com/watch?v=9dfMCVa-4Es")
    }else if(command == "sblacklist"){
        if(message.guild.id != "791760625243652127"){
            return message.reply(`This command can only be used in Frog Development Studios.`);
        }
        let dev = await isdev(message.member.id)
       console.log(dev)
       if(dev == false){
           return message.delete();
       }
        let guild
       guild = await client.guilds.fetch(args[0]).catch(error => {
           console.log(`ok ${error}`)
       })
        

        if(!guild || guild.size > 1){
           return message.channel.send(`This is not a guild!`)
        }
       
       
        if(guild.id == "791760625243652127" || guild.id == "806897037777174570"){
            return message.reply(`This is a whitelisted guild!`)
        }
        const isblacklisted = await ServerBlacklist.findOne({guildID: guild.id})
        console.log(isblacklisted)
        if(isblacklisted == null){
            console.log(`Guild is not blacklisted. Blacklisting...`)
            let blacklist = new ServerBlacklist({guildID: guild.id})
            console.log(blacklist)
            blacklist.save()
            
            message.channel.send(`I have blacklisted \`${guild.name}\` from using my commands with the id \`${blacklist.id}\`.`)
            return;
        }else if(isblacklisted != null){
            console.log(`Guild is blacklisted. Removing...`)
            await ServerBlacklist.deleteMany({guildID: guild.id})
            return message.channel.send(`I have unblacklisted \`${guild.id}\` from using my commands.`)
        }
    }else if(command == "blacklist"){
        if(message.guild.id != "791760625243652127"){
            return message.reply(`This command can only be used in Frog Development Studios.`);
        }
        let dev = await isdev(message.member.id)
       console.log(dev)
       if(dev == false){
           return message.delete();
       }
        let mentionmember
       
        if(message.mentions.members.first()){
            mentionmember = await client.users.fetch(message.mentions.members.first().toString().replace("<@","").replace(">","").replace("!","")).catch(error => {
                console.log(`${message.guild.id}-Blacklist Error ${error}`)
            })
        }else if(!message.mentions.members.first()){
            mentionmember = await client.users.fetch(args[0]).catch(error => {
                console.log(`${message.guild.id}-Blacklist Error ${error}`)
            })
        }

        if(!mentionmember || mentionmember.size > 1){
           return message.channel.send(`This is not a user!`)
        }
        if(mentionmember.bot){
            return message.reply(`You cannot un/blacklist a bot.`);
        }
        if(mentionmember.id == message.member.id){
            return message.reply(`You cannot blacklist youreslf idiot!`)
        }
        let userdev = await isdev(mentionmember.id)
        console.log(userdev)
        if(userdev == true){
            return message.reply(`You cannot blacklist a fellow developer!`)
        }
        const isblacklisted = await CommandBlacklist.findOne({memberID: mentionmember.id})
        console.log(isblacklisted)
        if(isblacklisted == null){
            console.log(`User is not blacklisted. Blacklisting...`)
            let blacklist = new CommandBlacklist({memberID: mentionmember.id})
            console.log(blacklist)
            blacklist.save()
            mentionmember.send(`You have been blacklisted from using my commands. If you think this is a mistake, please appeal in my support server. https://discord.gg/AsQQf374`).catch(error => {
                console.log(`Cannot DM user.`)
            })
            message.channel.send(`I have blacklisted ${mentionmember} from using my commands with the id \`${blacklist.id}\`.`)
            return;
        }else if(isblacklisted != null){
            console.log(`User is blacklisted. Removing...`)
            await CommandBlacklist.deleteMany({memberID: mentionmember.id})
            return message.channel.send(`I have unblacklisted ${mentionmember} from using my commands.`)
        }
    }else if(command == "botinfo"){
        client.Commands.get("botinfo").execute(message,args,client)
    }else if(command == "adddev"){
        if(message.member.id != "432345618028036097"){
            return message.delete();
        }
        let mentionmember
        console.log(message.mentions.members.first())
        if(message.mentions.members.first()){
            mentionmember = await client.users.fetch(message.mentions.members.first().toString().replace("<@","").replace(">","").replace("!","")).catch(error => {
                console.log(`${message.guild.id}-AddDev Error ${error}`)
            })
        }else if(!message.mentions.members.first()){
            mentionmember = await client.users.fetch(args[0]).catch(error => {
                console.log(`${message.guild.id}-AddDev Error ${error}`)
            })
        }
    
        if(!mentionmember || mentionmember.size > 1){
            return message.reply(`This isn't a user!`)
        }
        if(mentionmember.bot){
            return message.reply(`You cannot give a bot developer idiot.`)
        }
        let rank = null
        if(!args[0].startsWith("<@")){
            if(isNaN(args[0])){
                args[1] = args[0]
            }
         
        }
        console.log(args[1])
        if(args[1] == "1"){
            rank = "Developer"
        }else if(args[1] == "2"){
            rank = "Head Dev"
        }else if(args[1] == "0"){
            rank = "None"
        }
        if(rank == null){
            message.reply(`0 - Reset, 1 - Developer, 2 - Head Dev`)
            const filter = m => m.author.id == message.author.id && [m.content.toLowerCase() == "0" || m.content.toLowerCase() == "1" || m.content.toLowerCase() == "2"]
            const collector = message.channel.createMessageCollector(filter,{time: 20000});
      collector.on("end", (collected,reason) => {
        console.log(reason)
        if(reason == "time"){
          return message.channel.send(`Timed out after 20 seconds.`)
        }
    }) 
        collector.on("collect", m => {
            if(m.content.toLowerCase() == "0"){
                rank = "None"
            }else if(m.content.toLowerCase() == "1"){
                rank = "Developer"
            }else if(m.content.toLowerCase() == "2"){
                rank = "Head Dev"
            }
      })
    }
        console.log(rank)
        if(rank == "None"){
            await DevMongo.deleteMany({memberID: mentionmember.id})
            message.reply(`I have attempted to reset this user's rank.`)
            return;
        }else if(rank != "None"){
            DevMongo.deleteMany({memberID: mentionmember.id})
            const rankmongo = new DevMongo({memberID: mentionmember.id, rank: rank})
            rankmongo.save()
            message.reply(`I have attempted to give ${mentionmember} the rank ${rank}. Check the database under the id \`${rankmongo.id}\``)
            return;
        }
      
          }else if(command == "invite"){
        client.Commands.get("invite").execute(message,args)
    }else if(command == "commands"){
        client.Commands.get("commands").execute(message,args,client.Commands,prefix)
    }
})
client.login(process.env.token)
const server = express()
server.listen("/", () => {
    console.log(`Server is ready!`)
})