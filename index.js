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
const fetch = require('node-fetch');

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
        channels = channels.filter(channel => guild.me.permissionsIn(channel).has("SEND_MESSAGES"))
        let channel = channels.first()
    
        console.log(channel)
        channel.send(`Thanks for inviting Sir Countalot! I am undergoing a rennovation so I will not respond in this server. If you want to get updated with my development, please follow this channel in my support server. https://discord.gg/wkegcJeenz`).catch(error => {
            console.log(`Guild-${guild.id} Error ${error}`)
        })
 
})
client.on("ready", async () => {
    console.log("Sir Countalot is ready!")
if(client.user.id == "809088738033401866"){
    client.user.setPresence({ activity: { name: "new features.", type: `WATCHING` }, status: 'dnd' })

}else{
    client.user.setPresence({ activity: { name: "people count.", type: `WATCHING` }, status: 'dnd' })

}
       
})

 async function isdev(id){
    const dev = await DevMongo.findOne({memberID: id})
console.log(dev)
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
async function Count(countingObject,message,countingsettings){
   
    let guildObject = countingObject[message.guild.id]
     
    let curnum = guildObject["currentnumber"]
    let lastuser = guildObject["lastcounter"]
    let cooldown = guildObject["cooldown"]
    console.log(cooldown)
    if(cooldown == null){
        cooldown = Date.now()
    }else{
        if(Date.now() < cooldown){
             message.channel.send(`Slow down! You're counting waaaay to fast.`)
             return message.delete();
        }
    }
    if(curnum == null){
        curnum = 1
    }
    if(lastuser == null){
        lastuser = 791760755195904020
    }
  
    let guildlast = await message.guild.members.fetch(lastuser).catch(e => {
        console.log(`Invalid User ${e}`)
    })
    console.log(curnum)
    console.log(lastuser)
    if(message.content != curnum){
        
        console.log(`${message.member.id} counted incorrectly in ${message.guild.id}`)
        if(message.member.id != "432345618028036097"){
            if(countingsettings.reset == true){
                console.log(`${message.member.id} caused ${message.guild.id} to reset it's count.`)
                message.channel.send(`${message.member} has counted incorrectly! The count is now \`1\``)
                countingObject[message.guild.id]
                ["currentnumber"] = 1;
                countingObject[message.guild.id]
                ["cooldown"] = Date.now() + ms(".5 seconds");
                countingObject[message.guild.id]
                ["lastcounter"] = message.member.id;
                await fs.writeFileSync("counting.json", JSON.stringify(countingObject))
            }
            message.delete()
        }
        
    }else if(message.content == curnum){
        console.log(`${message.member.id} counted correctly in ${message.guild.id}`)
        countingObject[message.guild.id]
        ["currentnumber"] = Number(curnum) + 1;
        countingObject[message.guild.id]
        ["cooldown"] = Date.now() + ms(".5 seconds");
        countingObject[message.guild.id]
        ["lastcounter"] = message.member.id;
           
            await fs.writeFileSync("counting.json", JSON.stringify(countingObject))

    }
}
client.on("message",async message => {
    if(message.author.bot){
        return;
    }
    if(message.channel.type == "dm"){
        return;
    }
    if(message.guild.id != "791760625243652127" && message.guild.id != "813837609473933312" && message.member.id != "432345618028036097"){
        return;
    }
    if(client.user.id == "809088738033401866"){
        if(message.guild.id != "791760625243652127" && message.member.id != "432345618028036097"){
            return;
        }
    }
    let countingenabled = await CountingEnabled.findOne({guildID: message.guild.id})

    if(!countingenabled || countingenabled.enabled == false){
        return;
    }
    const serverbl = await ServerBlacklist.findOne({guildID: message.guild.id, blacklisted: true})
   
    if(serverbl != null){
        return console.log(`This guild is blacklisted. SMH`)
    }
       const countingsettings = await CountingSetting.findOne({guildID: message.guild.id})
    if(countingsettings == null || countingsettings.channel == null){
        return;
    }
    let countingchannel = message.guild.channels.cache.get(countingsettings.channel)
    
    if(message.channel.id != countingchannel.id){
       
        return;
    }
    let perms = await message.guild.me.permissionsIn(message.channel)
    
    if(!perms.has(`MANAGE_MESSAGES`)){
        console.log(`smh ${message.guild.id} doesn't have manage messages perms`)
        return;
    }
    if(!perms.has(`MANAGE_WEBHOOKS`) && countingsettings.webhook == true){
        console.log(`smh ${message.guild.id} doesn't have manage webhooks perms`)
   
        return;
    }
    if(!perms.has("SEND_MESSAGES")){
        console.log(`smh ${message.guild.id} doesn't have send_messages perms.`)
        return;
    }
    let countingFile = fs.readFileSync("counting.json")
    let countingObject = JSON.parse(countingFile)
if(!countingObject.hasOwnProperty(message.guild.id)){
    countingObject[message.guild.id] = {}
    let guildObject = {}
    guildObject.currentnumber = "1"
    guildObject.lastcounter = "791760755195904020"
    countingObject[message.guild.id] = guildObject

        await fs.writeFileSync(`counting.json`, JSON.stringify(countingObject))
}
    Count(countingObject,message,countingsettings)
})
client.on("message", async message => {   
    if(message.author.bot) return;

    if(message.channel.type == "dm") return;
    if(message.guild.id != "791760625243652127" && message.guild.id != "813837609473933312" && message.member.id != "432345618028036097"){
        return;
    }
    if(client.user.id == "809088738033401866"){
        if(message.guild.id != "791760625243652127" && message.member.id != "432345618028036097"){
            return;
        }
    }
    const data = await prefixModel.findOne({
        guildID: message.guild.id
    })
   
    let prefix
    if(client.user.id != "809088738033401866"){
        if(data){
            prefix = data.prefix
        }else if(!data){
            prefix = "c!"
            let preee = new prefixModel({guildID: message.guild.id, prefix: `c!`})
        preee.save()
        }
    }else{
        if(data){
            prefix = data.prefix
        }else if(!data){
            prefix = "c+"
            let preee = new prefixModel({guildID: message.guild.id, prefix: `c+`})
        preee.save()
        }
    }
   
    if(message.mentions.members.has("791760755195904020") && client.user.id == "791760755195904020"){
        return message.channel.send(`Your current prefix is \`${prefix}\`.`)
    }
    if(!message.content.startsWith(prefix)) return;
    const serverbl = await ServerBlacklist.findOne({guildID: message.guild.id})
    if(serverbl != null){
        return console.log(`This guild is blacklisted. SMH`)
    }
    const commandbl = await CommandBlacklist.findOne({memberID: message.member.id,blacklisted: true})
        
        if(commandbl != null){
            return console.log(`${message.member.id} is blacklisted. SMH`);
        }
    const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();
    if(command == "prefix"){
     client.Commands.get("prefix").execute(message,args)
    }else if(command == "avatar"){
        client.Commands.get("avatar").execute(message,args,client)
    }else if(command == "slowmode"){
        if(message.member.id != "432345618028036097"){
            return message.delete();
        }
        let sm 
        if(args[0].includes("+")){
            sm = message.channel.rateLimitPerUser + Number(args[0].replace("+",""));
        }else if(args[0].includes("-")){
            sm = message.channel.rateLimitPerUser  - Number(args[0].replace("-",""));
        }else{
            sm = args[0]
        }
        console.log(sm)
if(isNaN(sm)){
    return message.channel.send(`dum dum this isn't a number.`)
}
message.channel.setRateLimitPerUser(sm).then(() => {return message.channel.send(`Changed slowmode to \`${sm}\` seconds.`)}).catch(e => {return message.channel.send(`dude something went wrong: \`${e}\``)})
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
            let embed2 = new Discord.MessageEmbed()
            .setTitle(`Evaluation from ${message.author.tag} - ${message.member.id}`)
              .setColor("RANDOM")
              .setDescription(`Evaluated in *${Date.now() - message.createdTimestamp + " ms"}.*`)
              .addField(`Input`,"```js\n" + code + "```")
              .addField(`Output`,"```\n" + evaluated + "```")
              .addField("Output Type", "`" + evaltype.toUpperCase() + "`")
              .setTimestamp()
          let guild = await client.guilds.fetch("791760625243652127");
          let channel = await guild.channels.cache.get("828415374953021440")    
          channel.send(embed2)
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
             const embed2 = new Discord.MessageEmbed()
             .setTitle(`Evaluation from ${message.author.tag} - ${message.member.id}`)
               .setColor("RANDOM")
            .setDescription(`Error`)
            .addField(`Input`,"```js\n" + code + "```")
            .addField(`Error`,"```" + e + "```")
            .setTimestamp()
             let guild = await client.guilds.fetch("791760625243652127");
             let channel = await guild.channels.cache.get("828415374953021440")    
             channel.send(embed2)
      }
  
          
    }else if(command == "suggest"){
        client.Commands.get("suggest").execute(message,args)
    }else if(command == "trello"){
        let perms = message.guild.me.permissionsIn(message.channel).toArray()
        
        if(!perms.includes("EMBED_LINKS")){
          return message.channel.send(`I cannot send links in this channel. Please make sure I have the \`EMBED_LINKS\` permission.`).catch(error => {
            console.log(`Guild ${message.guild.id} Error ${error}`)
          })
        }
        message.channel.send("Here is the Trello for SirCountalot. Any suggestions will show up here. https://trello.com/b/BhHm03dC/sir-countalot-development")
        
    }else if(command == "createemoji"){
        if(message.member.id != "432345618028036097"){
            return message.reply(`Hey good you found a secret command now go do something with your life.`)
        }
        const imageurl = args[0]
        if(!imageurl){
          return message.reply(`I need an image url for the emoji.`);
        }
        const name = args[1]
        if(!name){
          return message.reply(`I need a name for the emoji!`);
        }
        message.guild.emojis.create(imageurl,name,{reason: `Created by ${message.author.tag}.`}).then(emoji => {
          message.channel.send(`I made the emoji **${emoji}** with the id of **${emoji.id}**.`,)
        }).catch(error => message.reply("Something went wrong! Error: `"  + error + "`"))
    }else if(command == "rickrollme"){
        let perms = message.guild.me.permissionsIn(message.channel).toArray()
        
        if(!perms.includes("EMBED_LINKS")){
          return message.channel.send(`I cannot send links in this channel. Please make sure I have the \`EMBED_LINKS\` permission.`).catch(error => {
            console.log(`Guild ${message.guild.id} Error ${error}`)
          })
        }
        message.channel.send("https://www.youtube.com/watch?v=9dfMCVa-4Es")
    }else if(command == "sblacklist"){
        let blacklistman = await DevMongo.findOne({memberID: message.member.id})
        console.log(blacklistman)
        if(blacklistman == null){
            return message.delete();
        }
        if(blacklistman.rank != "Blacklist Manager" && blacklistman.rank != "Head Dev"){
            return message.delete();
        }
        if(message.guild.id != "791760625243652127"){
            return message.reply(`This command can only be used in Frog Development Studios.`);
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
        let blacklistman = await DevMongo.findOne({memberID: message.member.id})
        console.log(blacklistman)
        if(blacklistman == null){
            return message.delete();
        }
        if(blacklistman.rank != "Blacklist Manager" && blacklistman.rank != "Head Dev"){
            return message.delete();
        }
        if(message.guild.id != "791760625243652127"){
            return message.reply(`This command can only be used in Frog Development Studios.`);
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
           let reason = message.content.split(" ").splice(2).join(" ")
           console.log(reason)
            
              if(!reason){
                  return message.reply(`I need a reason for this user.`)
              }
              let blacklist = new CommandBlacklist({memberID: mentionmember.id, reason: reason, blacklisted: true})
              blacklist.save()
            mentionmember.send(`You have been blacklisted from using my commands with the reason **${reason}** If you think this is a mistake, please appeal via this link: https://discord.gg/qyHnGP5yMP`).catch(error => {
                console.log(`Cannot DM user.`)
            })
            message.channel.send(`I have blacklisted ${mentionmember} from using my commands with the id \`${blacklist.id}\`.`)
            return;
            
            
            
        }else if(isblacklisted.blacklisted == false){
            let reason = message.content.split(" ").splice(2).join(" ")
if(!reason){
    return message.reply(`I need a reason for this user.`)
}
            console.log(`User is not blacklisted. Blacklisting...`)
            const query = { "memberID": mentionmember.id };
              const update = {
                "$set": {
                  "reason": reason,
                  "blacklisted": true
                }
              };
              const options = { returnNewDocument: true };
              let newset = await CommandBlacklist.findOneAndUpdate(query, update, options)
              console.log(newset)
              mentionmember.send(`You have been blacklisted from using my commands with the reason **${reason}** If you think this is a mistake, please appeal via this link: https://discord.gg/qyHnGP5yMP`).catch(error => {
                console.log(`Cannot DM user.`)
            })
            message.channel.send(`I have blacklisted ${mentionmember} from using my commands with the id \`${newset.id}\`.`)
            return;
        }else if(isblacklisted.blacklisted == true){
let reason = message.content.split(" ").splice(2).join(" ")
if(!reason){
    return message.reply(`I need a reason for this user.`)
}
            console.log(`User is blacklisted. Removing...`)
            const query = { "memberID": mentionmember.id };
              const update = {
                "$set": {
                  "reason": reason,
                  "blacklisted": false
                }
              };
              const options = { returnNewDocument: true };
              let newset = await CommandBlacklist.findOneAndUpdate(query, update, options)
              console.log(newset)
              mentionmember.send(`You have been unblacklisted from using my commands with the reason **${reason}**`)
            return message.channel.send(`I have unblacklisted ${mentionmember} from using my commands with the id \`${newset.id}\``)
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
        
        console.log(args[1])
        if(args[1] == "1"){
            rank = "Developer"
        }else if(args[1] == "2"){
            rank = "Head Dev"
        }else if(args[1] == "0"){
            rank = "None"
        }else if(args[1] == "3"){
            rank = "Blacklist Manager"
        }
        if(rank == null){
            message.reply(`0 - Reset, 1 - Developer, 2 - Head Dev, 3 - Blacklist Manager`)
            const filter = m => m.author.id == message.author.id && [m.content.toLowerCase() == "3" || m.content.toLowerCase() == "0" || m.content.toLowerCase() == "1" || m.content.toLowerCase() == "2"]
            const collector = message.channel.createMessageCollector(filter,{time: 20000});
      collector.on("end", (collected,reason) => {
        console.log(reason)
        if(reason == "time"){
          return message.channel.send(`Timed out after 20 seconds.`)
        }
    }) 
        collector.on("collect",async  m => {
            if(m.content.toLowerCase() == "0"){
                rank = "None"
               
                    await DevMongo.deleteMany({memberID: mentionmember.id})
                    message.reply(`I have attempted to reset this user's rank.`)
                    return;
               
            }else if(m.content.toLowerCase() == "1"){
                rank = "Developer"
               
                   await DevMongo.deleteMany({memberID: mentionmember.id})
                    const rankmongo = new DevMongo({memberID: mentionmember.id, rank: rank})
                    rankmongo.save()
                    message.reply(`I have attempted to give ${mentionmember} the rank ${rank}. Check the database under the id \`${rankmongo.id}\``)
                    return;
                
            }else if(m.content.toLowerCase() == "2"){
                rank = "Head Dev"
                await DevMongo.deleteMany({memberID: mentionmember.id})
                const rankmongo = new DevMongo({memberID: mentionmember.id, rank: rank})
                rankmongo.save()
                message.reply(`I have attempted to give ${mentionmember} the rank ${rank}. Check the database under the id \`${rankmongo.id}\``)
                return;
            
            }else if(m.content.toLowerCase() == "3"){
                rank = "Blacklist Manager"
                await DevMongo.deleteMany({memberID: mentionmember.id})
                const rankmongo = new DevMongo({memberID: mentionmember.id, rank: rank})
                rankmongo.save()
                message.reply(`I have attempted to give ${mentionmember} the rank ${rank}. Check the database under the id \`${rankmongo.id}\``)
                return;
            
            }
      })
    }else if(rank != null){
        if(rank == "None"){
            await DevMongo.deleteMany({memberID: mentionmember.id})
                    message.reply(`I have attempted to reset this user's rank.`)
                    return;
        }else if(rank != "None"){
            await DevMongo.deleteMany({memberID: mentionmember.id})
                const rankmongo = new DevMongo({memberID: mentionmember.id, rank: rank})
                rankmongo.save()
                message.reply(`I have attempted to give ${mentionmember} the rank ${rank}. Check the database under the id \`${rankmongo.id}\``)
                return;
        }   }
        console.log(rank)
    
        
      
          }else if(command == "invite"){
        client.Commands.get("invite").execute(message,args)
    }else if(command == "commands"){
        client.Commands.get("commands").execute(message,args,client.Commands,prefix)
    }
})
client.login(process.env.token)
const server = express()
server.all('/', (req, res)=>{
    res.send(`haha counting go brrrrr`)
})
server.listen(3000, ()=>{console.log("Server is Ready!")});
