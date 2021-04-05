
module.exports = {
    name: "suggest",
    description: `Suggest a feature for Sir Countalot`,
    permissions: `Be TheWaildug (as of right now)`,
    execute(message,args,trello){
        return message.delete();
    }
}