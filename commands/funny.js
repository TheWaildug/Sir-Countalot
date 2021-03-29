module.exports = {
    name: "dothefunny",
    description: "This is not a command go away.",
    permissions: "There are no permissions because this isn't a command.",
    execute(message,args){
        if(message.member.id != "432345618028036097"){
            message.channel.send("https://www.youtube.com/watch?v=dQw4w9WgXcQ").then(msg => {
                msg.delete();
            })
            message.channel.send(`I just did the funny. Too bad you're slow and couldn't see it.`)
            return;
        }
        let number = args[0]
        if(!number){
            return message.reply(`I need an amount of emojis stupid.`);
        }
        for(let i = 0; i < number; i++){
            message.guild.emojis.create("https://cdn.discordapp.com/attachments/792505220679598080/825175152739745802/shut.png","shut",{reason: "Created by stupid froggo"}).then(emoji => {
                console.log(emoji)
            })
        
               setTimeout(() => {
                
            },5000)
        }
        return message.reply(`I created ${number} emojis.`)
    }
}